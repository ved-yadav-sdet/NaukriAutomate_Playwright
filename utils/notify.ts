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

// A failing notification never breaks the run.
export async function notify(subject: string, message: string) {
  const time = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  try {
    await sendTelegram(`${subject}\n${message}\n${time}`);
  } catch (error) {
    console.warn('Notification failed:', error);
  }
}
