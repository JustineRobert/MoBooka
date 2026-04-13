const express = require('express');
const { sendEmail } = require('../utils/notifications');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.post('/', asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: 'All contact fields are required.' });
  }

  const supportEmail = process.env.SUPPORT_EMAIL || process.env.EMAIL_FROM;
  const mailSubject = `[MoBooka Contact] ${subject}`;
  const text = `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`;
  const html = `<h2>MoBooka contact request</h2><p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Subject:</strong> ${subject}</p><p><strong>Message:</strong><br/>${message.replace(/\n/g, '<br/>')}</p>`;

  await sendEmail({ to: supportEmail, subject: mailSubject, text, html });

  res.json({ message: 'Your message was sent. We will reach out shortly.' });
}));

module.exports = router;
