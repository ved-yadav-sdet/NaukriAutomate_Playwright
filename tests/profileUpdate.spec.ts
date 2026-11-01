import fs from 'fs';
import { test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ProfilePage } from '../pages/ProfilePage';
import { config } from '../utils/config';
import { notify } from '../utils/notify';

const hasSession = fs.existsSync('auth.json');

test('update Naukri resume headline', async ({ page }) => {
  try {
    const loginPage = new LoginPage(page);
    const sessionOk = hasSession && (await loginPage.isSessionValid());
    if (!sessionOk) {
      if (hasSession) console.warn('Saved session is invalid or expired; falling back to password login.');
      await loginPage.login(config.username, config.password);
    }

    const profile = new ProfilePage(page);
    await profile.open();
    await profile.toggleHeadlineDot();
  } catch (error) {
    const body = (await page.locator('body').innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 300);
    const details = `URL: ${page.url()}\nTitle: ${await page.title().catch(() => '')}\nPage text: ${body}`;
    console.log(details);
    await page.screenshot({ path: 'test-results/failure.png', fullPage: true }).catch(() => {});
    const hint = hasSession ? '\nSession may have expired: run "npm run save-session" and update the NAUKRI_AUTH secret.' : '';
    await notify('❌ Naukri profile update FAILED', `${String(error).slice(0, 300)}\n${details}${hint}`);
    throw error;
  }
  await notify('✅ Naukri profile updated', 'Your resume headline was updated successfully.');
});
