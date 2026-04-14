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

const sendWhatsApp = async ({ to, text }) => {
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const apiUrl = process.env.WHATSAPP_API_URL || (phoneId ? `https://graph.facebook.com/v17.0/${phoneId}/messages` : '');
  if (!apiUrl || !token || !to) {
    console.log('[Notification] WhatsApp not configured or destination missing, skipping:', to);
    return;
  }

  const payload = {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body: text },
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = await response.text();
      console.warn('[Notification] WhatsApp send failed', response.status, body);
    }
  } catch (err) {
    console.warn('[Notification] WhatsApp send error', err.message);
  }
};

module.exports = { sendEmail, sendWhatsApp };
