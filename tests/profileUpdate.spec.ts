import { test } from '@playwright/test';
import { ProfilePage } from '../pages/ProfilePage';
import { runJob } from '../utils/runJob';

test('update Naukri resume headline', async ({ page }) => {
  await runJob(page, 'Naukri headline updated', 'Your resume headline was updated successfully.', async () => {
    const profile = new ProfilePage(page);
    await profile.open();
    await profile.toggleHeadlineDot();
  });
});
