/**
 * KuzoCards — Telegram bot + private per-user stats
 */
const APP_URL = "https://kuzo52.github.io/KuzoCards/";
const WELCOME_HTML =
  "🚀 <b>Добро пожаловать в KuzoCards!</b>\n\n" +
  "Ультимативная карточная игра для твоих вечеринок прямо внутри Telegram. " +
  "Свайпай карточки, выполняй фановые задания и узнавай секреты друзей.\n\n" +
  "Жми кнопку «Играть» ниже и погнали! 👇\n\n" +
  'Made by <a href="https://t.me/kuzoceo">@kuzoceo</a>';

export class StatsDO {
  constructor(ctx) {
    this.ctx = ctx;
  }

  async getData() {
    const raw =
      (await this.ctx.storage.get("data")) || {
        startsUnique: 0,
        startsTotal: 0,
        opensUnique: 0,
        opensTotal: 0,
        users: {},
        usersStart: {},
        usersOpen: {},
        recent: [],
      };
    return migrate(raw);
  }

  async fetch(request) {
    const url = new URL(request.url);
    const data = await this.getData();

    if (url.pathname === "/read") {
      const users = Object.values(data.users || {})
        .sort((a, b) => (b.lastAt || "").localeCompare(a.lastAt || ""))
        .slice(0, 200);
      return Response.json({
        startsUnique: data.startsUnique,
        startsTotal: data.startsTotal,
        opensUnique: data.opensUnique,
        opensTotal: data.opensTotal,
        users,
        recent: data.recent || [],
      });
    }

    if (url.pathname === "/start" && request.method === "POST") {
      const body = await request.json();
      const id = String(body.id || "");
      if (!id) return Response.json({ ok: false }, 400);

      const now = new Date().toISOString();
      const user = data.users[id] || {
        id,
        name: "Без имени",
        username: "—",
        starts: 0,
        opens: 0,
        firstAt: now,
        lastAt: now,
      };

      const wasNew = user.starts === 0;
      user.starts += 1;
      user.name = body.name || user.name;
      user.username = body.username || user.username;
      user.lastAt = now;
      data.users[id] = user;
      data.startsTotal += 1;
      if (wasNew) {
        data.startsUnique += 1;
        data.recent = [
          { id, name: user.name, username: user.username, at: now },
          ...(data.recent || []),
        ].slice(0, 30);
      }

      await this.ctx.storage.put("data", data);
      return Response.json({ ok: true });
    }

    if (url.pathname === "/open" && request.method === "POST") {
      const body = await request.json();
      const id = String(body.id || "anon");
      const now = new Date().toISOString();
      const user = data.users[id] || {
        id,
        name: body.name || (id === "anon" ? "Аноним" : "Без имени"),
        username: body.username || "—",
        starts: 0,
        opens: 0,
        firstAt: now,
        lastAt: now,
      };

      const wasNewOpen = user.opens === 0;
      user.opens += 1;
      if (body.name) user.name = body.name;
      if (body.username) user.username = body.username;
      user.lastAt = now;
      data.users[id] = user;
      data.opensTotal += 1;
      if (wasNewOpen) data.opensUnique += 1;

      await this.ctx.storage.put("data", data);
      return Response.json({ ok: true });
    }

    return new Response("Not found", { status: 404 });
  }
}

function migrate(raw) {
  if (raw.users && typeof raw.users === "object") return raw;

  const users = {};
  const startMap = raw.usersStart || {};
  const openMap = raw.usersOpen || {};
  const recent = raw.recent || [];
  const meta = {};
  for (const r of recent) meta[r.id] = r;

  const ids = new Set([...Object.keys(startMap), ...Object.keys(openMap)]);
  for (const id of ids) {
    const m = meta[id] || {};
    const starts = Number(startMap[id] || 0) > 0 ? Number(startMap[id]) || 1 : 0;
    const opens = Number(openMap[id] || 0) > 0 ? Number(openMap[id]) || 1 : 0;
    users[id] = {
      id,
      name: m.name || "Без имени",
      username: m.username || "—",
      starts: starts || (startMap[id] ? 1 : 0),
      opens: opens || (openMap[id] ? 1 : 0),
      firstAt: m.at || new Date().toISOString(),
      lastAt: m.at || new Date().toISOString(),
    };
  }

  return {
    startsUnique: Number(raw.startsUnique || Object.keys(startMap).length || 0),
    startsTotal: Number(raw.startsTotal || 0),
    opensUnique: Number(raw.opensUnique || Object.keys(openMap).length || 0),
    opensTotal: Number(raw.opensTotal || 0),
    users,
    recent,
  };
}

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      const token = env.BOT_TOKEN;
      if (!token) return json({ ok: false, error: "BOT_TOKEN missing" }, 500);

      const stub = env.STATS_DO.get(env.STATS_DO.idFromName("main"));

      if ((request.method === "GET" || request.method === "HEAD") && url.pathname === "/") {
        if (request.method === "HEAD") return new Response(null, { status: 200 });
        return json({ ok: true, service: "kuzocards-bot" });
      }

      if (request.method === "GET" && url.pathname === "/stats") {
        if (!checkStatsKey(url, env)) return new Response("Forbidden", { status: 403 });
        const data = await stub.fetch("https://stats/read").then((r) => r.json());
        return html(statsPage(data, url.origin));
      }

      if (request.method === "GET" && url.pathname === "/stats.json") {
        if (!checkStatsKey(url, env)) return json({ ok: false, error: "Forbidden" }, 403);
        const data = await stub.fetch("https://stats/read").then((r) => r.json());
        return json({ ok: true, ...data });
      }

      if (request.method === "OPTIONS" && url.pathname === "/track") {
        return cors(new Response(null, { status: 204 }));
      }

      if (request.method === "POST" && url.pathname === "/track") {
        const body = await request.json().catch(() => ({}));
        await stub.fetch("https://stats/open", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: String(body.uid || body.user_id || "anon"),
            name: body.name || "",
            username: body.username || "",
          }),
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

      if (request.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
      }

      const update = await request.json();
      const message = update.message || update.edited_message;
      if (!message?.chat?.id) return json({ ok: true });

      const text = String(message.text || "").trim();
      if (text === "/start" || text.startsWith("/start@") || text.startsWith("/start ")) {
        const from = message.from || {};
        await stub.fetch("https://stats/start", {
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
  const userRows = (stats.users || [])
    .map(
      (u) => `<tr>
      <td>${escapeHtml(u.name)}</td>
      <td>${escapeHtml(u.username)}</td>
      <td>${Number(u.starts || 0)}</td>
      <td>${Number(u.opens || 0)}</td>
      <td>${escapeHtml(u.lastAt ? new Date(u.lastAt).toLocaleString("ru-RU") : "—")}</td>
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
    main{max-width:52rem;margin:0 auto}
    .brand{font-size:.75rem;letter-spacing:.2em;text-transform:uppercase;color:var(--gold);margin-bottom:.75rem}
    h1{font-size:1.75rem;letter-spacing:-.03em;margin-bottom:.35rem}
    .sub{color:var(--muted);font-size:.9rem;margin-bottom:1.75rem}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin-bottom:1.75rem}
    .card{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:1.1rem 1.2rem}
    .card span{display:block;font-size:.75rem;color:var(--muted);margin-bottom:.35rem}
    .card strong{font-size:1.75rem;letter-spacing:-.03em;color:var(--gold)}
    h2{font-size:1rem;margin:0 0 .75rem}
    .table-wrap{overflow:auto;border:1px solid var(--line);border-radius:16px}
    table{width:100%;border-collapse:collapse;font-size:.875rem;min-width:34rem}
    th,td{text-align:left;padding:.7rem .75rem;border-bottom:1px solid var(--line);white-space:nowrap}
    th{color:var(--muted);font-weight:500;background:rgba(255,255,255,.02)}
    tr:last-child td{border-bottom:none}
    .num{color:var(--gold);font-weight:600}
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
      <article class="card"><span>Всего запусков бота</span><strong>${stats.startsTotal}</strong></article>
      <article class="card"><span>Уникальных открытий игры</span><strong>${stats.opensUnique}</strong></article>
      <article class="card"><span>Всего открытий игры</span><strong>${stats.opensTotal}</strong></article>
    </div>
    <h2>По каждому пользователю</h2>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Имя</th>
            <th>Username</th>
            <th>/start</th>
            <th>Открытий игры</th>
            <th>Последний визит</th>
          </tr>
        </thead>
        <tbody>
          ${
            userRows ||
            '<tr><td colspan="5">Пока пусто — подожди первые /start</td></tr>'
          }
        </tbody>
      </table>
    </div>
    <p class="foot">Источник: ${escapeHtml(origin)} · обнови страницу после новых заходов</p>
  </main>
</body>
</html>`;
}
