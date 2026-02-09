/* ============== NXN GAME ONBOARDING (CLEAN FINAL FIXED) ============== */

(function () {
  const root = document.getElementById("nxn-tutorial-root");
  let step = -1;
  let lang = "RU";

  /* ================= TEXTS ================= */

  const TEXT = {
    RU: {
      langTitle: "Выбор языка",
      langText: "Выберите язык, чтобы начать игру",

      tap: {
        title: "Тап",
        text: "Нажимай на монету, чтобы зарабатывать NXN. Каждый тап приносит монеты."
      },
      energy: {
        title: "Энергия",
        text: "Каждый тап тратит энергию. Когда энергия закончится, тапы временно остановятся."
      },
      lbMenu: {
        title: "Лидерборд",
        text: "Нажми на эту иконку, чтобы посмотреть рейтинг игроков."
      },
      lbScreen: {
        title: "Рейтинг игроков",
        text: "Здесь отображается общий рейтинг всех игроков."
      },
      transferMenu: {
        title: "Переводы",
        text: "Нажми сюда, чтобы перейти к переводам NXN."
      },
      transferScreen: {
        title: "Переводы NXN",
        text: "Отправляй NXN другим игрокам по их ID."
      },
      shopMenu: {
        title: "Магазин",
        text: "Нажми сюда, чтобы открыть магазин улучшений."
      },
      shopScreen: {
        title: "Магазин",
        text: "Улучши силу тапа, энергию и покупай автокликер."
      },
      tapMenu: {
        title: "Главный экран",
        text: "Нажми сюда, чтобы вернуться к тапалке."
      },
      stakeBtn: {
        title: "Стейк",
        text: "Нажми сюда, чтобы участвовать в наградных циклах."
      },
      stakeMain: {
        title: "Стейк NXN",
        text: "Выбери сумму и застейкай NXN для участия в цикле."
      },
      stakeRef: {
        title: "Реферальный стейк",
        text: "Реферальные NXN можно использовать только для стейка."
      },
      stakeLBExit: {
        title: "Стейк-лидерборд",
        text: "Нажми кнопку «Назад», чтобы выйти из стейк-лидерборда."
      },
      referralMenu: {
        title: "Рефералы",
        text: "Нажми сюда, чтобы перейти в реферальный раздел."
      },
      referralScreen: {
        title: "Реферальная программа",
        text:
          "Делитесь своим реферальным кодом и приглашайте друзей.\n\n" +
          "Вы и ваш друг получите по 50 000 NXN для стейка."
      },
      finish: {
        title: "Готово",
        text: "Теперь ты готов. Сделай первый тап и начинай зарабатывать NXN."
      }
    },

    EN: {
      langTitle: "Language",
      langText: "Choose your language to start",

      tap: { title: "Tap", text: "Tap the coin to earn NXN. Each tap gives you coins." },
      energy: { title: "Energy", text: "Each tap consumes energy." },
      lbMenu: { title: "Leaderboard", text: "Tap this icon to view the ranking." },
      lbScreen: { title: "Global Ranking", text: "This is the global player ranking." },
      transferMenu: { title: "Transfers", text: "Tap to open transfers." },
      transferScreen: { title: "NXN Transfers", text: "Send NXN to other players." },
      shopMenu: { title: "Shop", text: "Tap to open the shop." },
      shopScreen: { title: "Shop", text: "Upgrade tap power and energy." },
      tapMenu: { title: "Main Screen", text: "Tap to return to main screen." },
      stakeBtn: { title: "Stake", text: "Tap to participate in cycles." },
      stakeMain: { title: "NXN Staking", text: "Choose amount and stake NXN." },
      stakeRef: { title: "Referral Stake", text: "Referral NXN is for staking only." },
      stakeLBExit: { title: "Stake Leaderboard", text: "Tap Back to exit stake leaderboard." },
      referralMenu: { title: "Referrals", text: "Open referral section." },
      referralScreen: {
        title: "Referral Program",
        text: "Share your referral code.\n\nYou and your friend get 50,000 NXN for staking."
      },
      finish: { title: "All Set", text: "Make your first tap and start earning NXN." }
    },

    TR: {
      langTitle: "Dil",
      langText: "Başlamak için dil seçin",

      tap: { title: "Dokun", text: "NXN kazanmak için coin'e dokun." },
      energy: { title: "Enerji", text: "Her dokunuş enerji harcar." },
      lbMenu: { title: "Sıralama", text: "Sıralamayı görmek için dokun." },
      lbScreen: { title: "Sıralama", text: "Burada tüm oyuncuların genel puanı gösterilmektedir." },
      transferMenu: { title: "Transfer", text: "Transfer bölümüne git." },
      transferScreen: { title: "NXN Transfer", text: "NXN'i oyuncuların kimlik numaralarını kullanarak diğer oyunculara gönderin." },
      shopMenu: { title: "Mağaza", text: "Mağazayı aç." },
      shopScreen: { title: "Mağaza", text: "Dokunma gücünüzü ve enerjinizi artırın ve otomatik tıklama cihazı satın alın." },
      tapMenu: { title: "Ana Ekran", text: "Ana ekrana dön." },
      stakeBtn: { title: "Stake", text: "Stake giriş yap." },
      stakeMain: { title: "NXN Stake", text: "Miktar seç ve stake et." },
      stakeRef: { title: "Referans Stake", text: "Referans NXN sadece stake içindir." },
      stakeLBExit: { title: "Stake Sıralaması", text: "Geri tuşuna basarak çık." },
      referralMenu: { title: "Referans", text: "Referans bölümüne git." },
      referralScreen: {
        title: "Referans Programı",
        text: "Kodu paylaş.\n\nİkiniz de 50.000 NXN kazanırsınız."
      },
      finish: { title: "Hazır", text: "İlk dokunuşunu yap ve başla bol şans." }
    }
  };

  /* ================= HELPERS ================= */

  function lock(target) {
    document.body.classList.add("tutorial-lock");
    if (target) target.classList.add("allow-click");
  }

  function unlock() {
    document.body.classList.remove("tutorial-lock");
    document.querySelectorAll(".allow-click").forEach(el =>
      el.classList.remove("allow-click")
    );
  }

  function showComment({ title, text }, target, withNext) {
    root.innerHTML = "";
    unlock();

    const box = document.createElement("div");
    box.className = "nxn-comment big";
    box.innerHTML = `
      <div class="nxn-comment-title">${title}</div>
      <div class="nxn-comment-text">${text.replace(/\n/g, "<br>")}</div>
      ${withNext ? `<div class="nxn-comment-actions"><button class="nxn-comment-btn">Next</button></div>` : ""}
    `;

    if (target) {
      lock(target);
      const r = target.getBoundingClientRect();
      box.style.top = `${r.top - 140}px`;
      box.style.left = `${Math.max(12, r.left)}px`;
    } else {
      lock();
      box.style.top = "20vh";
      box.style.left = "50vw";
      box.style.transform = "translateX(-50%)";
    }

    root.appendChild(box);

    if (withNext) {
      box.querySelector("button").onclick = () => {
        step++;
        run();
      };
    }
  }

  /* ================= FLOW ================= */

  function run() {
  // язык для всех шагов КРОМЕ выбора
  const t = TEXT[lang];

  switch (step) {


      case -1: {
        const t = TEXT.EN; // ← ВСЕГДА АНГЛИЙСКИЙ

        root.innerHTML = `
    <div class="nxn-comment nxn-lang-center">
      <div class="nxn-comment-title">${t.langTitle}</div>
      <div class="nxn-comment-text">${t.langText}</div>
      <div class="nxn-comment-actions">
        <button class="nxn-comment-btn" data-lang="RU">RU</button>
        <button class="nxn-comment-btn" data-lang="EN">EN</button>
        <button class="nxn-comment-btn" data-lang="TR">TR</button>
      </div>
    </div>
  `;
      }
        lock();
        document.querySelectorAll("[data-lang]").forEach(b => {
          b.onclick = () => {
            lang = b.dataset.lang;
            step = 0;
            run();
          };
        });
        break;

      case 0: {
        const coin = document.getElementById("coin");
        showComment(t.tap, coin, false);
        coin.addEventListener("pointerdown", () => { step = 1; run(); }, { once: true });
        break;
      }

      case 1:
        showComment(t.energy, document.getElementById("energy"), true);
        break;

      case 2: {
        const btn = document.querySelector('.menu [data-go="leaderboard"]');
        showComment(t.lbMenu, btn, false);
        btn.addEventListener("click", () => { step = 3; run(); }, { once: true });
        break;
      }

      case 3:
        showComment(t.lbScreen, null, true);
        break;

      case 4: {
        const btn = document.querySelector('.menu [data-go="transfer"]');
        showComment(t.transferMenu, btn, false);
        btn.addEventListener("click", () => { step = 5; run(); }, { once: true });
        break;
      }

      case 5:
        showComment(t.transferScreen, null, true);
        break;

      case 6: {
        const btn = document.querySelector('.menu [data-go="shop"]');
        showComment(t.shopMenu, btn, false);
        btn.addEventListener("click", () => { step = 7; run(); }, { once: true });
        break;
      }

      case 7:
        showComment(t.shopScreen, null, true);
        break;

      case 8: {
        const btn = document.querySelector('.menu [data-go="tap"]');
        showComment(t.tapMenu, btn, false);
        btn.addEventListener("click", () => { step = 9; run(); }, { once: true });
        break;
      }

      case 9: {
        const btn = document.getElementById("stake-btn");
        showComment(t.stakeBtn, btn, false);
        btn.addEventListener("click", () => { step = 10; run(); }, { once: true });
        break;
      }

      case 10:
        showComment(t.stakeMain, document.getElementById("stake-confirm"), true);
        break;

      case 11:
        showComment(t.stakeRef, document.getElementById("stake-referral-btn"), true);
        break;

      case 12: {
        const btn = document.getElementById("open-stake-lb");
        showComment(t.stakeLBExit, btn, false);
        btn.addEventListener("click", () => {
          const back = document.getElementById("back-to-stake");
          back.classList.add("allow-click");
          back.addEventListener("click", () => { step = 13; run(); }, { once: true });
        }, { once: true });
        break;
      }

      case 13: {
        const btn = document.getElementById("open-referral");
        showComment(t.referralMenu, btn, false);
        btn.addEventListener("click", () => { step = 14; run(); }, { once: true });
        break;
      }

      case 14:
        showComment(t.referralScreen, null, true);
        break;

      case 15: {
        if (window.showScreen) showScreen("tap");
        setTimeout(() => {
          const coin = document.getElementById("coin");
          showComment(t.finish, coin, false);
          coin.addEventListener("pointerdown", () => {
            localStorage.setItem("nxn_tutorial_done", "1"); // ← ВАЖНО
            unlock();
            root.innerHTML = "";
          }, { once: true });

        }, 300);
        break;
      }
    }
  }

  /* ================= START ================= */

  window.startNXNTutorial = function () {
    // если туториал уже пройден — ничего не делаем
    if (localStorage.getItem("nxn_tutorial_done")) {
      return;
    }

    step = -1;
    run();
  };

})();
