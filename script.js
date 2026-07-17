(() => {
  "use strict";

  const STORAGE_KEY = "kuzocards:progress";
  const SWIPE_THRESHOLD = 120;
  const ROTATION_FACTOR = 0.08;
  const EXIT_MULTIPLIER = 1.35;

  const QUESTIONS = [
    "Назови три факта о&nbsp;соседе слева — два правда, один ложь. Компания угадывает.",
    "Спой куплет любой песни так, будто ты&nbsp;на&nbsp;концерте в&nbsp;стадионе.",
    "Кто в&nbsp;компании первым бы&nbsp;выжил в&nbsp;зомби-апокалипсисе? Аргументируй.",
    "Признайся в&nbsp;самом неловком моменте за&nbsp;последний год — без&nbsp;цензуры.",
    "Изобрази профессию соседа справа так, чтобы все угадали с&nbsp;первого раза.",
    "Расскажи историю из&nbsp;детства, которую ты&nbsp;обычно никому не&nbsp;рассказываешь.",
    "Выбери двоих: один — твой напарник в&nbsp;ограблении, второй — заложник. Почему?",
    "Скажи комплимент каждому за&nbsp;столом — только честные, без&nbsp;воды.",
    "Если бы твоя жизнь была сериалом, как&nbsp;бы назывался текущий сезон?",
    "Покажи танец, которым ты&nbsp;бы завоевал сердце на&nbsp;первом свидании.",
    "Кто здесь самый опасный в&nbsp;споре? Докажи на&nbsp;примере из&nbsp;вечера.",
    "Назови секретный талант, о&nbsp;котором почти никто не&nbsp;знает — и&nbsp;покажи его.",
    "Придумай тост за&nbsp;человека напротив, будто вы&nbsp;знакомы сто&nbsp;лет.",
    "Сыграй сцену из&nbsp;фильма без&nbsp;слов. Компания угадывает название.",
    "Что бы ты&nbsp;сделал, если бы завтра проснулся миллионером? Первый час.",
    "Выбери песню-саундтрек для&nbsp;сегодняшней ночи и&nbsp;объясни выбор.",
    "Расскажи самый безумный план, который вы&nbsp;когда-либо почти воплотили.",
    "Кто из&nbsp;присутствующих станет президентом компании? Кампания — 20&nbsp;секунд.",
    "Изобрази эмоцию, которую ты&nbsp;чувствуешь прямо сейчас — без&nbsp;единого слова.",
    "Задай вопрос соседу слева такой, на&nbsp;который нельзя ответить «нормально».",
  ];

  const tg = window.Telegram?.WebApp ?? null;
  const deckEl = document.getElementById("deck");
  const emptyEl = document.getElementById("deckEmpty");
  const counterEl = document.getElementById("counter");
  const resetBtn = document.getElementById("btnReset");

  let remaining = loadProgress();
  let isAnimating = false;
  let drag = null;

  initTelegram();
  render();
  bindReset();

  function initTelegram() {
    try {
      if (!tg) return;
      tg.ready();
      tg.expand();
      if (typeof tg.setHeaderColor === "function") tg.setHeaderColor("#0a0a0b");
      if (typeof tg.setBackgroundColor === "function") tg.setBackgroundColor("#0a0a0b");
    } catch {
      /* SDK недоступен вне Telegram — игра работает локально */
    }
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
      card.setPointerCapture?.(e.pointerId);
      drag = {
        card,
        startX: e.clientX,
        startY: e.clientY,
        x: 0,
        y: 0,
      };
      card.classList.add("card--dragging");
    };

    const onPointerMove = (e) => {
      if (!drag || drag.card !== card) return;
      drag.x = e.clientX - drag.startX;
      drag.y = e.clientY - drag.startY;
      const rot = drag.x * ROTATION_FACTOR;
      card.style.transform = `translate(${drag.x}px, ${drag.y}px) rotate(${rot}deg)`;
      updateStamps(card, drag.x);
    };

    const onPointerUp = () => {
      if (!drag || drag.card !== card) return;
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
    card.addEventListener("pointerup", onPointerUp);
    card.addEventListener("pointercancel", onPointerUp);
  }

  function updateStamps(card, x) {
    const done = card.querySelector(".card__stamp--done");
    const skip = card.querySelector(".card__stamp--skip");
    const progress = Math.min(Math.abs(x) / SWIPE_THRESHOLD, 1);
    if (x > 0) {
      done.style.opacity = String(progress);
      skip.style.opacity = "0";
    } else if (x < 0) {
      skip.style.opacity = String(progress);
      done.style.opacity = "0";
    } else {
      done.style.opacity = "0";
      skip.style.opacity = "0";
    }
  }

  function snapBack(card) {
    card.style.transition = `transform 0.35s var(--ease-out)`;
    card.style.transform = "";
    updateStamps(card, 0);
    const clear = () => {
      card.style.transition = "";
      card.removeEventListener("transitionend", clear);
    };
    card.addEventListener("transitionend", clear);
  }

  function completeSwipe(card, action, x, y) {
    isAnimating = true;
    haptic("light");

    const dir = action === "done" ? 1 : -1;
    const exitX = dir * Math.max(window.innerWidth, 420) * EXIT_MULTIPLIER;
    const exitY = y * 1.2;
    const rot = dir * 28;

    card.classList.add("card--fly");
    card.style.transform = `translate(${exitX}px, ${exitY}px) rotate(${rot}deg)`;
    card.style.opacity = "0";

    const qIndex = Number(card.dataset.index);
    remaining = remaining.filter((i) => i !== qIndex);
    saveProgress();

    window.setTimeout(() => {
      isAnimating = false;
      render();
    }, 420);
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
