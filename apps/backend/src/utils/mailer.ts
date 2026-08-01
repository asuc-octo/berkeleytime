import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

const getTransporter = () => {
  if (!process.env.SMTP_HOST) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT ?? "587"),
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.SMTP_USER ?? "",
        pass: process.env.SMTP_PASSWORD ?? "",
      },
    });
  }
  return transporter;
};

export const sendSubscribeConfirmation = async (
  to: string,
  name: string,
  subject: string,
  courseNumber: string,
  sectionNumber: string,
  semester: string,
  year: number
) => {
  const mailer = getTransporter();
  if (!mailer) return;

  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER ?? "";
  const classLabel = `${subject} ${courseNumber} Section ${sectionNumber} (${semester} ${year})`;

  await mailer.sendMail({
    from,
    to,
    subject: `Subscribed to notifications for ${subject} ${courseNumber}`,
    html: `
      <p>Hi ${name},</p>
      <p>You're now subscribed to enrollment drop notifications for <strong>${classLabel}</strong>.</p>
      <p>You'll receive an email when all of the following are true:</p>
      <ul>
        <li>The class is at least 80% full</li>
        <li>Enrollment drops by at least 5%</li>
        <li>At least 3 spots open up</li>
      </ul>
      <p>To unsubscribe, go to the class page on <a href="https://berkeleytime.com">Berkeleytime</a> and click the bell icon again.</p>
    `,
  });
};

export const sendUnsubscribeConfirmation = async (
  to: string,
  name: string,
  subject: string,
  courseNumber: string,
  sectionNumber: string,
  semester: string,
  year: number
) => {
  const mailer = getTransporter();
  if (!mailer) return;

  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER ?? "";
  const classLabel = `${subject} ${courseNumber} Section ${sectionNumber} (${semester} ${year})`;

  await mailer.sendMail({
    from,
    to,
    subject: `Unsubscribed from notifications for ${subject} ${courseNumber}`,
    html: `
      <p>Hi ${name},</p>
      <p>You've been unsubscribed from enrollment drop notifications for <strong>${classLabel}</strong>.</p>
      <p>You won't receive any further notifications for this class.</p>
      <p>You can re-subscribe anytime from the class page on <a href="https://berkeleytime.com">Berkeleytime</a>.</p>
    `,
  });
};
