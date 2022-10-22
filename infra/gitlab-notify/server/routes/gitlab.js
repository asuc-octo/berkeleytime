// https://discordjs.guide/popular-topics/webhooks.html#using-webhooks

import AU from "ansi_up";
import axios from "axios";
import express from "express";
import nodemailer from "nodemailer";
import Discord from "discord.js";

const ansi_up = new AU.default();

const {
  PASSWORD_BT_GITLAB_SENDGRID_SMTP,
  USERNAME_BT_GITLAB_SENDGRID_SMTP,
  GITLAB_DOMAIN,
  GITLAB_PROJECT_BT_ACCESS_TOKEN,
  DISCORD_WEBHOOK_URL,
} = process.env;

const quoteCache = {};
const alreadyPosted = {};
const avatarURL = "https://i.imgur.com/5TI5N3Q.png";
const webhookClient = new Discord.WebhookClient(
  Discord.parseWebhookURL(DISCORD_WEBHOOK_URL)
);

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

const today = () => {
  const ts = new Date(Date.now());
  const today = `${ts.getFullYear().toString()}${ts
    .getMonth()
    .toString()
    .padStart(2, "0")}${ts.getDate().toString().padStart(2, "0")}`;
  return today;
};

const inspire = async () => {
  const day = today();
  let message;
  if (quoteCache[day]) {
    console.log(`Cache hit for '${day}'`);
    message = `"${quoteCache[day].quote}" —${quoteCache[day].author}`;
  } else {
    try {
      const {
        data: {
          contents: { quotes },
        },
      } = await axios.get(`https://quotes.rest/qod.json?category=inspire`);
      const { quote, author } = quotes[0];
      if (quote && author) {
        console.log(`Retrieve quote success: `, quotes[0]);
      }
      message = `"${quote}" —${author}`;
      quoteCache[day] = { quote, author };
    } catch (e) {
      console.error("Failed to get inspirational quote, using generic Oski...");
      message = `"did u know? 1 build failure = 1 extra budget cut to EECS program" —Oski🐻`;
    }
  }
  return message;
};

router.post("/fail", async (req, res) => {
  const {
    // Pipeline event payload https://docs.gitlab.com/ee/user/project/integrations/webhooks.html
    object_attributes,
    project,
    commit,
    builds,
  } = req.body;
  console.log(req.body);
  const failureDetected = builds.some((build) => build.status == "failed");
  if (!failureDetected) {
    return res.sendStatus(200);
  }
  const message = await inspire();
  const shortSha = commit.id.slice(0, 8);

  let html = `
  <h1>${message}</h1>
  <p style='color: red'>hi ${commit.author.name.toLowerCase()}, looks like we failed to either build or deploy your branch</p>
  <p><b>BRANCH:</b> ${object_attributes.ref}</p>
  <p><b>COMMIT:</b> ${shortSha}</p>
  <p><b>MESSAGE:</b> ${commit.message.trim()}</p><br>`;
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
    from: '"Oski 🐻" <noreply@berkeleytime.com>',
    to: `"${commit.author.name}" ${commit.author.email}`,
    subject: `❌ Build branch '${object_attributes.ref}' pipeline #${
      object_attributes.id
    }, commit: '${commit.message.trim()}'`,
    html: `${html}`,
  };
  console.log(sendMail);

  const day = today();
  if (!(day in alreadyPosted)) {
    await webhookClient.send({
      username: "Oski",
      content: message,
      avatarURL,
    });
    alreadyPosted[day] = true;
  }
  await webhookClient.send({
    username: "Oski",
    content: `❌ ${commit.author.name} => ${
      object_attributes.ref
    } (${shortSha}: ${commit.message.trim()}) ==> pipeline #${
      object_attributes.id
    }`,
    avatarURL,
    files: [
      {
        attachment: Buffer.from(html),
        name: `pipeline_${object_attributes.id}.html`,
      },
    ],
  });

  // await transporter.sendMail(sendMail);
  return res.sendStatus(200);
});

router.post("/deployment", async (req, res) => {
  const {
    // Deployment event payload
    // https://docs.gitlab.com/ee/user/project/integrations/webhooks.html
    // https://docs.gitlab.com/ee/api/deployments.html
    environment,
    project,
    ref,
    short_sha,
    status,
  } = req.body;
  console.log(req.body);
  const { author_name, message } = (
    await axios.get(
      `${GITLAB_DOMAIN}/api/v4/projects/${project.id}/repository/commits/${short_sha}`,
      {
        headers: {
          "PRIVATE-TOKEN": GITLAB_PROJECT_BT_ACCESS_TOKEN,
        },
      }
    )
  ).data;
  if (environment == "prod") {
    if (status == "running") {
      await webhookClient.send({
        username: "Oski",
        content: `We're deploying commit ${short_sha} to production, OMG ${author_name.toUpperCase()} I'M SO STRESSED, FINGERS CROSSED!!!🤞`,
        avatarURL,
      });
    } else if (status == "success") {
      await webhookClient.send({
        username: "Oski",
        content: `It worked ${author_name}! WE DEPLOYED COMMIT ${short_sha} TO PROD! GO BEARS🐻🎉\n...actually let's manually double check, just to be safe`,
        avatarURL,
      });
    } else if (status == "failed") {
      await webhookClient.send({
        username: "Oski",
        content: `😭Sorry ${author_name}, we did our best to deploy ${short_sha} to prod, but we fucked up and now Stanford🌲 gets 1 more Big Game win`,
        avatarURL,
      });
    }
  } else {
    if (status == "success") {
      await webhookClient.send({
        username: "Oski",
        content: `✅ ${author_name} => ${ref} (${short_sha}: ${message.trim()}) ==> https://${
          ref == "master" ? "staging" : ref
        }.berkeleytime.com`,
        avatarURL,
      });
    }
  }
  return res.sendStatus(200);
});

export default router;
