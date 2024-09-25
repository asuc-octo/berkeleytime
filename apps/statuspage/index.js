import axios from "axios";
import express from "express";
import { readFile } from "fs/promises";
import { setInterval } from "timers/promises";
import http from "http";
import https from "https";
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
 * export ADDRESS=
 * gcloud dns record-sets delete --zone berkeleytime --type A status.berkeleytime.com
 * gcloud dns record-sets delete --zone berkeleytime --type A *.status.berkeleytime.com
 * gcloud dns record-sets create status.berkeleytime.com --type A --ttl 300 --zone berkeleytime --rrdatas 34.82.91.206
 * gcloud dns record-sets create *.status.berkeleytime.com --type A --ttl 300 --zone berkeleytime --rrdatas 34.82.91.206
 *
 * TODO:
 * pull certificate + key every x amount of days and then restart server
 */

/* redirect status.berkeleytime.com to statuspage.io ************************ */
const cert = await readFile("bt-tls.cert");
const key = await readFile("bt-tls.key");
const app = express();
app.use((req, res) => {
  console.log(`${req.ip} redirect to https://berkeleytime.statuspage.io`);
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

/* update berkeleytime.statuspage.io **************************************** */
import {
  PORT_EXPRESS_HTTP,
  PORT_EXPRESS_HTTPS,
  STATUS_DEGRADED_PERFORMANCE,
  STATUS_OPERATIONAL,
  STATUS_MAJOR_OUTAGE,
} from "./config.js";
import spConfig from "./config.statuspage.json";

axios.defaults.headers["Authorization"] = `OAuth ${spConfig.apiKey}`;

const updateStatuspage = async (ping, auth) => {
  const { pageId } = spConfig;
  const { componentId, metricId } = auth;
  const statusUrl = `https://api.statuspage.io/v1/pages/${pageId}`;

  try {
    const start = Date.now();
    await ping();
    const responseTime = Date.now() - start;

    if (metricId) {
      await axios.post(`${statusUrl}/metrics/${metricId}/data`, {
        data: {
          timestamp: Math.floor(start / 1000),
          value: responseTime,
        },
      });
    }

    let status;
    if (metricId && responseTime > 2000) {
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
};

for await (const _ of setInterval(spConfig.statusInterval * 1000)) {
  const { apiStatus, frontendStatus, gitlabStatus, elasticsearchStatus, url } =
    spConfig;
  const niceTime = () =>
    moment().tz("America/Los_Angeles").format(`YYYY-MM-DD HH:mm:ss dddd`);
  await updateStatuspage(async () => {
    await axios.post(`${url}/api/graphql`, {
      query: "query PingQuery{ ping }",
    });
    console.log(`${niceTime()} successful ping for /api/graphql`);
  }, apiStatus);

  await updateStatuspage(async () => {
    await axios.get(`${url}/landing`);
    console.log(`${niceTime()} successful ping for /landing`);
  }, frontendStatus);

  await updateStatuspage(async () => {
    if (
      !(await axios.get(`${url}/git`)).request.res.responseUrl.includes(
        "sign_in"
      )
    ) {
      throw Error("expected sign-in page");
    }
    console.log(`${niceTime()} successful ping for /git`);
  }, gitlabStatus);

  await updateStatuspage(async () => {
    try {
      await axios.get(`${url}/kibana`);
      throw Error("expected 401 Unauthorized");
    } catch (err) {
      if (err.response && err.response.status == 401) {
        console.log(`${niceTime()} successful ping for /kibana`);
      } else {
        throw err;
      }
    }
  }, elasticsearchStatus);
}
/* **************************************** update berkeleytime.statuspage.io */
