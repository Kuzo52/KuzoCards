/**
 * KuzoCards — Telegram /start welcome (Cloudflare Worker)
 */
const APP_URL = "https://kuzo52.github.io/KuzoCards/";
const WELCOME_HTML =
  "🚀 <b>Добро пожаловать в KuzoCards!</b>\n\n" +
  "Ультимативная карточная игра для твоих вечеринок прямо внутри Telegram. " +
  "Свайпай карточки, выполняй фановые задания и узнавай секреты друзей.\n\n" +
  "Жми кнопку «Играть» ниже и погнали! 👇\n\n" +
  'Made by <a href="https://t.me/kuzoceo">@kuzoceo</a>';

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      const token = env.BOT_TOKEN;
      if (!token) return json({ ok: false, error: "BOT_TOKEN missing" }, 500);

      // One-time setup: register webhook to this worker (Cloudflare → Telegram works)
      if (request.method === "GET" && url.pathname === "/setup") {
        const webhookUrl = `${url.origin}/`;
        const result = await telegram(token, "setWebhook", {
          url: webhookUrl,
          allowed_updates: ["message"],
          drop_pending_updates: true,
        });
        const info = await telegram(token, "getWebhookInfo", {});
        return json({ ok: true, webhookUrl, result, info });
      }

      if (request.method === "GET") {
        return json({ ok: true, service: "kuzocards-bot" });
      }

      if (request.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
      }

      const update = await request.json();
      const message = update.message || update.edited_message;
      if (!message?.chat?.id) return json({ ok: true });

      const text = String(message.text || "").trim();
      if (text === "/start" || text.startsWith("/start@") || text.startsWith("/start ")) {
        await telegram(token, "sendMessage", {
          chat_id: message.chat.id,
          text: WELCOME_HTML,
          parse_mode: "HTML",
          disable_web_page_preview: true,
          reply_markup: {
            inline_keyboard: [
              [{ text: "🎮 Играть", web_app: { url: APP_URL } }],
            ],
          },
        });
      }

      return json({ ok: true });
    } catch (err) {
      return json({ ok: false, error: String(err) }, 200);
    }
  },
};

async function telegram(token, method, body) {
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  });
  return res.json();
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
