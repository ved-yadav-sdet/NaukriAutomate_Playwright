import fs from 'fs';
import { Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { config } from './config';
import { notify } from './notify';

const hasSession = fs.existsSync('auth.json');

// Logs in (saved session first, password as fallback), runs the job, and sends a
// Telegram message on success or failure.
export async function runJob(
  page: Page,
  jobName: string,
  successMessage: string,
  job: () => Promise<void>,
) {
  try {
    const loginPage = new LoginPage(page);
    const sessionOk = hasSession && (await loginPage.isSessionValid());
    if (!sessionOk) {
      if (hasSession) console.warn('Saved session is invalid or expired; falling back to password login.');
      await loginPage.login(config.username, config.password);
    }
    await job();
  } catch (error) {
    const body = (await page.locator('body').innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 300);
    const details = `URL: ${page.url()}\nTitle: ${await page.title().catch(() => '')}\nPage text: ${body}`;
    console.log(details);
    await page.screenshot({ path: 'test-results/failure.png', fullPage: true }).catch(() => {});
    const hint = hasSession ? '\nSession may have expired: run "npm run save-session" and update the NAUKRI_AUTH secret.' : '';
    await notify(`❌ ${jobName} FAILED`, `${String(error).slice(0, 300)}\n${details}${hint}`);
    throw error;
  }
  await notify(`✅ ${jobName}`, successMessage);
}
