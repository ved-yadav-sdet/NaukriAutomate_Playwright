import nodemailer from 'nodemailer';

async function sendEmail(subject: string, text: string) {
  const { SMTP_USER, SMTP_PASS, NOTIFY_EMAIL_TO } = process.env;
  if (!SMTP_USER || !SMTP_PASS) return;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 465),
    secure: Number(process.env.SMTP_PORT || 465) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  await transporter.sendMail({
    from: SMTP_USER,
    to: NOTIFY_EMAIL_TO || SMTP_USER,
    subject,
    text,
  });
}

// Uses the free CallMeBot gateway: https://www.callmebot.com/blog/free-api-whatsapp-messages/
async function sendWhatsApp(text: string) {
  const { WHATSAPP_PHONE, WHATSAPP_APIKEY } = process.env;
  if (!WHATSAPP_PHONE || !WHATSAPP_APIKEY) return;

  const url =
    `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(WHATSAPP_PHONE)}` +
    `&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(WHATSAPP_APIKEY)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`WhatsApp API responded ${res.status}`);
}

async function sendTelegram(text: string) {
  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;

  const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text }),
  });
  if (!res.ok) throw new Error(`Telegram API responded ${res.status}`);
}

// Each channel is optional and a failing one never breaks the run.
export async function notify(subject: string, message: string) {
  const text = `${message}\n${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`;
  const results = await Promise.allSettled([
    sendEmail(subject, text),
    sendWhatsApp(`${subject}\n${text}`),
    sendTelegram(`${subject}\n${text}`),
  ]);
  results.forEach((r) => {
    if (r.status === 'rejected') console.warn('Notification failed:', r.reason);
  });
}
