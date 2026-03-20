require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const twilio = require('twilio');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;

let verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

async function ensureVerifyService() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    console.error('Missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN in .env');
    process.exit(1);
  }

  const client = twilio(accountSid, authToken);

  if (!verifyServiceSid) {
    console.log('Creating Twilio Verify Service...');
    const service = await client.verify.v2.services.create({
      friendlyName: 'vibe-coding-verify',
    });
    verifyServiceSid = service.sid;

    // Append to .env file
    const envPath = path.join(__dirname, '.env');
    const line = `\nTWILIO_VERIFY_SERVICE_SID=${verifyServiceSid}\n`;
    fs.appendFileSync(envPath, line);
    console.log(`Verify Service created: ${verifyServiceSid}`);
  }

  return client;
}

let twilioClient;

app.post('/api/send-otp', async (req, res) => {
  try {
    const { to } = req.body;
    const verification = await twilioClient.verify.v2
      .services(verifyServiceSid)
      .verifications.create({ to, channel: 'sms' });
    res.json(verification);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message, code: err.code });
  }
});

app.post('/api/verify-otp', async (req, res) => {
  try {
    const { to, code } = req.body;
    const check = await twilioClient.verify.v2
      .services(verifyServiceSid)
      .verificationChecks.create({ to, code });
    res.json(check);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message, code: err.code });
  }
});

(async () => {
  twilioClient = await ensureVerifyService();
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
})();
