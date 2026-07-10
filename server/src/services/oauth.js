const { google } = require('googleapis');
const prisma = require('../lib/prisma');

const REDIRECT_URI = 'http://localhost:3001/api/admin/oauth/callback';
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
];

async function getOAuthConfig() {
  const rows = await prisma.siteContent.findMany({
    where: { key: { in: ['oauth_client_id', 'oauth_client_secret', 'oauth_access_token', 'oauth_refresh_token', 'oauth_email'] } }
  });
  return Object.fromEntries(rows.map(r => [r.key.replace('oauth_', ''), r.value]));
}

async function saveConfig(key, value) {
  await prisma.siteContent.upsert({
    where: { key: `oauth_${key}` },
    update: { value },
    create: { key: `oauth_${key}`, value, label: key, section: 'oauth' },
  });
}

function createClient(clientId, clientSecret) {
  return new google.auth.OAuth2(clientId, clientSecret, REDIRECT_URI);
}

async function getAuthUrl(clientId, clientSecret) {
  const client = createClient(clientId, clientSecret);
  return client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });
}

async function exchangeCode(code) {
  const cfg = await getOAuthConfig();
  const client = createClient(cfg.client_id, cfg.client_secret);
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);

  const oauth2 = google.oauth2({ version: 'v2', auth: client });
  const { data } = await oauth2.userinfo.get();

  await saveConfig('access_token', tokens.access_token);
  if (tokens.refresh_token) await saveConfig('refresh_token', tokens.refresh_token);
  await saveConfig('email', data.email);

  return { email: data.email };
}

async function getAuthorizedClient() {
  const cfg = await getOAuthConfig();
  if (!cfg.client_id || !cfg.access_token) throw new Error('Gmail not connected');
  const client = createClient(cfg.client_id, cfg.client_secret);
  client.setCredentials({ access_token: cfg.access_token, refresh_token: cfg.refresh_token });
  return { client, email: cfg.email };
}

async function sendEmail({ to, subject, html }) {
  const { client, email } = await getAuthorizedClient();
  const gmail = google.gmail({ version: 'v1', auth: client });
  const raw = Buffer.from(
    `From: TG Golf Carts <${email}>\r\nTo: ${to}\r\nSubject: ${subject}\r\nContent-Type: text/html; charset=utf-8\r\n\r\n${html}`
  ).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  await gmail.users.messages.send({ userId: 'me', requestBody: { raw } });
}

module.exports = { getOAuthConfig, saveConfig, getAuthUrl, exchangeCode, getAuthorizedClient, sendEmail };
