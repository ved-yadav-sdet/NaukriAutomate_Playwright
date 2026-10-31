function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name} (see .env.example)`);
  return value;
}

export const config = {
  get username() { return required('NAUKRI_USERNAME'); },
  get password() { return required('NAUKRI_PASSWORD'); },
  get profileName() { return required('NAUKRI_PROFILE_NAME'); },
  get headline() { return required('NAUKRI_HEADLINE'); },
};

// Naukri only refreshes "last updated" when the headline actually changes, so
// alternate a trailing period on every run. Runs happen 3x/day (see workflow),
// so consecutive run numbers (day * 3 + slot) always differ in parity.
export function headlineForToday(base: string): string {
  const now = new Date();
  const slot = now.getUTCHours() < 6 ? 0 : now.getUTCHours() < 10 ? 1 : 2;
  const run = Math.floor(now.getTime() / 86_400_000) * 3 + slot;
  const trimmed = base.replace(/\.+$/, '');
  return run % 2 === 0 ? trimmed : `${trimmed}.`;
}
