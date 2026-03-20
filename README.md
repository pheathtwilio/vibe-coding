# Twilio Verify OTP UI

A simple local web UI for sending and verifying OTP SMS via Twilio Verify.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file from the template:
   ```bash
   cp .env.example .env
   ```

3. Add your Twilio credentials to `.env`:
   ```
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   ```

4. Start the server:
   ```bash
   npm start
   ```

5. Open http://localhost:3000

On first run, a Twilio Verify Service is automatically created and the SID is saved to your `.env` file.

## Usage

- **Send OTP** — Enter a phone number in E.164 format (e.g. `+15551234567`) and click Send. The full Twilio API response is displayed.
- **Verify OTP** — Enter the code you received via SMS and click Verify. The response shows `status: "approved"` on success.

## License

MIT
