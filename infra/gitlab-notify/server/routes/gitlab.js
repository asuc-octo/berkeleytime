import AU from "ansi_up";
import axios from "axios";
import express from "express";
import nodemailer from "nodemailer";
const ansi_up = new AU.default();

const {
  PASSWORD_BT_GITLAB_SENDGRID_SMTP,
  USERNAME_BT_GITLAB_SENDGRID_SMTP,
  GITLAB_DOMAIN,
  GITLAB_PROJECT_BT_ACCESS_TOKEN,
} = process.env;

const router = express.Router();
const transporter = nodemailer.createTransport({
  host: "smtp.sendgrid.net",
  port: 587,
  secure: false,
  auth: {
    user: USERNAME_BT_GITLAB_SENDGRID_SMTP,
    pass: PASSWORD_BT_GITLAB_SENDGRID_SMTP,
  },
});
await transporter.verify();

router.post("/fail", async (req, res) => {
  const {
    // Pipeline event payload https://docs.gitlab.com/ee/user/project/integrations/webhooks.html
    object_kind,
    object_attributes,
    merge_request,
    user,
    project,
    commit,
    builds,
  } = req.body;
  console.log(req.body);
  const failureDetected = builds.some((build) => build.status == "failed");
  if (!failureDetected) {
    return res.sendStatus(200);
  }
  let html = `
  <h1 style='color: red'>You suck ${commit.author.name}</h1>
  <p>1 build failure = 1🏈 win to Stanford🌲</p>
  <p>- Oski💔😭</p>
  <p><b>BRANCH:</b> ${object_attributes.ref}</p>
  <p><b>COMMIT:</b> ${commit.id.slice(0, 8)}</p>
  <p><b>MESSAGE:</b> ${commit.message}</p><br>`;
  for (let build of builds) {
    if (build.status == "failed") {
      html += `
      <p><b>JOB #${build.id}</b></p>
      <p><b>BUILD NAME:</b> ${build.name}</p>
      <p><b>STARTED:</b> ${build.created_at}</p>
      <p><b>FINISHED:</b> ${build.finished_at}</p>
      <pre style='background-color: rgb(17, 17, 17); color: white'>${(
        await axios.get(
          `${GITLAB_DOMAIN}/api/v4/projects/${project.id}/jobs/${build.id}/trace`,
          {
            headers: {
              "PRIVATE-TOKEN": GITLAB_PROJECT_BT_ACCESS_TOKEN,
            },
          }
        )
      ).data
        .split("\n")
        .map((line) => ansi_up.ansi_to_html(line))
        .join("\n")}</pre><br>`;
    }
  }
  const sendMail = {
    from: '"Oski 🐻" <oski@berkeleytime.com>',
    to: `"${commit.author.name}" ${commit.author.email}`,
    subject: `❌ Build branch '${object_attributes.ref}' pipeline #${object_attributes.id}, commit: '${commit.message}'`,
    html: `${html}`,
  };
  console.log(sendMail);
  await transporter.sendMail(sendMail);
  return res.sendStatus(200);
});

router.post("/prod", async (req, res) => {
  const {
    // Deployment event payload
    // https://docs.gitlab.com/ee/user/project/integrations/webhooks.html
    // https://docs.gitlab.com/ee/api/deployments.html
    environment,
    project,
    short_sha,
    status,
  } = req.body;
  console.log(req.body);
  const slackWebhook = `https://hooks.slack.com/services/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`; // #berkeleytime
  const icon_url = "https://i.imgur.com/5TI5N3Q.png";
  if (environment != "prod") {
    return res.sendStatus(200);
  }
  const { author_name } = (
    await axios.get(
      `${GITLAB_DOMAIN}/api/v4/projects/${project.id}/repository/commits/${short_sha}`,
      {
        headers: {
          "PRIVATE-TOKEN": GITLAB_PROJECT_BT_ACCESS_TOKEN,
        },
      }
    )
  ).data;
  if (status == "running") {
    await axios.post(slackWebhook, {
      username: "Oski",
      text: `We're deploying commit ${short_sha} to production, OMG ${author_name.toUpperCase()} I'M SO STRESSED, FINGERS CROSSED!!!🤞`,
      icon_url,
    });
  } else if (status == "success") {
    await axios.post(slackWebhook, {
      username: "Oski",
      text: `It worked ${author_name}! WE DEPLOYED COMMIT ${short_sha} TO PROD! GO BEARS🐻🎉\n...actually let's manually double check, just to be safe`,
      icon_url,
    });
  } else if (status == "failed") {
    await axios.post(slackWebhook, {
      username: "Oski",
      text: `😭Sorry ${author_name}, we did our best to deploy ${short_sha} to prod, but we fucked up and now Stanford🌲 gets 1 more Big Game win`,
      icon_url,
    });
  }
  return res.sendStatus(200);
});

export default router;
