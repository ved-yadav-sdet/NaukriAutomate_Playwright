import { test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ProfilePage } from '../pages/ProfilePage';
import { config, headlineForToday } from '../utils/config';
import { notify } from '../utils/notify';

test('update Naukri resume headline', async ({ page }) => {
  try {
    await new LoginPage(page).login(config.username, config.password);

    const profile = new ProfilePage(page);
    await profile.open(config.profileName);
    await profile.updateResumeHeadline(headlineForToday(config.headline));
  } catch (error) {
    const body = (await page.locator('body').innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 300);
    const details = `URL: ${page.url()}\nTitle: ${await page.title().catch(() => '')}\nPage text: ${body}`;
    console.log(details);
    await page.screenshot({ path: 'test-results/failure.png', fullPage: true }).catch(() => {});
    await notify('❌ Naukri profile update FAILED', `${String(error).slice(0, 300)}\n${details}`);
    throw error;
  }
  await notify('✅ Naukri profile updated', 'Your resume headline was updated successfully.');
});
