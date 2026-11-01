function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name} (see .env.example)`);
  return value;
}

export const config = {
  get username() { return required('NAUKRI_USERNAME'); },
  get password() { return required('NAUKRI_PASSWORD'); },
};
