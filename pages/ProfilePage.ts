import { expect, Page } from '@playwright/test';

export class ProfilePage {
  constructor(private readonly page: Page) {}

  async open() {
    await this.page.getByRole('link', { name: 'View profile' }).click();
    await expect(this.page.getByRole('button', { name: 'Edit resume headline' })).toBeVisible();
  }

  // Toggles a trailing '.' on the existing headline so the profile counts as updated.
  async toggleHeadlineDot() {
    await this.page.getByRole('button', { name: 'Edit resume headline' }).click();
    const form = this.page.locator('form[name="resumeHeadlineForm"]');
    await expect(form.getByRole('heading', { name: 'Resume headline' })).toBeVisible();

    const box = this.page.getByRole('textbox', { name: 'Resume headline' });
    const current = (await box.inputValue()).trimEnd();
    expect(current, 'Existing headline should not be empty').not.toBe('');
    await box.fill(current.endsWith('.') ? current.slice(0, -1).trimEnd() : `${current}.`);
    await this.page.getByRole('button', { name: 'Save' }).click();
    await expect(this.page.locator('body')).toContainText('Profile updated successfully');
  }
}
