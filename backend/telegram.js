import fetch from "node-fetch";

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL_USERNAME = process.env.CHANNEL_USERNAME;

if (!BOT_TOKEN || !CHANNEL_USERNAME) {
  console.error("❌ BOT_TOKEN or CHANNEL_USERNAME is missing");
}

export async function checkSubscription(userId) {
  try {
    const url =
      `https://api.telegram.org/bot${BOT_TOKEN}/getChatMember` +
      `?chat_id=${CHANNEL_USERNAME}&user_id=${userId}`;

    const res = await fetch(url);
    const data = await res.json();

    if (!data.ok) {
      console.error("Telegram API error:", data);
      return false;
    }

    const status = data.result.status;

    return (
      status === "member" ||
      status === "administrator" ||
      status === "creator"
    );
  } catch (e) {
    console.error("checkSubscription error", e);
    return false;
  }
}
