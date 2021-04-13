import axios from "axios";
import express from "express";
import { readFile } from "fs/promises";
import http from "http";
import https from "https";
import interval from "interval-promise";
import moment from "moment-timezone";

/**
 * this service lives outside of Kubernetes
 *
 * because this exists independent of Kubernetes, the cert loading process is
 * manual
 *
 * to manually pull certificates from k8s:
 * kubectl get secrets/bt-tls --template='{{index .data "tls.crt"}}' | base64 --decode > bt-tls.cert
 * kubectl get secrets/bt-tls --template='{{index.data "tls.key"}}' | base64 --decode > bt-tls.key
 *
 * to create a DNS A record for status.berkeleytime.com
 * export ADDRESS=34.82.91.206
 * gcloud dns record-sets transaction start --project berkeleytime-218606 --zone berkeleytime
 * gcloud dns record-sets transaction add --project berkeleytime-218606 --zone berkeleytime --name berkeleytime.com --ttl 300 --type A $ADDRESS
 * gcloud dns record-sets transaction execute --project berkeleytime-218606 --zone berkeleytime
 *
 * TODO:
 * pull certificate + key every x amount of days and then restart server
 */
const cert = await readFile("bt-tls.cert");
const key = await readFile("bt-tls.key");

import {
  PORT_EXPRESS_HTTP,
  PORT_EXPRESS_HTTPS,
  STATUS_DEGRADED_PERFORMANCE,
  STATUS_OPERATIONAL,
  STATUS_MAJOR_OUTAGE,
} from "./config.js";
import spConfig from "./config.statuspage.json";

axios.defaults.headers["Authorization"] = `OAuth ${spConfig.apiKey}`;

/* update berkeleytime.statuspage.io **************************************** */
async function updateStatuspage(ping, auth) {
  const { pageId, metridId } = spConfig;
  const { componentId, metricId } = auth;
  const statusUrl = `https://api.statuspage.io/v1/pages/${pageId}`;

  try {
    let start = Date.now();
    await ping();
    let responseTime = Date.now() - start;

    await axios.post(`${statusUrl}/metrics/${metricId}/data.json`, {
      data: {
        timestamp: Math.floor(start / 1000),
        value: responseTime,
      },
    });

    let status;
    if (responseTime > 2000) {
      status = STATUS_DEGRADED_PERFORMANCE;
    } else {
      status = STATUS_OPERATIONAL;
    }

    await axios.patch(`${statusUrl}/components/${componentId}`, {
      component: {
        status,
      },
    });
  } catch (err) {
    console.error(err);
    await axios.patch(`${statusUrl}/components/${componentId}`, {
      component: {
        status: STATUS_MAJOR_OUTAGE,
      },
    });
  }
}

// REST API check
// await updateStatuspage(async () => {
//   await axios.get(
//     `berkeleytime.com/api/catalog/catalog_json/course_box/?course_id=2321`
//   );
// }, spConfig.restStatus);

interval(async () => {
  const { apiStatus, statusInterval, frontendStatus, url } = spConfig;
  await updateStatuspage(async () => {
    await axios.post(`${url}/api/graphql`, {
      query: "query PingQuery{ ping }",
    });
  }, apiStatus);
  console.log(
    `${moment()
      .tz("America/Los_Angeles")
      .format()} successful ping for /api/graphql`
  );

  await updateStatuspage(async () => {
    await axios.get(`${url}/landing`);
  }, frontendStatus);
  console.log(
    `${moment()
      .tz("America/Los_Angeles")
      .format()} successful ping for /landing`
  );
}, spConfig.statusInterval * 100);
/* **************************************** update berkeleytime.statuspage.io */

/* redirect status.berkeleytime.com to statuspage.io ************************ */
const app = express();
const router = express.Router();
app.use((req, res) => {
  console.log(
    `${req.connection.remoteAddress} redirect to https://berkeleytime.statuspage.io`
  );
  res.redirect("https://berkeleytime.statuspage.io");
});
http.createServer(app).listen(PORT_EXPRESS_HTTP);
https
  .createServer(
    {
      key,
      cert,
    },
    app
  )
  .listen(PORT_EXPRESS_HTTPS);
console.log(
  `Server now listening on port ${PORT_EXPRESS_HTTP} and ${PORT_EXPRESS_HTTPS}`
);
/* ************************ redirect status.berkeleytime.com to statuspage.io */
