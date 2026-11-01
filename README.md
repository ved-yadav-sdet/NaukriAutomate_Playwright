# NaukriAutomate

Playwright automation that keeps your Naukri profile "fresh" by re-uploading your resume and toggling a trailing `.` on your resume headline (adds it if missing, removes it if present). It runs up to three times a day on GitHub Actions and sends a Telegram message on success or failure.

> Use at your own risk. Automating logins may be against Naukri's terms of service.

## How it works

1. Opens Naukri using a saved login session (`auth.json`). If the session is missing or expired it falls back to username and password.
2. Opens your profile and edits the resume headline: adds a `.` if it doesn't end with one, otherwise removes it.
3. Saves and checks for "Profile updated successfully".
4. A second test downloads your current resume and uploads the same file again (keeping its file name), which also refreshes the profile.
5. Sends a Telegram notification (✅ success or ❌ failure with the page URL, title and a hint).

Project layout:

```
pages/        LoginPage, ProfilePage, ResumePage (page objects)
tests/        profileUpdate.spec.ts (headline), resumeUpload.spec.ts (resume re-upload)
utils/        config.ts (env vars), notify.ts (Telegram), runJob.ts (login + notifications)
scripts/      save-session.js (creates auth.json for CI)
.github/workflows/playwright.yml   schedule: 09:15, 14:00, 16:45 IST
```

## Prerequisites

- Node.js 18+ (LTS recommended)
- Google Chrome installed (the config uses `channel: 'chrome'`)
- A Naukri account
- Optional: a Telegram account for notifications

## Local setup

```bash
git clone <your-repo-url>
cd NaukriAutomate
npm install
cp .env.example .env
```

Edit `.env`:

| Variable | Required | Description |
|---|---|---|
| `NAUKRI_USERNAME` | yes | Naukri login email |
| `NAUKRI_PASSWORD` | yes | Naukri password (fallback when the session expires) |
| `TELEGRAM_BOT_TOKEN` | no | Bot token from @BotFather |
| `TELEGRAM_CHAT_ID` | no | Your Telegram chat id |

Run it locally:

```bash
npm run update-all       # headline + resume re-upload
npm run update-profile   # headline only
npm run upload-resume    # resume re-upload only
```

The browser opens (headed Chrome is needed to avoid Naukri's bot blocking). View the report with `npm run report`.

## Telegram notifications (optional, free)

1. In Telegram, message **@BotFather** and send `/newbot`. Copy the token it gives you.
2. Open your new bot and send it any message, such as "hi".
3. Open `https://api.telegram.org/bot<TOKEN>/getUpdates` and copy the number at `"chat":{"id":...`.
4. Put the token and chat id in `.env`.

Leave both blank to disable notifications.

## Running on GitHub Actions

GitHub's servers are not trusted by Naukri, so a password login there usually triggers an OTP. Avoid it by logging in locally and reusing that session.

1. **Create the session** (on your own machine, where login works without an OTP):
   ```bash
   npm run save-session
   ```
   This creates `auth.json` and `auth.b64` (both git-ignored). Complete an OTP or captcha by hand in the browser if prompted.
2. **Make the repo private** (Settings → General → Danger zone → Change visibility).
3. **Add repository secrets** (Settings → Secrets and variables → Actions):

   | Secret | Value |
   |---|---|
   | `NAUKRI_AUTH` | Contents of `auth.b64` (macOS: `pbcopy < auth.b64`) |
   | `NAUKRI_USERNAME` | Naukri email |
   | `NAUKRI_PASSWORD` | Naukri password |
   | `TELEGRAM_BOT_TOKEN` | Optional |
   | `TELEGRAM_CHAT_ID` | Optional |

4. Push to GitHub and run it once from the **Actions** tab (**Run workflow**). After that it follows the schedule.

### Schedule

Cron uses UTC. The defaults in `playwright.yml` are:

| IST | UTC cron | Job |
|---|---|---|
| 08:45 | `15 3 * * *` | Resume re-upload (once a day) |
| 09:00 | `30 3 * * *` | Headline dot toggle |
| 13:45 | `15 8 * * *` | Headline dot toggle |
| 16:45 | `0 11 * * *` | Headline dot toggle |

Manual runs (**Run workflow**) let you choose `all`, `headline` or `resume`.

GitHub may start scheduled runs 5–30 minutes late.

## Troubleshooting

- **Access Denied on naukri.com**: Naukri blocks headless or default Playwright browsers. Keep `headless: false` and `channel: 'chrome'` in `playwright.config.ts`.
- **Run fails on GitHub but works locally**: the saved session probably expired or was rejected. Run `npm run save-session` again and update the `NAUKRI_AUTH` secret.
- **OTP requested on GitHub**: expected when the session is not accepted. Refresh the session as above, or run the job on your own always-on machine (self-hosted runner, or `launchd`/`cron`).
- **See what failed**: open the failed run, download the `playwright-report` artifact, and look in `test-results/` for `video.webm`, the screenshot and `trace.zip`. Open a trace with `npx playwright show-trace <path>/trace.zip`.
- **Missing environment variable error**: check `.env` locally, or the repository secrets on GitHub.

## Security notes

- Never commit `.env`, `auth.json` or `auth.b64` (already in `.gitignore`).
- `auth.json` gives full access to your Naukri account. Store it only as a secret.
- Keep the repo private, and rotate your password and bot token if they were ever exposed.
