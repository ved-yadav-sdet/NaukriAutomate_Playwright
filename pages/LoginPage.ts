import { expect, Page } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async login(username: string, password: string) {
    await this.page.goto('https://www.naukri.com/');
    await this.page.getByRole('link', { name: 'Login' }).click();

    const user = this.page.getByRole('textbox', { name: 'Email ID / Username' });
    await expect(user).toBeVisible();
    await user.fill(username);
    await this.page.getByRole('textbox', { name: 'Password' }).fill(password);
    await this.page.getByRole('button', { name: 'Login', exact: true }).click();

    await expect(this.page.getByRole('link', { name: 'View profile' })).toBeVisible();
  }
}
