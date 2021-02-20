import * as k8s from "@kubernetes/client-node";
import axios from "axios";
import crypto from "crypto";
import express from "express";

const router = express.Router();

const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const apps = kc.makeApiClient(k8s.AppsV1Api);
const core = kc.makeApiClient(k8s.CoreV1Api);
const networking = kc.makeApiClient(k8s.NetworkingV1Api);

const {
  GITHUB_NOTIFY_SECRET_TOKEN,
  GITLAB_DOMAIN,
  GITLAB_PROJECT_BT_ACCESS_TOKEN,
} = process.env;
const NS = "default";
const SIGNATURE_HEADER = "X-Hub-Signature";
const GITLAB_PROJECT_ID = 35;

const verifyPostData = (req, res, next) => {
  // "Verify GitHub webhook signature header in Node.js"
  // https://gist.githubusercontent.com/stigok/57d075c1cf2a609cb758898c0b202428/raw/f6eb21a416af7aad99982015f8d12c35c33bb758/githook.js
  // Using the Kubernetes JavaScript Client Library
  // https://blog.codewithdan.com/using-the-kubernetes-javascript-client-library/
  const payload = JSON.stringify(req.body);
  if (!payload) {
    return next("Request body empty");
  }
  const sig = req.get(SIGNATURE_HEADER) || "";
  const hmac = crypto.createHmac("sha1", GITHUB_NOTIFY_SECRET_TOKEN);
  const digest = Buffer.from(
    `sha1=${hmac.update(payload).digest("hex")}`,
    "utf8"
  );
  const checksum = Buffer.from(sig, "utf8");
  if (
    checksum.length !== digest.length ||
    !crypto.timingSafeEqual(digest, checksum)
  ) {
    return next(
      `Request body digest (${digest}) did not match ${SIGNATURE_HEADER} (${checksum})`
    );
  }
  return next();
};

router.post("/delete", verifyPostData, async (req, res) => {
  const {
    // Delete branch payload https://developer.github.com/webhooks/event-payloads
    ref,
    ref_type,
  } = req.body;
  console.log(req.body);
  if (ref_type != "branch") {
    return res.sendStatus(200);
  }
  try {
    await Promise.all([
      apps.deleteNamespacedDeployment(`bt-backend-dev-${ref}`, NS),
      apps.deleteNamespacedDeployment(`bt-frontend-dev-${ref}`, NS),
      core.deleteNamespacedSecret(`bt-backend-dev-${ref}`, NS),
      core.deleteNamespacedService(`bt-backend-dev-${ref}`, NS),
      core.deleteNamespacedService(`bt-frontend-dev-${ref}`, NS),
      networking.deleteNamespacedIngress(
        `bt-ingress-tricycle-backend-dev-${ref}`,
        NS
      ),
      networking.deleteNamespacedIngress(
        `bt-ingress-tricycle-frontend-dev-${ref}`,
        NS
      ),
    ]);
  } catch (e) {
    console.error(e);
  }
  try {
    await axios.delete(
      `${GITLAB_DOMAIN}/api/v4/projects/${GITLAB_PROJECT_ID}/repository/branches/${ref}`,
      {
        headers: {
          "PRIVATE-TOKEN": GITLAB_PROJECT_BT_ACCESS_TOKEN,
        },
      }
    );
  } catch (e) {
    console.error(e);
  }
  return res.sendStatus(200);
});

export default router;
