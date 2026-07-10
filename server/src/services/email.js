const nodemailer = require('nodemailer');
const prisma = require('../lib/prisma');

async function getEmailConfig() {
  const rows = await prisma.siteContent.findMany({
    where: { key: { in: ['email_gmail_user', 'email_gmail_password'] } }
  });
  const map = Object.fromEntries(rows.map(r => [r.key, r.value]));
  return { user: map.email_gmail_user, pass: map.email_gmail_password };
}

async function saveEmailConfig(user, pass) {
  for (const [key, value] of [['email_gmail_user', user], ['email_gmail_password', pass]]) {
    await prisma.siteContent.upsert({
      where: { key },
      update: { value },
      create: { key, value, label: key, section: 'email' },
    });
  }
}

async function createTransporter() {
  const { user, pass } = await getEmailConfig();
  if (!user || !pass) throw new Error('Email not configured');
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
}

async function sendEmail({ to, subject, html, text }) {
  const { user } = await getEmailConfig();
  const transporter = await createTransporter();
  return transporter.sendMail({ from: `TG Golf Carts <${user}>`, to, subject, html, text });
}

async function testConnection() {
  const transporter = await createTransporter();
  await transporter.verify();
}

module.exports = { getEmailConfig, saveEmailConfig, sendEmail, testConnection };
