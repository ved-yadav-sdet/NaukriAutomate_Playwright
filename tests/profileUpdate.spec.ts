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
    await notify('❌ Naukri profile update FAILED', String(error).slice(0, 500));
    throw error;
  }
  await notify('✅ Naukri profile updated', 'Your resume headline was updated successfully.');
});
