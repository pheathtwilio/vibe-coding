# Twilio Verify OTP UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local web UI for sending and verifying OTP SMS via Twilio Verify.

**Architecture:** Express server serves a single HTML page and exposes two API endpoints (`/api/send-otp`, `/api/verify-otp`). On first startup, the server auto-creates a Twilio Verify Service if one isn't configured. The frontend uses vanilla JS fetch calls to interact with the API and displays raw Twilio responses.

**Tech Stack:** Node.js, Express, Twilio Node SDK, dotenv, plain HTML/CSS/JS

**Spec:** `docs/superpowers/specs/2026-03-20-twilio-verify-ui-design.md`

---

## File Structure

| File | Responsibility |
|---|---|
| `package.json` | Project metadata, dependencies, start script |
| `.env.example` | Template showing required environment variables |
| `server.js` | Express server: Verify Service provisioning, API routes, static file serving |
| `public/index.html` | Single-page UI with inline CSS and JS for send/verify OTP flow |

---

### Task 1: Project Setup

**Files:**
- Create: `package.json`
- Create: `.env.example`

- [ ] **Step 1: Initialize package.json**

```json
{
  "name": "vibe-coding",
  "version": "1.0.0",
  "private": true,
  "description": "Simple UI for Twilio Verify OTP SMS",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "license": "MIT"
}
```

- [ ] **Step 2: Create .env.example**

```
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
# Auto-populated on first run:
# TWILIO_VERIFY_SERVICE_SID=VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

- [ ] **Step 3: Install dependencies**

Run: `npm install express twilio dotenv`

- [ ] **Step 4: Add .env to .gitignore**

Append `.env` to the existing `.gitignore` (it already has `.env` and `.env.*` entries — verify this is covered).

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json .env.example .gitignore
git commit -m "feat: initialize project with dependencies"
```

---

### Task 2: Express Server with Verify Service Provisioning

**Files:**
- Create: `server.js`

- [ ] **Step 1: Create server.js with provisioning and routes**

```javascript
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
```

- [ ] **Step 2: Smoke test — start server**

Run: `node server.js` (requires valid `.env` with Twilio credentials)
Expected: Server starts, creates Verify Service if needed, prints `Server running at http://localhost:3000`

- [ ] **Step 3: Commit**

```bash
git add server.js
git commit -m "feat: add Express server with Twilio Verify provisioning and API routes"
```

---

### Task 3: Frontend UI

**Files:**
- Create: `public/index.html`

- [ ] **Step 1: Create the single-page HTML file**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Twilio Verify OTP</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f5f5;
      padding: 2rem;
    }
    h1 {
      text-align: center;
      margin-bottom: 2rem;
      color: #333;
    }
    .container {
      display: flex;
      gap: 2rem;
      max-width: 900px;
      margin: 0 auto;
    }
    .panel {
      flex: 1;
      background: #fff;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .panel h2 {
      margin-bottom: 1rem;
      color: #444;
    }
    label {
      display: block;
      margin-bottom: 0.25rem;
      font-weight: 600;
      color: #555;
    }
    input {
      width: 100%;
      padding: 0.5rem;
      margin-bottom: 1rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }
    button {
      width: 100%;
      padding: 0.75rem;
      background: #0066ff;
      color: #fff;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
    }
    button:hover { background: #0052cc; }
    button:disabled { background: #999; cursor: not-allowed; }
    .response {
      margin-top: 1rem;
      padding: 1rem;
      border-radius: 4px;
      border: 2px solid #ddd;
      background: #fafafa;
      overflow-x: auto;
      display: none;
    }
    .response.success { border-color: #22c55e; }
    .response.error { border-color: #ef4444; }
    .response pre {
      font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
      font-size: 0.85rem;
      white-space: pre-wrap;
      word-break: break-word;
    }
    @media (max-width: 640px) {
      .container { flex-direction: column; }
    }
  </style>
</head>
<body>
  <h1>Twilio Verify OTP</h1>
  <div class="container">
    <div class="panel">
      <h2>Send OTP</h2>
      <label for="send-phone">Phone Number (E.164)</label>
      <input type="tel" id="send-phone" placeholder="+15551234567">
      <button id="send-btn">Send OTP</button>
      <div class="response" id="send-response"><pre></pre></div>
    </div>
    <div class="panel">
      <h2>Verify OTP</h2>
      <label for="verify-phone">Phone Number (E.164)</label>
      <input type="tel" id="verify-phone" placeholder="+15551234567">
      <label for="verify-code">Code</label>
      <input type="text" id="verify-code" placeholder="123456" maxlength="6">
      <button id="verify-btn">Verify</button>
      <div class="response" id="verify-response"><pre></pre></div>
    </div>
  </div>

  <script>
    const sendPhone = document.getElementById('send-phone');
    const sendBtn = document.getElementById('send-btn');
    const sendResponse = document.getElementById('send-response');
    const verifyPhone = document.getElementById('verify-phone');
    const verifyCode = document.getElementById('verify-code');
    const verifyBtn = document.getElementById('verify-btn');
    const verifyResponse = document.getElementById('verify-response');

    function showResponse(el, data, isSuccess) {
      el.style.display = 'block';
      el.className = 'response ' + (isSuccess ? 'success' : 'error');
      el.querySelector('pre').textContent = JSON.stringify(data, null, 2);
    }

    sendBtn.addEventListener('click', async () => {
      sendBtn.disabled = true;
      sendBtn.textContent = 'Sending...';
      try {
        const res = await fetch('/api/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: sendPhone.value }),
        });
        const data = await res.json();
        showResponse(sendResponse, data, res.ok);
        if (res.ok) {
          verifyPhone.value = sendPhone.value;
        }
      } catch (err) {
        showResponse(sendResponse, { error: err.message }, false);
      }
      sendBtn.disabled = false;
      sendBtn.textContent = 'Send OTP';
    });

    verifyBtn.addEventListener('click', async () => {
      verifyBtn.disabled = true;
      verifyBtn.textContent = 'Verifying...';
      try {
        const res = await fetch('/api/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: verifyPhone.value, code: verifyCode.value }),
        });
        const data = await res.json();
        const isSuccess = res.ok && data.status === 'approved';
        showResponse(verifyResponse, data, isSuccess);
      } catch (err) {
        showResponse(verifyResponse, { error: err.message }, false);
      }
      verifyBtn.disabled = false;
      verifyBtn.textContent = 'Verify';
    });
  </script>
</body>
</html>
```

- [ ] **Step 2: Test in browser**

Run: `node server.js`, open `http://localhost:3000`
Expected: Two-panel UI renders, both forms are interactive.

- [ ] **Step 3: Commit**

```bash
git add public/index.html
git commit -m "feat: add single-page UI for send and verify OTP"
```

---

### Task 4: End-to-End Test

- [ ] **Step 1: Manual E2E test**

1. Start server: `node server.js`
2. Open `http://localhost:3000`
3. Enter a real phone number in "Send OTP" panel, click Send
4. Verify the Twilio response JSON appears with `status: "pending"`
5. Enter the received SMS code in "Verify OTP" panel, click Verify
6. Verify the response JSON appears with `status: "approved"`
7. Try an incorrect code — verify response shows `status: "pending"` (not approved)

- [ ] **Step 2: Final commit if any fixes were needed**
