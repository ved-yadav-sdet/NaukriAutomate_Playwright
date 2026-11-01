import fs from 'fs';
import path from 'path';
import { expect, Page } from '@playwright/test';

export class ResumePage {
  constructor(private readonly page: Page) {}

  private get currentName() {
    return this.page.locator('#lazyAttachCV .resume-name-inline .truncate');
  }

  async open() {
    await this.page.goto('https://www.naukri.com/mnjuser/profile');
    await expect(this.currentName).toBeVisible({ timeout: 20_000 });
  }

  // Downloads the current resume into dir, keeping the name shown on the profile.
  async download(dir: string): Promise<string> {
    const name = ((await this.currentName.getAttribute('title')) ?? 'Resume.pdf').trim();
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.page.getByRole('button', { name: 'Download resume' }).click(),
    ]);

    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, name);
    await download.saveAs(file);
    expect(fs.statSync(file).size, 'Downloaded resume should not be empty').toBeGreaterThan(1024);
    return file;
  }

  async upload(file: string) {
    await this.page.locator('#attachCV').setInputFiles(file);
    await expect(this.page.locator('body')).toContainText('Resume has been successfully uploaded', {
      timeout: 30_000,
    });
  }
}
