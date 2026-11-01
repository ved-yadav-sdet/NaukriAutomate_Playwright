import fs from 'fs';
import { test } from '@playwright/test';
import { ResumePage } from '../pages/ResumePage';
import { runJob } from '../utils/runJob';

test('re-upload Naukri resume', async ({ page }, testInfo) => {
  await runJob(page, 'Naukri resume re-uploaded', 'Your resume was downloaded and uploaded again.', async () => {
    const resume = new ResumePage(page);
    await resume.open();
    const dir = testInfo.outputPath('resume');
    try {
      await resume.upload(await resume.download(dir));
    } finally {
      // The resume contains personal data, so never leave it on disk or in CI artifacts.
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
