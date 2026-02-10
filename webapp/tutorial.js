/* ============== NXN GAME ONBOARDING (FINAL STABLE) ============== */

(function () {
  const root = document.getElementById("nxn-tutorial-root");
  let step = -1;
  let lang = "EN";
  let finger = null;
  let typingTimer = null;

  /* ================= TEXTS ================= */

  const TEXT = {
    EN: {
      langTitle: "Choose language",
      langText: "Select your language to start",

      tap: { title: "Tap", text: "Tap the coin to earn NXN." },
      energy: { title: "Energy", text: "Each tap consumes energy." },

      lbGo: { title: "Leaderboard", text: "Tap the leaderboard icon." },
      lbInfo: { title: "Leaderboard", text: "This is the global ranking of players." },

      transferGo: { title: "Transfer", text: "Tap Transfer." },
      transferInfo: { title: "Transfer", text: "Send NXN to other players by ID." },

      shopGo: { title: "Shop", text: "Tap Shop." },
      shopInfo: { title: "Shop", text: "Buy upgrades to progress faster." },

      backTap: { title: "Main screen", text: "Return to the tap screen." },

      stakeGo: { title: "Stake", text: "Tap Stake to open staking." },
      stakeInfo: { title: "Stake", text: "Stake NXN to participate in reward cycles." },
      stakeNXN: { title: "Stake NXN", text: "Choose amount and confirm staking." },
      stakeRef: { title: "Referral stake", text: "Referral NXN can be used only for staking." },

      stakeLBGo: { title: "Stake leaderboard", text: "Open the stake leaderboard." },
      stakeLBInfo: { title: "Stake leaderboard", text: "Top stakers receive rewards each cycle." },
      stakeLBBack: { title: "Back", text: "Tap Back to exit stake leaderboard." },

      referralGo: { title: "Referral", text: "Open referral section." },
      referralInfo: {
        title: "Referral",
        text:
          "Share your referral code.\n\n" +
          "You and your friend will receive 50,000 NXN each for staking."
      },

      finish: { title: "Done", text: "Tap the coin and start earning NXN." }
    },

    RU: {
      langTitle: "Выбор языка",
      langText: "Выберите язык, чтобы начать игру",

      tap: { title: "Тап", text: "КЛИКНИ на монету, чтобы зарабатывать NXN." },
      energy: { title: "Энергия", text: "Каждый тап тратит энергию." },

      lbGo: { title: "Лидерборд", text: "Нажми на иконку лидерборда." },
      lbInfo: { title: "Лидерборд", text: "Здесь показан общий рейтинг игроков соревнуйся с лидерами из ТОП 100." },

      transferGo: { title: "Переводы", text: "Нажми «Переводы»." },
      transferInfo: { title: "Переводы", text: "Отправляй и делись NXN своим друзьям по ID." },

      shopGo: { title: "Магазин", text: "Нажми «Магазин»." },
      shopInfo: { title: "Магазин", text: "Покупай улучшения энергии и силу тапа для ускорения прогресса." },

      backTap: { title: "Главный экран", text: "Вернись на экран тапалки." },

      stakeGo: { title: "Стэк", text: "Нажми «Стэк»." },
      stakeInfo: { title: "Стэк", text: "Стейкай NXN для участия в наградах настоящего NXN TOKEN." },
      stakeNXN: { title: "Стэк NXN", text: "Выбери сумму и подтверди стэк." },
      stakeRef: { title: "Реферальный стэк", text: "Реферальные NXN доступны только для стэка." },

      stakeLBGo: { title: "Стэк-лидерборд", text: "Открой стэк-лидерборд." },
      stakeLBInfo: { title: "Стейк-лидерборд", text: "Топ 500 участников получают награды в настоящих Токенах NXN." },
      stakeLBBack: { title: "Назад", text: "Нажми «Назад», чтобы выйти." },

      referralGo: { title: "Рефералы", text: "Открой раздел рефералов." },
      referralInfo: {
        title: "Рефералы",
        text:
          "Делись своим кодом.\n\n" +
          "Ты и твой друг получите по 50 000 NXN для стэка."
      },

      finish: { title: "Готово", text: "Нажми на монету и начинай игру." }
    },

    TR: {
      langTitle: "Dil",
      langText: "Başlamak için dil seçin",

      tap: { title: "Dokun", text: "NXN kazanmak için coin'e dokun." },
      energy: { title: "Enerji", text: "Her dokunuş enerji harcar." },

      lbGo: { title: "Sıralama", text: "Sıralama ikonuna dokun." },
      lbInfo: { title: "Sıralama", text: "Oyuncuların genel sıralaması TOP 100 kisiden biri sen ol." },

      transferGo: { title: "Transfer", text: "Transfer'e dokun." },
      transferInfo: { title: "Transfer", text: "NXN'i ID üzere diğer oyunculara gönder." },

      shopGo: { title: "Mağaza", text: "Mağazaya dokun." },
      shopInfo: { title: "Mağaza", text: "Geliştirmeler TAP gücünü ve enerjiyi satın ala bilirsiniz." },

      backTap: { title: "Ana ekran", text: "Ana tap ekranına dön." },

      stakeGo: { title: "Stake", text: "Stake'e dokun." },
      stakeInfo: { title: "Stake", text: "Ödüller için NXN stake et." },
      stakeNXN: { title: "NXN Stake", text: "Miktar seç ve onayla." },
      stakeRef: { title: "Referans Stake", text: "Referans NXN sadece stake içindir." },

      stakeLBGo: { title: "Stake Sıralaması", text: "Stake sıralamasını aç." },
      stakeLBInfo: { title: "Stake Sıralaması", text: "En iyi TOP 500 kişi stake yapanlar gercek NXN TOKEN ödülünü alır." },
      stakeLBBack: { title: "Geri", text: "Geri tuşuna bas." },

      referralGo: { title: "Referans", text: "Referans bölümünü aç." },
      referralInfo: {
        title: "Referans",
        text:
          "Kodunu paylaş.\n\n" +
          "Sen ve arkadaşın Stake için 50.000 NXN kazanırsınız."
      },

      finish: { title: "Hazır", text: "Coin'e dokun ve oyuna başla." }
    }
  };

  /* ================= HELPERS ================= */

 function clearUI() {
  root.innerHTML = "";

  if (finger) {
  if (finger._cleanup) finger._cleanup();
  finger.remove();
}
finger = null;


  // ❌ УБРАЛИ отсюда снятие tutorial-lock
  // document.body.classList.remove("tutorial-lock");

  document.querySelectorAll(".allow-click").forEach(e =>
    e.classList.remove("allow-click")
  );

  if (typingTimer) clearInterval(typingTimer);
}


function clearStakeHighlights() {
  const stakeMain = document.getElementById("stake-confirm");
  const stakeRef = document.getElementById("stake-referral-btn");

  if (stakeMain) stakeMain.classList.remove("nxn-highlight");
  if (stakeRef) stakeRef.classList.remove("nxn-highlight");
}


  function lockOnly(target) {
    document.body.classList.add("tutorial-lock");
    if (target) target.classList.add("allow-click");
  }
function lockNextOnly() {
  document.body.classList.add("tutorial-next-only");
}

function highlight(el) {
  if (!el) return;
  el.classList.add("nxn-highlight");
}

function removeHighlight(el) {
  if (!el) return;
  el.classList.remove("nxn-highlight");
}


function unlockNextOnly() {
  document.body.classList.remove("tutorial-next-only");
}

  function showFinger(target) {
  if (!target) return;

  if (finger) finger.remove();

  finger = document.createElement("div");
  finger.className = "nxn-finger";
  document.body.appendChild(finger);

  const updatePosition = () => {
    const r = target.getBoundingClientRect();
    finger.style.left = r.left + r.width / 2 - 22 + "px";
    finger.style.top  = r.top  + r.height / 2 - 22 + "px";
  };

  updatePosition();

  // 👇 КЛЮЧЕВОЕ
  window.addEventListener("scroll", updatePosition, { passive: true });
  window.addEventListener("resize", updatePosition);

  finger._cleanup = () => {
    window.removeEventListener("scroll", updatePosition);
    window.removeEventListener("resize", updatePosition);
  };
}


  function typeText(el, text) {
    el.innerHTML = "";
    let i = 0;
    typingTimer = setInterval(() => {
      el.innerHTML += text[i];
      i++;
      if (i >= text.length) clearInterval(typingTimer);
    }, 18);
  }

  function showComment({ title, text }, target, withNext, position = "above") {
  clearUI();

  const box = document.createElement("div");
  box.className = "nxn-comment";
  box.innerHTML = `
    <div class="nxn-comment-title">${title}</div>
    <div class="nxn-comment-text"></div>
    ${
      withNext
        ? `<div class="nxn-comment-actions">
             <button class="nxn-comment-btn">Next</button>
           </div>`
        : ""
    }
  `;

  root.appendChild(box);

  const textEl = box.querySelector(".nxn-comment-text");
typeText(textEl, text);


  if (target) {
    lockOnly(target);

    const r = target.getBoundingClientRect();
    const OFFSET = 10;
    let top;

    if (position === "below") {
      // ⬇️ комментарий ПОД элементом
      top = r.bottom + OFFSET;
    } else {
      // ⬆️ комментарий НАД элементом
      top = r.top - box.offsetHeight - OFFSET;
      if (top < 8) top = r.bottom + OFFSET;
    }

    box.style.top = top + "px";
    if (position === "below") {
  // ⬇️ снизу, но ВСЕГДА по центру экрана
  box.style.left = "50%";
  box.style.transform = "translateX(-50%)";
} else {
  // ⬆️ над элементом — как раньше, привязка к кнопке
  box.style.left =
    Math.max(8, r.left + r.width / 2 - box.offsetWidth / 2) + "px";
}

  } else {
  document.body.classList.add("tutorial-lock");
  box.classList.add("allow-click"); // 👈 ВАЖНО
  box.style.top = "16px";
  box.style.left = "50%";
  box.style.transform = "translateX(-50%)";
}


  if (withNext) {
  const btn = box.querySelector(".nxn-comment-btn");
  btn.classList.add("allow-click");

  btn.onclick = () => {
    step++;
    run();
  };
}

}

  /* ================= FLOW ================= */

  function run() {
    const t = TEXT[lang];

    switch (step) {

      case -1: {
  clearUI();

  const langBox = document.createElement("div");
  langBox.className = "nxn-comment nxn-lang-center";
  langBox.innerHTML = `
    <div class="nxn-comment-title">${TEXT.EN.langTitle}</div>
    <div class="nxn-comment-text">${TEXT.EN.langText}</div>
    <div class="nxn-comment-actions">
      <button class="nxn-comment-btn allow-click" data-lang="EN">EN</button>
      <button class="nxn-comment-btn allow-click" data-lang="RU">RU</button>
      <button class="nxn-comment-btn allow-click" data-lang="TR">TR</button>
    </div>
  `;

  root.appendChild(langBox);

  // 🔒 блокируем ВСЁ
  document.body.classList.add("tutorial-lock");

  // 🎯 но кнопки языка разрешаем
  langBox.querySelectorAll("[data-lang]").forEach(b => {
    b.onclick = () => {
      lang = b.dataset.lang;
      step = 0;
      run();
    };
  });

  break;
}


      case 0: {
        showComment(t.tap, false);
        const coin = document.getElementById("coin");
        lockOnly(coin);
        showFinger(coin);
        coin.addEventListener("pointerdown", () => {
          step = 1;
          run();
        }, { once: true });
        break;
      }

      case 1: {
  showComment(t.energy, null, true);

  // 🔒 блокируем всё
  document.body.classList.add("tutorial-lock");

  // 🎯 разрешаем только Next
  const nextBtn = document.querySelector(".nxn-comment-btn");
  if (nextBtn) nextBtn.classList.add("allow-click");

  break;
}


      case 2: {
        showComment(t.lbGo, false);
        const btn = document.querySelector('[data-go="leaderboard"]');
        lockOnly(btn);
        showFinger(btn);
        btn.addEventListener("click", () => {
          step = 3;
          run();
        }, { once: true });
        break;
      }

      case 3:
        showComment(t.lbInfo, null, true);
        break;

      case 4: {
        showComment(t.transferGo, false);
        const btn = document.querySelector('[data-go="transfer"]');
        lockOnly(btn);
        showFinger(btn);
        btn.addEventListener("click", () => {
          step = 5;
          run();
        }, { once: true });
        break;
      }

      case 5:
        showComment(t.transferInfo, null, true);
        break;

      case 6: {
        showComment(t.shopGo, false);
        const btn = document.querySelector('[data-go="shop"]');
        lockOnly(btn);
        showFinger(btn);
        btn.addEventListener("click", () => {
          step = 7;
          run();
        }, { once: true });
        break;
      }

      case 7:
        showComment(t.shopInfo, null, true);
        break;

      case 8: {
        showComment(t.backTap, false);
        const btn = document.querySelector('[data-go="tap"]');
        lockOnly(btn);
        showFinger(btn);
        btn.addEventListener("click", () => {
          step = 9;
          run();
        }, { once: true });
        break;
      }

      case 9: {
        showComment(t.stakeGo, false);
        const btn = document.getElementById("stake-btn");
        lockOnly(btn);
        showFinger(btn);
        btn.addEventListener("click", () => {
          step = 10;
          run();
        }, { once: true });
        break;
      }

      case 10:
         showComment(t.stakeInfo, null, true);
        break;

      case 11:
  clearStakeHighlights(); // ← ВАЖНО
  showComment(t.stakeMain, null, true);
  highlight(document.getElementById("stake-confirm"));
  break;



      case 12:
  clearStakeHighlights(); // ← ВАЖНО
  showComment(t.stakeRef, null, true);
  highlight(document.getElementById("stake-referral-btn"));
  break;

case 13: {
  // 👉 ПРОСИМ ПЕРЕЙТИ В STAKE LEADERBOARD
  showComment(t.stakeLBGo, false);

  const btn = document.getElementById("open-stake-lb");
  lockOnly(btn);
  showFinger(btn);

  btn.addEventListener("click", () => {
    step = 14;
    run();
  }, { once: true });

  break;
}



case 14: {
  const back = document.getElementById("back-to-stake");

  showComment(
    t.stakeLBBack,
    back,
    false,
    "below" // ⬇️ ВАЖНО
  );

  lockOnly(back);
  showFinger(back);

  back.addEventListener("click", () => {
    step = 15;
    run();
  }, { once: true });

  break;
}


      case 15: {
  showComment(t.referralGo, false);

  const btn = document.getElementById("open-referral");
  lockOnly(btn);
  showFinger(btn);

  btn.addEventListener("click", () => {
    step = 16;
    run();
  }, { once: true });

  break;
}


      case 16:
  showComment(t.referralInfo, null, true);
  break;


      case 17: {
  if (window.showScreen) showScreen("tap");

  setTimeout(() => {
    showComment(
      { title: t.finish.title, text: "You are ready to play.\nTap the coin and start farming NXN." },
      false
    );

    const coin = document.getElementById("coin");
    lockOnly(coin);
    showFinger(coin);

   coin.addEventListener("pointerdown", () => {
  localStorage.setItem("nxn_tutorial_done", "1"); // ✅ ЗАПОМНИЛИ
  document.body.classList.remove("tutorial-lock"); // 🔓 РАЗБЛОК
  clearUI();
}, { once: true });



  }, 300);

  break;
}
    }
  }

 window.startNXNTutorial = function () {
  const finished = localStorage.getItem("nxn_tutorial_done");

  // ❌ уже проходил — не показываем
  if (finished === "1") return;

  step = -1;
  run();
};

})();
