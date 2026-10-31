import { expect, Page } from '@playwright/test';

export class ProfilePage {
  constructor(private readonly page: Page) {}

  async open(expectedName: string) {
    await this.page.getByRole('link', { name: 'View profile' }).click();
    await expect(this.page.getByText(expectedName).first()).toBeVisible();
  }

  async updateResumeHeadline(headline: string) {
    await this.page.getByRole('button', { name: 'Edit resume headline' }).click();
    const form = this.page.locator('form[name="resumeHeadlineForm"]');
    await expect(form.getByRole('heading', { name: 'Resume headline' })).toBeVisible();

    await this.page.getByRole('textbox', { name: 'Resume headline' }).fill(headline);
    await this.page.getByRole('button', { name: 'Save' }).click();
    await expect(this.page.locator('body')).toContainText('Profile updated successfully');
  }
}
