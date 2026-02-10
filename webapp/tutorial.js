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

      tap: { title: "Тап", text: "Нажимай на монету, чтобы зарабатывать NXN." },
      energy: { title: "Энергия", text: "Каждый тап тратит энергию." },

      lbGo: { title: "Лидерборд", text: "Нажми на иконку лидерборда." },
      lbInfo: { title: "Лидерборд", text: "Здесь показан общий рейтинг игроков." },

      transferGo: { title: "Переводы", text: "Нажми «Переводы»." },
      transferInfo: { title: "Переводы", text: "Отправляй NXN другим игрокам по ID." },

      shopGo: { title: "Магазин", text: "Нажми «Магазин»." },
      shopInfo: { title: "Магазин", text: "Покупай улучшения для ускорения прогресса." },

      backTap: { title: "Главный экран", text: "Вернись на экран тапалки." },

      stakeGo: { title: "Стейк", text: "Нажми «Стейк»." },
      stakeInfo: { title: "Стейк", text: "Стейкай NXN для участия в наградах." },
      stakeNXN: { title: "Стейк NXN", text: "Выбери сумму и подтверди стейк." },
      stakeRef: { title: "Реферальный стейк", text: "Реферальные NXN доступны только для стейка." },

      stakeLBGo: { title: "Стейк-лидерборд", text: "Открой стейк-лидерборд." },
      stakeLBInfo: { title: "Стейк-лидерборд", text: "Топ-участники получают награды." },
      stakeLBBack: { title: "Назад", text: "Нажми «Назад», чтобы выйти." },

      referralGo: { title: "Рефералы", text: "Открой раздел рефералов." },
      referralInfo: {
        title: "Рефералы",
        text:
          "Делись своим кодом.\n\n" +
          "Ты и твой друг получите по 50 000 NXN для стейка."
      },

      finish: { title: "Готово", text: "Нажми на монету и начинай игру." }
    },

    TR: {
      langTitle: "Dil",
      langText: "Başlamak için dil seçin",

      tap: { title: "Dokun", text: "NXN kazanmak için coin'e dokun." },
      energy: { title: "Enerji", text: "Her dokunuş enerji harcar." },

      lbGo: { title: "Sıralama", text: "Sıralama ikonuna dokun." },
      lbInfo: { title: "Sıralama", text: "Oyuncuların genel sıralaması." },

      transferGo: { title: "Transfer", text: "Transfer'e dokun." },
      transferInfo: { title: "Transfer", text: "NXN'i diğer oyunculara gönder." },

      shopGo: { title: "Mağaza", text: "Mağazaya dokun." },
      shopInfo: { title: "Mağaza", text: "Geliştirmeler satın al." },

      backTap: { title: "Ana ekran", text: "Ana tap ekranına dön." },

      stakeGo: { title: "Stake", text: "Stake'e dokun." },
      stakeInfo: { title: "Stake", text: "Ödüller için NXN stake et." },
      stakeNXN: { title: "NXN Stake", text: "Miktar seç ve onayla." },
      stakeRef: { title: "Referans Stake", text: "Referans NXN sadece stake içindir." },

      stakeLBGo: { title: "Stake Sıralaması", text: "Stake sıralamasını aç." },
      stakeLBInfo: { title: "Stake Sıralaması", text: "En iyi stake yapanlar ödül alır." },
      stakeLBBack: { title: "Geri", text: "Geri tuşuna bas." },

      referralGo: { title: "Referans", text: "Referans bölümünü aç." },
      referralInfo: {
        title: "Referans",
        text:
          "Kodunu paylaş.\n\n" +
          "Sen ve arkadaşın 50.000 NXN kazanırsınız."
      },

      finish: { title: "Hazır", text: "Coin'e dokun ve oyuna başla." }
    }
  };

  /* ================= HELPERS ================= */

  function clearUI() {
    root.innerHTML = "";
    if (finger) finger.remove();
    finger = null;
    document.body.classList.remove("tutorial-lock");
    document.querySelectorAll(".allow-click").forEach(e =>
      e.classList.remove("allow-click")
    );
    if (typingTimer) clearInterval(typingTimer);
  }

  function lockOnly(target) {
    document.body.classList.add("tutorial-lock");
    if (target) target.classList.add("allow-click");
  }

  function showFinger(target) {
    if (!target) return;
    const r = target.getBoundingClientRect();
    finger = document.createElement("div");
    finger.className = "nxn-finger";
    finger.style.left = r.left + r.width / 2 - 22 + "px";
    finger.style.top = r.top + r.height / 2 - 22 + "px";
    document.body.appendChild(finger);
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

  function showComment({ title, text }, withNext) {
    clearUI();

    const box = document.createElement("div");
    box.className = "nxn-comment";
    box.innerHTML = `
      <div class="nxn-comment-title">${title}</div>
      <div class="nxn-comment-text"></div>
      ${withNext ? `<div class="nxn-comment-actions"><button class="nxn-comment-btn">Next</button></div>` : ""}
    `;
    root.appendChild(box);

    typeText(box.querySelector(".nxn-comment-text"), text);

    if (withNext) {
      box.querySelector("button").onclick = () => {
        step++;
        run();
      };
    }
  }

  /* ================= FLOW ================= */

  function run() {
    const t = TEXT[lang];

    switch (step) {

      case -1:
        clearUI();
        const langBox = document.createElement("div");
        langBox.className = "nxn-comment nxn-lang-center";
        langBox.innerHTML = `
          <div class="nxn-comment-title">${TEXT.EN.langTitle}</div>
          <div class="nxn-comment-text">${TEXT.EN.langText}</div>
          <div class="nxn-comment-actions">
            <button class="nxn-comment-btn" data-lang="EN">EN</button>
            <button class="nxn-comment-btn" data-lang="RU">RU</button>
            <button class="nxn-comment-btn" data-lang="TR">TR</button>
          </div>
        `;
        root.appendChild(langBox);
        document.querySelectorAll("[data-lang]").forEach(b => {
          b.onclick = () => {
            lang = b.dataset.lang;
            step = 0;
            run();
          };
        });
        break;

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

      case 1:
        showComment(t.energy, true);
        break;

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
        showComment(t.lbInfo, true);
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
        showComment(t.transferInfo, true);
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
        showComment(t.shopInfo, true);
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
        showComment(t.stakeInfo, true);
        break;

      case 11:
        showComment(t.stakeNXN, true);
        break;

      case 12:
        showComment(t.stakeRef, true);
        break;

      case 13: {
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

      case 14:
        showComment(t.stakeLBInfo, true);
        break;

      case 15: {
        showComment(t.stakeLBBack, false);
        const btn = document.getElementById("back-to-stake");
        lockOnly(btn);
        showFinger(btn);
        btn.addEventListener("click", () => {
          step = 16;
          run();
        }, { once: true });
        break;
      }

      case 16: {
        showComment(t.referralGo, false);
        const btn = document.getElementById("open-referral");
        lockOnly(btn);
        showFinger(btn);
        btn.addEventListener("click", () => {
          step = 17;
          run();
        }, { once: true });
        break;
      }

      case 17:
        showComment(t.referralInfo, true);
        break;

      case 18: {
        if (window.showScreen) showScreen("tap");
        setTimeout(() => {
          showComment(t.finish, false);
          const coin = document.getElementById("coin");
          lockOnly(coin);
          showFinger(coin);
          coin.addEventListener("pointerdown", () => {
            clearUI();
          }, { once: true });
        }, 250);
        break;
      }
    }
  }

  window.startNXNTutorial = function () {
    step = -1;
    run();
  };
})();
