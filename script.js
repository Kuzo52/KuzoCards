(() => {
  "use strict";

  const STORAGE_KEY = "kuzocards:progress:v3";
  const SWIPE_THRESHOLD = 110;
  const ROTATION_FACTOR = 0.07;
  const EXIT_MULTIPLIER = 1.5;
  const Y_DAMP = 0.12;

  const QUESTIONS = [
    "Скажи о&nbsp;соседе слева три утверждения: два — правда, одно — ложь. Компания угадывает, где ложь.",
    "Спой куплет любой песни так, будто ты&nbsp;на&nbsp;стадионе перед полной трибуной.",
    "Кто из&nbsp;компании первым выжил бы в&nbsp;зомби-апокалипсисе? Объясни почему.",
    "Расскажи о&nbsp;самом неловком моменте за&nbsp;последний год — без&nbsp;купюр.",
    "Покажи профессию соседа справа так, чтобы все угадали с&nbsp;первой попытки.",
    "Вспомни историю из&nbsp;детства, которую ты&nbsp;редко кому рассказываешь.",
    "Выбери двоих: один пойдёт с&nbsp;тобой на&nbsp;ограбление, второй станет заложником. Почему так?",
    "Скажи каждому за&nbsp;столом честный комплимент — коротко и&nbsp;по&nbsp;делу.",
    "Если бы твоя жизнь была сериалом, как&nbsp;бы назывался нынешний сезон?",
    "Станцуй так, будто от&nbsp;этого танца зависит первое свидание.",
    "Кто здесь самый опасный спорщик? Приведи пример с&nbsp;сегодняшнего вечера.",
    "Назови талант, о&nbsp;котором почти никто не&nbsp;знает, и&nbsp;сразу покажи его.",
    "Произнеси тост за&nbsp;человека напротив так, будто вы&nbsp;друзья уже сто&nbsp;лет.",
    "Изобрази сцену из&nbsp;фильма без&nbsp;слов. Остальные угадывают название.",
    "Что ты&nbsp;сделаешь в&nbsp;первый час, если завтра проснёшься миллионером?",
    "Выбери саундтрек этой ночи и&nbsp;объясни, почему именно эта песня.",
    "Расскажи самый безумный план, который вы&nbsp;почти воплотили в&nbsp;жизнь.",
    "Кто из&nbsp;присутствующих станет президентом вашей компании? На&nbsp;речь — 20&nbsp;секунд.",
    "Покажи без&nbsp;слов эмоцию, которую чувствуешь прямо сейчас.",
    "Задай соседу слева вопрос, на&nbsp;который нельзя ответить просто «нормально».",
    "Назови три вещи, без&nbsp;которых вечеринка для&nbsp;тебя точно провалится.",
    "Кто здесь первым сдастся в&nbsp;споре «кто прав»? Голосуйте молча.",
    "Изобрази звонок маме и&nbsp;объясни, почему ты&nbsp;ещё не&nbsp;дома.",
    "С кем из&nbsp;присутствующих отправишься в&nbsp;кругосветку? Почему именно с&nbsp;ним?",
    "Расскажи провал на&nbsp;работе или учёбе так, будто это была победа.",
    "Придумай закон для&nbsp;этой комнаты. Кто нарушит — выполняет задание.",
    "Кто лучше всех держит удар, когда его подкалывают? Приведи пример.",
    "Опиши идеальный выходной без&nbsp;телефона — час за&nbsp;часом.",
    "Спой короткий рекламный мотив про человека справа.",
    "Какую привычку соседа напротив замечаешь только ты?",
    "Если бы на&nbsp;одну ночь у&nbsp;тебя появилась суперсила, какая это была бы сила и&nbsp;зачем?",
    "Собери команду из&nbsp;трёх человек на&nbsp;квест «спасти праздник».",
    "Покажи, как ты&nbsp;обычно врёшь фразой «я&nbsp;уже выхожу».",
    "Кто здесь главный мастер хаоса? Защити свой выбор.",
    "Изобрази, как ты&nbsp;заказываешь еду, когда очень хочется есть.",
    "Назови фильм, который стыдно любить, — и&nbsp;всё равно защити его.",
    "Придумай прозвище каждому за&nbsp;столом. На&nbsp;всех — 30&nbsp;секунд.",
    "Какой статус о&nbsp;себе ты&nbsp;поставил бы прямо сейчас? Только честно.",
    "Сыграй диалог с&nbsp;собой утром до&nbsp;первой чашки кофе.",
    "Кого из&nbsp;присутствующих ты&nbsp;возьмёшь в&nbsp;жюри своей жизни? Почему?",
    "Расскажи историю, которая звучит как выдумка, но&nbsp;это правда.",
    "Сделай объявление в&nbsp;стиле бортпроводника на&nbsp;тему сегодняшнего вечера.",
    "Выбери двоих для&nbsp;баттла комплиментов. Победителя выбирает компания.",
    "Каким навыком ты&nbsp;притворяешься? Покажи «версию для&nbsp;гостей».",
    "Назови три любимые отговорки, когда ты&nbsp;опаздываешь.",
    "Если эта компания — отряд супергероев, кто кем будет?",
    "Спой тост на&nbsp;мотив любой известной песни.",
    "Кто первым напишет бывшему после этой ночи? Объясни свой выбор.",
    "Придумай задание для&nbsp;всей компании на&nbsp;ближайшие 10&nbsp;минут.",
    "Скажи соседу слева фразу, после которой этот вечер точно запомнится.",
  ];

  const tg = window.Telegram?.WebApp ?? null;
  const deckEl = document.getElementById("deck");
  const emptyEl = document.getElementById("deckEmpty");
  const counterEl = document.getElementById("counter");
  const resetBtn = document.getElementById("btnReset");
  const welcomeEl = document.getElementById("welcome");
  const welcomeBtn = document.getElementById("welcomeBtn");

  let remaining = loadProgress();
  let isAnimating = false;
  let drag = null;

  initTelegram();
  lockViewport();
  bindWelcome();
  render();
  bindReset();

  function initTelegram() {
    try {
      if (!tg) return;
      tg.ready();
      tg.expand();
      if (typeof tg.disableVerticalSwipes === "function") tg.disableVerticalSwipes();
      if (typeof tg.setHeaderColor === "function") tg.setHeaderColor("#0a0a0b");
      if (typeof tg.setBackgroundColor === "function") tg.setBackgroundColor("#0a0a0b");
    } catch {
      /* SDK недоступен вне Telegram */
    }
  }

  function bindWelcome() {
    if (!welcomeEl || !welcomeBtn) return;
    welcomeBtn.addEventListener("click", () => {
      haptic("light");
      welcomeEl.classList.add("welcome--out");
      window.setTimeout(() => {
        welcomeEl.hidden = true;
      }, 450);
    });
  }

  function lockViewport() {
    const block = (e) => {
      if (drag || isAnimating) e.preventDefault();
    };
    document.addEventListener("touchmove", block, { passive: false });
    window.addEventListener("scroll", () => {
      window.scrollTo(0, 0);
    });
  }

  function haptic(type = "light") {
    try {
      tg?.HapticFeedback?.impactOccurred?.(type);
    } catch {
      /* no-op */
    }
  }

  function loadProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return QUESTIONS.map((_, i) => i);
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return QUESTIONS.map((_, i) => i);
      return parsed.filter((i) => Number.isInteger(i) && i >= 0 && i < QUESTIONS.length);
    } catch {
      return QUESTIONS.map((_, i) => i);
    }
  }

  function saveProgress() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
    } catch {
      /* quota / private mode */
    }
  }

  function render() {
    drag = null;
    const oldCards = deckEl.querySelectorAll(".card");
    oldCards.forEach((el) => el.remove());

    const count = remaining.length;
    counterEl.textContent = String(count);

    if (count === 0) {
      emptyEl.hidden = false;
      return;
    }

    emptyEl.hidden = true;
    const visible = remaining.slice(0, 3);

    for (let i = visible.length - 1; i >= 0; i -= 1) {
      const index = visible[i];
      const card = createCard(QUESTIONS[index], index, i === 0, visible.length - 1 - i);
      deckEl.appendChild(card);
    }
  }

  function createCard(html, qIndex, isActive, depth) {
    const card = document.createElement("article");
    card.className = "card";
    card.dataset.index = String(qIndex);

    if (isActive) {
      card.classList.add("card--active");
    } else if (depth === 1) {
      card.classList.add("card--behind-1");
    } else {
      card.classList.add("card--behind-2");
    }

    card.innerHTML = `
      <span class="card__stamp card__stamp--done" aria-hidden="true">Done</span>
      <span class="card__stamp card__stamp--skip" aria-hidden="true">Skip</span>
      <p class="card__label">Вопрос</p>
      <p class="card__text">${html}</p>
      <p class="card__meta">KuzoCards</p>
    `;

    if (isActive) bindDrag(card);
    return card;
  }

  function bindDrag(card) {
    const onPointerDown = (e) => {
      if (isAnimating || e.button === 2) return;
      e.preventDefault();
      try {
        card.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      drag = {
        card,
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        x: 0,
        y: 0,
      };
      card.classList.add("card--dragging");
    };

    const onPointerMove = (e) => {
      if (!drag || drag.card !== card) return;
      e.preventDefault();
      drag.x = e.clientX - drag.startX;
      drag.y = (e.clientY - drag.startY) * Y_DAMP;
      const rot = drag.x * ROTATION_FACTOR;
      card.style.transform = `translate3d(${drag.x}px, ${drag.y}px, 0) rotate(${rot}deg)`;
      updateStamps(card, drag.x);
    };

    const endDrag = (e) => {
      if (!drag || drag.card !== card) return;
      if (e && drag.pointerId != null) {
        try {
          card.releasePointerCapture(drag.pointerId);
        } catch {
          /* ignore */
        }
      }
      const { x, y } = drag;
      drag = null;
      card.classList.remove("card--dragging");

      if (Math.abs(x) >= SWIPE_THRESHOLD) {
        completeSwipe(card, x > 0 ? "done" : "skip", x, y);
      } else {
        snapBack(card);
      }
    };

    card.addEventListener("pointerdown", onPointerDown);
    card.addEventListener("pointermove", onPointerMove);
    card.addEventListener("pointerup", endDrag);
    card.addEventListener("pointercancel", endDrag);
  }

  function updateStamps(card, x) {
    const done = card.querySelector(".card__stamp--done");
    const skip = card.querySelector(".card__stamp--skip");
    if (!done || !skip) return;
    const progress = Math.min(Math.abs(x) / SWIPE_THRESHOLD, 1);
    if (x > 24) {
      done.style.opacity = String(progress);
      skip.style.opacity = "0";
    } else if (x < -24) {
      skip.style.opacity = String(progress);
      done.style.opacity = "0";
    } else {
      done.style.opacity = "0";
      skip.style.opacity = "0";
    }
  }

  function clearStamps(card) {
    const done = card.querySelector(".card__stamp--done");
    const skip = card.querySelector(".card__stamp--skip");
    if (done) done.style.opacity = "0";
    if (skip) skip.style.opacity = "0";
  }

  function snapBack(card) {
    clearStamps(card);
    card.style.transition = "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)";
    card.style.transform = "translate3d(0, 0, 0) rotate(0deg)";
    const clear = () => {
      card.style.transition = "";
      card.style.transform = "";
      card.removeEventListener("transitionend", clear);
    };
    card.addEventListener("transitionend", clear);
  }

  function completeSwipe(card, action, x, y) {
    if (isAnimating) return;
    isAnimating = true;
    haptic("light");
    clearStamps(card);

    const dir = action === "done" ? 1 : -1;
    const exitX = dir * (window.innerWidth + card.offsetWidth) * EXIT_MULTIPLIER;
    const exitY = y * 0.35;
    const rot = dir * 26;

    const qIndex = Number(card.dataset.index);
    remaining = remaining.filter((i) => i !== qIndex);
    saveProgress();

    card.classList.add("card--fly");
    card.style.pointerEvents = "none";
    // force layout so transition always starts
    void card.offsetWidth;
    card.style.transform = `translate3d(${exitX}px, ${exitY}px, 0) rotate(${rot}deg)`;
    card.style.opacity = "0";

    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      card.remove();
      isAnimating = false;
      render();
      try {
        tg?.expand?.();
      } catch {
        /* ignore */
      }
    };

    card.addEventListener("transitionend", finish, { once: true });
    window.setTimeout(finish, 380);
  }

  function bindReset() {
    resetBtn.addEventListener("click", () => {
      try {
        remaining = QUESTIONS.map((_, i) => i);
        saveProgress();
        haptic("medium");
        isAnimating = false;
        drag = null;
        render();
      } catch {
        remaining = QUESTIONS.map((_, i) => i);
        render();
      }
    });
  }
})();
