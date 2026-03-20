# Twilio Verify OTP UI — Design Spec

## Overview

A simple local web UI for sending and verifying OTP SMS via Twilio Verify. Plain HTML/CSS + Express backend, no build step.

## Architecture

```
Browser (plain HTML/CSS/JS)  →  Express API (localhost:3000)  →  Twilio Verify API
```

### Files

| File | Purpose |
|---|---|
| `server.js` | Express server with API routes and Verify Service provisioning |
| `public/index.html` | Single-page UI with inline CSS and JS |
| `.env` | Twilio credentials and cached Verify Service SID |
| `package.json` | Dependencies: express, twilio, dotenv |

## Backend — `server.js`

### Startup — Verify Service Provisioning

On first run, if `TWILIO_VERIFY_SERVICE_SID` is not set in `.env`, the server:

1. Creates a Verify Service via the Twilio API with friendly name `"vibe-coding-verify"`
2. Appends the resulting SID to `.env` as `TWILIO_VERIFY_SERVICE_SID=VA...`
3. Uses that SID for all subsequent requests

On subsequent runs, the existing SID from `.env` is used directly.

### Routes

| Route | Method | Request Body | Behavior |
|---|---|---|---|
| `/` | GET | — | Serves `public/index.html` |
| `/api/send-otp` | POST | `{ "to": "+15551234567" }` | Calls `verifications.create({ to, channel: 'sms' })`, returns full Twilio response JSON |
| `/api/verify-otp` | POST | `{ "to": "+15551234567", "code": "123456" }` | Calls `verificationChecks.create({ to, code })`, returns full Twilio response JSON |

Both API routes return the raw Twilio API response as JSON (success or error), with no transformation.

## Frontend — `public/index.html`

### Layout

Two side-by-side panels (stacked on narrow screens):

**Left panel — "Send OTP":**
- Phone number input (E.164 format placeholder: `+15551234567`)
- "Send" button
- Response display area: full Twilio JSON formatted with `JSON.stringify(data, null, 2)` in a `<pre>` block

**Right panel — "Verify OTP":**
- Phone number input (pre-filled from the send step)
- Code input (6 digits)
- "Verify" button
- Response display area: same formatted JSON display

### Styling

- Minimal clean CSS — light background, card-style panels
- Monospace font for JSON response output
- Green/red border on the response area based on success/failure

### JavaScript

- Inline `<script>` tag
- `fetch` calls to `/api/send-otp` and `/api/verify-otp`
- No frameworks or libraries

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `TWILIO_ACCOUNT_SID` | Yes | Twilio Account SID |
| `TWILIO_AUTH_TOKEN` | Yes | Twilio Auth Token |
| `TWILIO_VERIFY_SERVICE_SID` | No | Auto-created on first run if not set |

## Setup and Usage

```bash
npm install
# Create .env with TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN
node server.js
# Open http://localhost:3000
```
