// Logs in locally (trusted device, no OTP) and saves the session to auth.json.
// Run: npm run save-session
require('dotenv').config();
const fs = require('fs');
const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: false,
    args: ['--disable-blink-features=AutomationControlled'],
    ignoreDefaultArgs: ['--enable-automation'],
  });
  const context = await browser.newContext({ locale: 'en-IN', timezoneId: 'Asia/Kolkata' });
  const page = await context.newPage();

  await page.goto('https://www.naukri.com/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email ID / Username' }).fill(process.env.NAUKRI_USERNAME);
  await page.getByRole('textbox', { name: 'Password' }).fill(process.env.NAUKRI_PASSWORD);
  await page.getByRole('button', { name: 'Login', exact: true }).click();

  // 2 minutes to finish an OTP/captcha by hand if Naukri asks for one.
  await page.getByRole('link', { name: 'View profile' }).waitFor({ timeout: 120000 });

  await context.storageState({ path: 'auth.json' });
  fs.writeFileSync('auth.b64', fs.readFileSync('auth.json').toString('base64'));
  await browser.close();
  console.log('Saved auth.json and auth.b64. Copy the contents of auth.b64 into the NAUKRI_AUTH secret.');
})();
