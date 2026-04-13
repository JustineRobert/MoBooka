const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, text, html }) => {
  if (!process.env.SMTP_HOST) {
    console.log('[Notification] SMTP not configured, skipping email:', subject, to);
    return;
  }
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    text,
    html,
  });
};

module.exports = { sendEmail };
