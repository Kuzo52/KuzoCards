(() => {
  "use strict";

  const MODE_KEY = "kuzocards:mode:v1";
  const SWIPE_THRESHOLD = 110;
  const ROTATION_FACTOR = 0.07;
  const EXIT_MULTIPLIER = 1.45;
  const Y_DAMP = 0.1;

  const MODES = {
    kids: {
      id: "kids",
      label: "8+",
      title: "Детский",
      storage: "kuzocards:progress:kids:v1",
      cards: [
        "Назови любимое животное и&nbsp;изобрази его за&nbsp;10&nbsp;секунд.",
        "Спой куплет из&nbsp;мультфильма так, будто ты&nbsp;на&nbsp;большой сцене.",
        "Кто из&nbsp;компании лучше всех рассказывает сказки? Объясни почему.",
        "Придумай супергероя для&nbsp;соседа справа: имя, сила и&nbsp;слабость.",
        "Покажи без&nbsp;слов любимый вид спорта. Остальные угадывают.",
        "Назови три вещи, которые делают день по-настоящему крутым.",
        "Изобрази робота, который пытается танцевать.",
        "Выбери двоих в&nbsp;команду для&nbsp;квеста «найти пропавший торт».",
        "Расскажи самый смешной случай из&nbsp;школы или двора.",
        "Спой рекламу мороженого так, чтобы все захотели его купить.",
        "Кто здесь главный изобретатель идей для&nbsp;игр? Защити выбор.",
        "Придумай новый праздник и&nbsp;объясни, как его отмечать.",
        "Покажи, как ты&nbsp;радуешься, когда получаешь подарок мечты.",
        "Назови три правила идеальной дружбы.",
        "Изобрази сцену из&nbsp;любимого мультфильма без&nbsp;слов.",
        "С кем из&nbsp;присутствующих отправишься в&nbsp;космическое путешествие?",
        "Придумай кличку-комплимент каждому за&nbsp;столом.",
        "Что бы ты&nbsp;сделал, если бы умел летать один день?",
        "Сыграй диалог между котом и&nbsp;собакой у&nbsp;миски.",
        "Кто первым заметит деталь в&nbsp;комнате на&nbsp;букву «К»? Поехали!",
        "Назови еду, без&nbsp;которой праздник не&nbsp;праздник.",
        "Покажи танец победы после забитого гола.",
        "Придумай закон для&nbsp;игровой комнаты. Кто нарушит — выполняет задание.",
        "Расскажи историю так, будто ты&nbsp;диктор спортивного матча.",
        "Изобрази погоду: дождь, ветер и&nbsp;солнце — по&nbsp;очереди.",
        "Какой суперспособностью наградишь человека напротив?",
        "Собери команду из&nbsp;трёх человек на&nbsp;миссию «спасти пикник».",
        "Покажи, как выглядит идеальное утро выходного дня.",
        "Назови три места, куда хочешь отправиться с&nbsp;друзьями.",
        "Спой тост-пожелание на&nbsp;мотив детской песни.",
        "Кто здесь лучший напарник для&nbsp;настольных игр? Почему?",
        "Изобрази динозавра, который учится кататься на&nbsp;самокате.",
        "Придумай название для&nbsp;сегодняшней компании-команды.",
        "Что подаришь другу, если бюджет — одна улыбка и&nbsp;идея?",
        "Покажи эмоцию «я&nbsp;только что выиграл приз».",
        "Назови героя книги или фильма, на&nbsp;которого хочешь быть похож.",
        "Сделай объявление: «Внимание! Начинается весёлая миссия!»",
        "Выбери двоих для&nbsp;баттла смешных звуков. Победителя выбирает компания.",
        "Каким талантом ты&nbsp;можешь удивить всех прямо сейчас? Покажи.",
        "Придумай задание для&nbsp;всей компании на&nbsp;ближайшие 5&nbsp;минут.",
        "Изобрази любимый вид транспорта так, чтобы все угадали.",
        "Назови три качества настоящего друга.",
        "Покажи, как выглядит «я&nbsp;почти победил» в&nbsp;настольной игре.",
        "Придумай смешной девиз для&nbsp;сегодняшней компании.",
        "Кто лучше всех умеет придумывать игры на&nbsp;ходу? Почему?",
        "Спой пожелание соседу слева на&nbsp;мотив любой простой мелодии.",
        "Изобрази волшебника, у&nbsp;которого заколдовалась палочка.",
        "Какой приз ты&nbsp;вручишь победителю вечера? Опиши за&nbsp;15&nbsp;секунд.",
        "Собери маршрут идеальной прогулки для&nbsp;всей компании.",
        "Скажи соседу справа фразу, после которой всем захочется улыбнуться.",
      ],
    },
    teens: {
      id: "teens",
      label: "14+",
      title: "Подростковый",
      storage: "kuzocards:progress:teens:v1",
      cards: [
        "Скажи о&nbsp;соседе слева три факта: два — правда, один — выдумка. Компания ищет выдумку.",
        "Спой куплет трека так, будто ты&nbsp;на&nbsp;своём мини-концерте.",
        "Кто из&nbsp;компании выжил бы первым в&nbsp;зомби-апокалипсисе? Объясни.",
        "Расскажи самый неловкий момент за&nbsp;последний год — можно со&nbsp;смехом.",
        "Покажи профессию соседа справа так, чтобы все угадали сразу.",
        "Вспомни историю, которую обычно рассказываешь только близким.",
        "Выбери двоих в&nbsp;команду на&nbsp;квест. Почему именно они?",
        "Скажи каждому за&nbsp;столом честный комплимент — коротко и&nbsp;по&nbsp;делу.",
        "Если бы твоя жизнь была сериалом, как&nbsp;бы назывался этот сезон?",
        "Станцуй 10&nbsp;секунд в&nbsp;стиле своего любимого артиста.",
        "Кто здесь самый опасный в&nbsp;споре? Приведи свежий пример.",
        "Назови скрытый талант и&nbsp;сразу покажи его.",
        "Произнеси тост за&nbsp;человека напротив, будто вы&nbsp;друзья навеки.",
        "Изобрази сцену из&nbsp;фильма или сериала без&nbsp;слов. Остальные угадывают.",
        "Что сделаешь в&nbsp;первый час, если завтра на&nbsp;карте появится миллион?",
        "Выбери саундтрек этой встречи и&nbsp;объясни выбор.",
        "Расскажи самый безумный план, который вы&nbsp;почти воплотили.",
        "Кто станет капитаном вашей компании? На&nbsp;речь — 20&nbsp;секунд.",
        "Покажи без&nbsp;слов эмоцию, которую чувствуешь сейчас.",
        "Задай соседу слева вопрос, на&nbsp;который нельзя ответить «норм».",
        "Назови три вещи, без&nbsp;которых тусовка для&nbsp;тебя скучная.",
        "Кто первым сдастся в&nbsp;споре «кто прав»? Голосуйте молча.",
        "Изобрази звонок родителям с&nbsp;оправданием, почему ты&nbsp;ещё не&nbsp;дома.",
        "С кем отправишься в&nbsp;поездку без&nbsp;плана? Почему?",
        "Расскажи провал так, будто это был эпичный успех.",
        "Придумай закон для&nbsp;этой комнаты. Нарушитель выполняет задание.",
        "Кто лучше всех держит удар в&nbsp;подколах? Пример обязателен.",
        "Опиши идеальный выходной без&nbsp;телефона.",
        "Спой короткий «рекламный» мотив про человека справа.",
        "Какую привычку соседа напротив замечаешь только ты?",
        "Если на&nbsp;сутки дать тебе суперсилу, какую возьмёшь и&nbsp;зачем?",
        "Собери команду из&nbsp;трёх человек на&nbsp;миссию «спасти вечер».",
        "Покажи, как звучит классическая отговорка «я&nbsp;уже выхожу».",
        "Кто главный генератор хаоса за&nbsp;столом? Защити выбор.",
        "Изобрази заказ еды, когда очень хочется есть.",
        "Назови тайтл, который стыдно любить, — и&nbsp;всё равно защити его.",
        "Придумай ник каждому за&nbsp;30&nbsp;секунд на&nbsp;всех.",
        "Какой статус о&nbsp;себе поставил бы прямо сейчас?",
        "Сыграй диалог с&nbsp;собой утром до&nbsp;первого сообщения в&nbsp;чате.",
        "Кого возьмёшь в&nbsp;«жюри своей жизни»? Почему?",
        "Расскажи историю, которая звучит как враки, но&nbsp;это правда.",
        "Сделай объявление в&nbsp;стиле ведущего шоу про сегодняшний вечер.",
        "Выбери двоих для&nbsp;баттла комплиментов. Победителя выбирает компания.",
        "Каким навыком притворяешься? Покажи «версию для&nbsp;гостей».",
        "Назови три любимые отговорки, когда опаздываешь.",
        "Если компания — отряд героев, кто кем будет?",
        "Спой тост на&nbsp;мотив известного трека.",
        "Кто первым напишет неловкое сообщение после этой ночи? Объясни.",
        "Придумай челлендж для&nbsp;всех на&nbsp;10&nbsp;минут.",
        "Скажи соседу слева фразу, после которой вечер запомнится.",
      ],
    },
    adults: {
      id: "adults",
      label: "18+",
      title: "Взрослый",
      storage: "kuzocards:progress:adults:v1",
      cards: [
        "Скажи о&nbsp;соседе слева три утверждения: два — правда, одно — ложь. Компания ищет ложь.",
        "Спой куплет так, будто ты&nbsp;уже на&nbsp;бис и&nbsp;слегка «разогрет» вечером.",
        "Кто из&nbsp;компании первым выжил бы в&nbsp;апокалипсисе? Без&nbsp;жалости к&nbsp;остальным.",
        "Расскажи самый неловкий момент за&nbsp;год — тот, о&nbsp;котором обычно молчишь.",
        "Покажи профессию соседа справа так, чтобы угадали с&nbsp;первой попытки.",
        "История из&nbsp;прошлого, которую на&nbsp;трезвую голову обычно не&nbsp;рассказываешь.",
        "Выбери двоих: напарник для&nbsp;аферы и&nbsp;человек, которого лучше не&nbsp;брать. Почему?",
        "Честный комплимент каждому — без&nbsp;воды и&nbsp;без&nbsp;страховки.",
        "Если жизнь — сериал 18+, как называется текущий сезон?",
        "Станцуй так, будто от&nbsp;танца зависит, позовут&nbsp;ли тебя ещё раз.",
        "Кто здесь самый токсичный спорщик? Пример с&nbsp;сегодняшнего стола.",
        "Секретный талант, о&nbsp;котором знают единицы. Покажи сейчас.",
        "Тост за&nbsp;человека напротив так, будто вы&nbsp;пережили вместе всё.",
        "Сцена из&nbsp;фильма без&nbsp;слов. Если угадают — он&nbsp;пьёт воду вместо шота. Шутка.",
        "Первый час после новости «ты&nbsp;миллионер». Без&nbsp;инстаграма — что делаешь?",
        "Саундтрек этой ночи. Почему именно он&nbsp;под ваш уровень безумия?",
        "Самый безумный план, который вы&nbsp;почти воплотили после полуночи.",
        "Кто станет президентом компании? Речь на&nbsp;20&nbsp;секунд — как на&nbsp;выборах.",
        "Эмоция сейчас — только мимика. Без&nbsp;подсказок голосом.",
        "Вопрос соседу слева, после которого нельзя ответить «нормально».",
        "Три вещи, без&nbsp;которых взрослая вечеринка для&nbsp;тебя мертва.",
        "Кто сдастся первым в&nbsp;споре «я&nbsp;прав»? Голосование молча.",
        "Звонок «маме/партнёру»: почему тебя ещё нет дома. Максимально правдоподобно.",
        "С кем в&nbsp;кругосветку без&nbsp;обратного билета? Почему риск оправдан?",
        "Провал на&nbsp;работе так, будто это кейс для&nbsp;конференции.",
        "Закон комнаты на&nbsp;ночь. Нарушитель выполняет задание компании.",
        "Кто держит удар в&nbsp;подколах лучше всех? Доказательство обязательно.",
        "Идеальные выходные без&nbsp;телефона — звучит как пытка или мечта?",
        "Рекламный мотив про человека справа в&nbsp;стиле ночного ТВ.",
        "Привычка соседа напротив, которую замечаешь только на&nbsp;второй бокал.",
        "Суперсила на&nbsp;одну ночь. Какая — и&nbsp;кого ей&nbsp;не&nbsp;стоит будить?",
        "Команда из&nbsp;трёх на&nbsp;квест «спасти праздник до&nbsp;рассвета».",
        "Покажи фирменную ложь «я&nbsp;уже выхожу» во&nbsp;взрослой версии.",
        "Главный агент хаоса за&nbsp;столом. Защищай кандидата как адвоката.",
        "Заказ еды на&nbsp;пике голода: голос, лицо, жесты.",
        "Фильм или трек, который стыдно любить. Защити до&nbsp;конца.",
        "Прозвища всем за&nbsp;30&nbsp;секунд. Без&nbsp;жалости, но&nbsp;с&nbsp;юмором.",
        "Статус о&nbsp;себе прямо сейчас — тот, который обычно не&nbsp;ставишь.",
        "Диалог с&nbsp;собой утром после тяжёлой ночи. До&nbsp;кофе.",
        "Кого в&nbsp;жюри своей жизни? И&nbsp;кого точно не&nbsp;возьмёшь?",
        "История как байка, но&nbsp;это правда. Компания решает: верим или нет.",
        "Объявление бортпроводника: пункт назначения — сегодняшний вечер.",
        "Баттл комплиментов: двое игроков. Победителя выбирает стол.",
        "Навык, которым притворяешься на&nbsp;свиданиях и&nbsp;собеседованиях. Покажи.",
        "Топ-3 отговорки, когда опять опоздал «по&nbsp;делам».",
        "Отряд супергероев 18+: роли всем присутствующим.",
        "Тост на&nbsp;мотив хита — можно фальшивить, нельзя скучать.",
        "Кто первым напишет бывшему после этой ночи? Аргументы в&nbsp;студию.",
        "Челлендж на&nbsp;10&nbsp;минут для&nbsp;взрослых. Без&nbsp;травм, с&nbsp;характером.",
        "Фраза соседу слева, после которой этот стол точно разнесёт.",
      ],
    },
  };

  const tg = window.Telegram?.WebApp ?? null;
  const deckEl = document.getElementById("deck");
  const emptyEl = document.getElementById("deckEmpty");
  const counterEl = document.getElementById("counter");
  const resetBtn = document.getElementById("btnReset");
  const welcomeEl = document.getElementById("welcome");
  const welcomeBtn = document.getElementById("welcomeBtn");
  const modesEl = document.getElementById("modes");
  const modeBadge = document.getElementById("modeBadge");
  const btnMode = document.getElementById("btnMode");

  let currentMode = null;
  let questions = [];
  let remaining = [];
  let isAnimating = false;
  let drag = null;
  let gameReady = false;

  initTelegram();
  lockViewport();
  bindWelcome();
  bindModes();
  bindModeSwitch();
  bindReset();

  function initTelegram() {
    try {
      if (!tg) return;
      tg.ready();
      tg.expand();
      if (typeof tg.disableVerticalSwipes === "function") tg.disableVerticalSwipes();
      if (typeof tg.setHeaderColor === "function") tg.setHeaderColor("#0a0a0b");
      if (typeof tg.setBackgroundColor === "function") tg.setBackgroundColor("#0a0a0b");
      trackOpen(tg.initDataUnsafe?.user);
    } catch {
      /* no-op */
    }
  }

  function trackOpen(user) {
    try {
      const uid = user?.id ? String(user.id) : `d:${Date.now()}`;
      fetch("https://kuzocards-bot.utopian-waiter.workers.dev/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, event: "open" }),
        keepalive: true,
        mode: "cors",
      }).catch(() => {});
    } catch {
      /* ignore */
    }
  }

  function bindWelcome() {
    welcomeBtn.addEventListener("click", () => {
      haptic("light");
      welcomeEl.classList.add("welcome--out");
      // Soft crossfade: modes rise while welcome fades
      window.setTimeout(() => {
        showModes();
      }, 180);
      window.setTimeout(() => {
        welcomeEl.hidden = true;
      }, 680);
    });
  }

  function showModes() {
    isAnimating = false;
    drag = null;
    modesEl.hidden = false;
    modesEl.classList.remove("welcome--out", "modes--in");
    void modesEl.offsetWidth;
    requestAnimationFrame(() => {
      modesEl.classList.add("modes--in");
    });
  }

  function bindModeSwitch() {
    if (!btnMode) return;
    btnMode.addEventListener("click", () => {
      if (!gameReady) return;
      haptic("light");
      openModePicker();
    });
  }

  function openModePicker() {
    gameReady = false;
    btnMode.hidden = true;
    deckEl.querySelectorAll(".card").forEach((el) => el.remove());
    emptyEl.hidden = true;
    counterEl.textContent = "0";
    showModes();
  }

  function bindModes() {
    modesEl.querySelectorAll("[data-mode]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-mode");
        if (!MODES[id]) return;
        haptic("medium");
        startMode(id);
      });
    });
  }

  function startMode(id) {
    currentMode = MODES[id];
    questions = currentMode.cards;
    remaining = loadProgress();
    gameReady = true;

    try {
      localStorage.setItem(MODE_KEY, id);
    } catch {
      /* ignore */
    }

    btnMode.hidden = false;
    modeBadge.textContent = `${currentMode.title} · ${currentMode.label}`;

    modesEl.classList.remove("modes--in");
    modesEl.classList.add("welcome--out");
    window.setTimeout(() => {
      modesEl.hidden = true;
      modesEl.classList.remove("welcome--out", "modes--in");
      render();
      // Soft enter for deck
      deckEl.classList.add("deck--enter");
      window.setTimeout(() => deckEl.classList.remove("deck--enter"), 700);
    }, 620);
  }

  function lockViewport() {
    document.addEventListener(
      "touchmove",
      (e) => {
        if (drag || isAnimating) e.preventDefault();
      },
      { passive: false }
    );
    window.addEventListener("scroll", () => window.scrollTo(0, 0));
  }

  function haptic(type = "light") {
    try {
      tg?.HapticFeedback?.impactOccurred?.(type);
    } catch {
      /* no-op */
    }
  }

  function storageKey() {
    return currentMode?.storage || "kuzocards:progress:tmp";
  }

  function loadProgress() {
    try {
      const raw = localStorage.getItem(storageKey());
      if (!raw) return questions.map((_, i) => i);
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return questions.map((_, i) => i);
      return parsed.filter((i) => Number.isInteger(i) && i >= 0 && i < questions.length);
    } catch {
      return questions.map((_, i) => i);
    }
  }

  function saveProgress() {
    try {
      localStorage.setItem(storageKey(), JSON.stringify(remaining));
    } catch {
      /* ignore */
    }
  }

  function render() {
    if (!gameReady) {
      counterEl.textContent = "0";
      return;
    }

    drag = null;
    deckEl.querySelectorAll(".card").forEach((el) => el.remove());

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
      const card = createCard(questions[index], index, i === 0, visible.length - 1 - i);
      deckEl.appendChild(card);
    }
  }

  function createCard(html, qIndex, isActive, depth) {
    const card = document.createElement("article");
    card.className = "card";
    card.dataset.index = String(qIndex);

    if (isActive) card.classList.add("card--active");
    else if (depth === 1) card.classList.add("card--behind-1");
    else card.classList.add("card--behind-2");

    card.innerHTML = `
      <span class="card__stamp card__stamp--done" aria-hidden="true">Done</span>
      <span class="card__stamp card__stamp--skip" aria-hidden="true">Skip</span>
      <p class="card__label">Вопрос</p>
      <p class="card__text">${html}</p>
    `;

    if (isActive) bindDrag(card);
    return card;
  }

  function bindDrag(card) {
    const onPointerDown = (e) => {
      if (!gameReady || isAnimating || e.button === 2) return;
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
      revealNext(Math.min(Math.abs(drag.x) / SWIPE_THRESHOLD, 1));
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

      if (Math.abs(x) >= SWIPE_THRESHOLD) completeSwipe(card, x > 0 ? "done" : "skip", x, y);
      else {
        revealNext(0);
        snapBack(card);
      }
    };

    card.addEventListener("pointerdown", onPointerDown);
    card.addEventListener("pointermove", onPointerMove);
    card.addEventListener("pointerup", endDrag);
    card.addEventListener("pointercancel", endDrag);
  }

  function revealNext(progress) {
    const next = deckEl.querySelector(".card--behind-1");
    const deep = deckEl.querySelector(".card--behind-2");
    if (next) {
      const t = 0.5 * progress;
      next.style.transform = `scale(${0.96 + 0.04 * progress}) translateY(${0.5 * (1 - progress)}rem)`;
      next.style.opacity = String(0.88 + 0.12 * progress);
      next.classList.toggle("card--peek", progress > 0.15);
    }
    if (deep) {
      deep.style.transform = `scale(${0.92 + 0.04 * progress}) translateY(${1 * (1 - progress)}rem)`;
      deep.style.opacity = String(0.55 + 0.25 * progress);
    }
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
    card.style.transition = "transform 0.32s cubic-bezier(0.16, 1, 0.3, 1)";
    card.style.transform = "translate3d(0, 0, 0) rotate(0deg)";
    const next = deckEl.querySelector(".card--behind-1");
    const deep = deckEl.querySelector(".card--behind-2");
    if (next) {
      next.style.transition = "transform 0.32s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.32s ease";
      next.style.transform = "";
      next.style.opacity = "";
      next.classList.remove("card--peek");
    }
    if (deep) {
      deep.style.transition = "transform 0.32s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.32s ease";
      deep.style.transform = "";
      deep.style.opacity = "";
    }
    const clear = () => {
      card.style.transition = "";
      card.style.transform = "";
      if (next) next.style.transition = "";
      if (deep) deep.style.transition = "";
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
    const exitY = y * 0.25 + dir * 12;
    const rot = dir * (18 + Math.min(Math.abs(x) / 40, 16));

    const qIndex = Number(card.dataset.index);
    remaining = remaining.filter((i) => i !== qIndex);
    saveProgress();

    const next = deckEl.querySelector(".card--behind-1");
    const deep = deckEl.querySelector(".card--behind-2");
    if (next) {
      next.classList.add("card--rising");
      next.style.transition =
        "transform 0.42s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1)";
      next.style.transform = "scale(1) translateY(0)";
      next.style.opacity = "1";
    }
    if (deep) {
      deep.style.transition =
        "transform 0.42s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1)";
      deep.style.transform = "scale(0.96) translateY(0.5rem)";
      deep.style.opacity = "0.88";
    }

    card.classList.add("card--fly");
    card.style.pointerEvents = "none";
    void card.offsetWidth;
    card.style.transform = `translate3d(${exitX}px, ${exitY}px, 0) rotate(${rot}deg)`;
    // keep card readable while only the tip leaves — fade late
    card.style.opacity = "1";
    window.requestAnimationFrame(() => {
      card.style.opacity = "0.35";
    });

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

    card.addEventListener("transitionend", (e) => {
      if (e.propertyName === "transform") finish();
    });
    window.setTimeout(finish, 440);
  }

  function bindReset() {
    resetBtn.addEventListener("click", () => {
      if (!gameReady || !currentMode) {
        welcomeEl.hidden = false;
        welcomeEl.classList.remove("welcome--out");
        modesEl.hidden = true;
        btnMode.hidden = true;
        return;
      }
      remaining = questions.map((_, i) => i);
      saveProgress();
      haptic("medium");
      isAnimating = false;
      drag = null;
      render();
    });
  }
})();
