/**
 * KuzoCards — Telegram bot + private stats (Durable Object store)
 */
const APP_URL = "https://kuzo52.github.io/KuzoCards/";
const WELCOME_HTML =
  "🚀 <b>Добро пожаловать в KuzoCards!</b>\n\n" +
  "Ультимативная карточная игра для твоих вечеринок прямо внутри Telegram. " +
  "Свайпай карточки, выполняй фановые задания и узнавай секреты друзей.\n\n" +
  "Жми кнопку «Играть» ниже и погнали! 👇\n\n" +
  'Made by <a href="https://t.me/kuzoceo">@kuzoceo</a>';

export class StatsDO {
  constructor(state) {
    this.state = state;
  }

  async fetch(request) {
    const url = new URL(request.url);
    const data = (await this.state.storage.get("data")) || {
      startsUnique: 0,
      startsTotal: 0,
      opensUnique: 0,
      opensTotal: 0,
      usersStart: {},
      usersOpen: {},
      recent: [],
    };

    if (url.pathname === "/read") {
      return Response.json({
        startsUnique: data.startsUnique,
        startsTotal: data.startsTotal,
        opensUnique: data.opensUnique,
        opensTotal: data.opensTotal,
        recent: data.recent || [],
      });
    }

    if (url.pathname === "/start" && request.method === "POST") {
      const body = await request.json();
      const id = String(body.id || "");
      data.startsTotal += 1;
      if (id && !data.usersStart[id]) {
        data.usersStart[id] = 1;
        data.startsUnique += 1;
        data.recent = [
          {
            id,
            name: body.name || "Без имени",
            username: body.username || "—",
            at: new Date().toISOString(),
          },
          ...(data.recent || []),
        ].slice(0, 30);
      }
      await this.state.storage.put("data", data);
      return Response.json({ ok: true });
    }

    if (url.pathname === "/open" && request.method === "POST") {
      const body = await request.json();
      const id = String(body.id || "anon");
      data.opensTotal += 1;
      if (id && !data.usersOpen[id]) {
        data.usersOpen[id] = 1;
        data.opensUnique += 1;
      }
      await this.state.storage.put("data", data);
      return Response.json({ ok: true });
    }

    return new Response("Not found", { status: 404 });
  }
}

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      const token = env.BOT_TOKEN;
      if (!token) return json({ ok: false, error: "BOT_TOKEN missing" }, 500);
      const stats = env.STATS_DO.get(env.STATS_DO.idFromName("main"));

      if (request.method === "GET" && url.pathname === "/stats") {
        if (!checkStatsKey(url, env)) return new Response("Forbidden", { status: 403 });
        const res = await stats.fetch("https://do/read");
        const data = await res.json();
        return html(statsPage(data, url.origin));
      }

      if (request.method === "GET" && url.pathname === "/stats.json") {
        if (!checkStatsKey(url, env)) return json({ ok: false, error: "Forbidden" }, 403);
        const res = await stats.fetch("https://do/read");
        const data = await res.json();
        return json({ ok: true, ...data });
      }

      if (request.method === "OPTIONS" && url.pathname === "/track") {
        return cors(new Response(null, { status: 204 }));
      }

      if (request.method === "POST" && url.pathname === "/track") {
        const body = await request.json().catch(() => ({}));
        await stats.fetch("https://do/open", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: String(body.uid || body.user_id || "anon") }),
        });
        return cors(json({ ok: true }));
      }

      if (request.method === "GET" && url.pathname === "/setup") {
        if (!checkStatsKey(url, env)) return json({ ok: false, error: "Forbidden" }, 403);
        const webhookUrl = `${url.origin}/`;
        const result = await telegram(token, "setWebhook", {
          url: webhookUrl,
          allowed_updates: ["message"],
          drop_pending_updates: false,
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
        const from = message.from || {};
        await stats.fetch("https://do/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: String(message.chat.id),
            name: [from.first_name, from.last_name].filter(Boolean).join(" ") || "Без имени",
            username: from.username ? `@${from.username}` : "—",
          }),
        });

        await telegram(token, "sendMessage", {
          chat_id: message.chat.id,
          text: WELCOME_HTML,
          parse_mode: "HTML",
          disable_web_page_preview: true,
          reply_markup: {
            inline_keyboard: [[{ text: "🎮 Играть", web_app: { url: APP_URL } }]],
          },
        });
      }

      return json({ ok: true });
    } catch (err) {
      return json({ ok: false, error: String(err) }, 200);
    }
  },
};

function checkStatsKey(url, env) {
  const key = env.STATS_KEY;
  if (!key) return false;
  return url.searchParams.get("key") === key;
}

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
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

function cors(res) {
  const headers = new Headers(res.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");
  return new Response(res.body, { status: res.status, headers });
}

function html(body) {
  return new Response(body, {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function statsPage(stats, origin) {
  const rows = (stats.recent || [])
    .map(
      (r) => `<tr>
      <td>${escapeHtml(r.name)}</td>
      <td>${escapeHtml(r.username)}</td>
      <td>${escapeHtml(new Date(r.at).toLocaleString("ru-RU"))}</td>
    </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>KuzoCards · Статистика</title>
  <style>
    :root { color-scheme: dark; --bg:#0a0a0b; --text:#f2f0eb; --muted:rgba(242,240,235,.5); --gold:#c8b89a; --card:#161618; --line:rgba(255,255,255,.08); }
    *{box-sizing:border-box;margin:0;padding:0}
    body{min-height:100vh;font-family:system-ui,sans-serif;background:radial-gradient(ellipse 70% 40% at 50% 0,rgba(200,184,154,.1),transparent 55%),var(--bg);color:var(--text);padding:2rem 1.25rem}
    main{max-width:42rem;margin:0 auto}
    .brand{font-size:.75rem;letter-spacing:.2em;text-transform:uppercase;color:var(--gold);margin-bottom:.75rem}
    h1{font-size:1.75rem;letter-spacing:-.03em;margin-bottom:.35rem}
    .sub{color:var(--muted);font-size:.9rem;margin-bottom:1.75rem}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin-bottom:1.75rem}
    .card{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:1.1rem 1.2rem}
    .card span{display:block;font-size:.75rem;color:var(--muted);margin-bottom:.35rem}
    .card strong{font-size:1.75rem;letter-spacing:-.03em;color:var(--gold)}
    h2{font-size:1rem;margin-bottom:.75rem}
    table{width:100%;border-collapse:collapse;font-size:.875rem}
    th,td{text-align:left;padding:.65rem .4rem;border-bottom:1px solid var(--line)}
    th{color:var(--muted);font-weight:500}
    .foot{margin-top:1.5rem;color:var(--muted);font-size:.75rem}
    @media(max-width:520px){.grid{grid-template-columns:1fr}}
  </style>
</head>
<body>
  <main>
    <p class="brand">KuzoCards</p>
    <h1>Статистика бота</h1>
    <p class="sub">Приватная страница. Никому не отправляй ссылку с ключом.</p>
    <div class="grid">
      <article class="card"><span>Уникальных /start</span><strong>${stats.startsUnique}</strong></article>
      <article class="card"><span>Всего /start</span><strong>${stats.startsTotal}</strong></article>
      <article class="card"><span>Уникальных открытий игры</span><strong>${stats.opensUnique}</strong></article>
      <article class="card"><span>Всего открытий игры</span><strong>${stats.opensTotal}</strong></article>
    </div>
    <h2>Последние новые пользователи</h2>
    <table>
      <thead><tr><th>Имя</th><th>Username</th><th>Когда</th></tr></thead>
      <tbody>${rows || '<tr><td colspan="3">Пока пусто — подожди первые /start</td></tr>'}</tbody>
    </table>
    <p class="foot">Источник: ${escapeHtml(origin)} · обнови страницу после новых заходов</p>
  </main>
</body>
</html>`;
}
