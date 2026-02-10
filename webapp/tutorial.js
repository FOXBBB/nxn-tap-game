/* ============== NXN GAME ONBOARDING (STABLE – COMMENTS ONLY ABOVE ELEMENTS) ============== */

(function () {
  const root = document.getElementById("nxn-tutorial-root");
  let step = -1;
  let lang = "RU";

  /* ================= TEXTS ================= */

  const TEXT = {
    RU: {
      langTitle: "Выбор языка",
      langText: "Выберите язык, чтобы начать игру",

      tap: { title: "Тап", text: "Нажимай на монету, чтобы зарабатывать NXN." },
      energy: { title: "Энергия", text: "Каждый тап тратит энергию." },
      lbMenu: { title: "Лидерборд", text: "Нажми на иконку лидерборда." },
      lbScreen: { title: "Рейтинг", text: "Здесь рейтинг всех игроков." },
      transferMenu: { title: "Переводы", text: "Нажми на иконку переводов." },
      transferScreen: { title: "Переводы", text: "Отправляй NXN другим игрокам." },
      shopMenu: { title: "Магазин", text: "Нажми на иконку магазина." },
      shopScreen: { title: "Магазин", text: "Покупай улучшения." },
      tapMenu: { title: "Главный экран", text: "Вернись на тапалку." },
      stakeBtn: { title: "Стейк", text: "Нажми, чтобы перейти к стейку." },
      stakeMain: { title: "Стейк", text: "Выбери сумму и застейкай NXN." },
      stakeRef: { title: "Реферальный стейк", text: "Реферальные NXN используются только для стейка." },
      stakeLBEnter: { title: "Стейк-лидерборд", text: "Открой стейк-лидерборд." },
      stakeLBExit: { title: "Назад", text: "Нажми «Назад», чтобы выйти." },
      referralMenu: { title: "Рефералы", text: "Открой реферальный раздел." },
      referralScreen: {
        title: "Реферальная программа",
        text: "Делись кодом и получай по 50 000 NXN для стейка."
      },
      finish: { title: "Готово", text: "Сделай первый тап и играй!" }
    },

    EN: {
      langTitle: "Language",
      langText: "Choose your language",

      tap: { title: "Tap", text: "Tap the coin to earn NXN." },
      energy: { title: "Energy", text: "Each tap consumes energy." },
      lbMenu: { title: "Leaderboard", text: "Tap leaderboard icon." },
      lbScreen: { title: "Ranking", text: "Global player ranking." },
      transferMenu: { title: "Transfers", text: "Tap transfer icon." },
      transferScreen: { title: "Transfers", text: "Send NXN to players." },
      shopMenu: { title: "Shop", text: "Tap shop icon." },
      shopScreen: { title: "Shop", text: "Buy upgrades." },
      tapMenu: { title: "Main", text: "Back to tap screen." },
      stakeBtn: { title: "Stake", text: "Open staking." },
      stakeMain: { title: "Stake", text: "Choose amount and stake." },
      stakeRef: { title: "Referral stake", text: "Referral NXN is for staking only." },
      stakeLBEnter: { title: "Stake leaderboard", text: "Open stake leaderboard." },
      stakeLBExit: { title: "Back", text: "Exit leaderboard." },
      referralMenu: { title: "Referrals", text: "Open referrals." },
      referralScreen: {
        title: "Referral Program",
        text: "Share code and earn 50,000 NXN each."
      },
      finish: { title: "Done", text: "Tap the coin to start playing!" }
    },

    TR: {
      langTitle: "Dil",
      langText: "Dil seçin",

      tap: { title: "Dokun", text: "NXN kazanmak için coin'e dokun." },
      energy: { title: "Enerji", text: "Her dokunuş enerji harcar." },
      lbMenu: { title: "Sıralama", text: "Sıralamaya dokun." },
      lbScreen: { title: "Sıralama", text: "Oyuncu sıralaması." },
      transferMenu: { title: "Transfer", text: "Transfer ikonuna dokun." },
      transferScreen: { title: "Transfer", text: "NXN gönder." },
      shopMenu: { title: "Mağaza", text: "Mağazayı aç." },
      shopScreen: { title: "Mağaza", text: "Yükseltmeler al." },
      tapMenu: { title: "Ana", text: "Ana ekrana dön." },
      stakeBtn: { title: "Stake", text: "Stake bölümüne gir." },
      stakeMain: { title: "Stake", text: "Miktar seç ve stake et." },
      stakeRef: { title: "Referans stake", text: "Referans NXN sadece stake içindir." },
      stakeLBEnter: { title: "Stake sıralaması", text: "Stake sıralamasını aç." },
      stakeLBExit: { title: "Geri", text: "Geri dön." },
      referralMenu: { title: "Referans", text: "Referans bölümüne gir." },
      referralScreen: {
        title: "Referans",
        text: "Kod paylaş ve 50.000 NXN kazan."
      },
      finish: { title: "Hazır", text: "Başlamak için coin'e dokun!" }
    }
  };

  /* ================= CORE ================= */

  function clearUI() {
    root.innerHTML = "";
    document.body.classList.remove("tutorial-lock");
    document.querySelectorAll(".allow-click").forEach(el =>
      el.classList.remove("allow-click")
    );
  }

  function lock(target) {
    document.body.classList.add("tutorial-lock");
    if (target) target.classList.add("allow-click");
  }

  function showComment(data, target, next) {
    clearUI();

    const box = document.createElement("div");
    box.className = "nxn-comment";
    box.innerHTML = `
      <div class="nxn-comment-title">${data.title}</div>
      <div class="nxn-comment-text">${data.text}</div>
      ${next ? `<div class="nxn-comment-actions"><button class="nxn-comment-btn">Next</button></div>` : ""}
    `;
    root.appendChild(box);

    if (target) {
      lock(target);
      const r = target.getBoundingClientRect();
      box.style.top = Math.max(8, r.top - box.offsetHeight - 8) + "px";
      box.style.left = Math.max(8, r.left + r.width / 2 - box.offsetWidth / 2) + "px";
    } else {
      lock();
      box.style.top = "20vh";
      box.style.left = "50%";
      box.style.transform = "translateX(-50%)";
    }

    if (next) {
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
      case -1: {
        clearUI();
        const e = TEXT.EN;
        root.innerHTML = `
          <div class="nxn-comment nxn-lang-center">
            <div class="nxn-comment-title">${e.langTitle}</div>
            <div class="nxn-comment-text">${e.langText}</div>
            <div class="nxn-comment-actions">
              <button class="nxn-comment-btn" data-lang="RU">RU</button>
              <button class="nxn-comment-btn" data-lang="EN">EN</button>
              <button class="nxn-comment-btn" data-lang="TR">TR</button>
            </div>
          </div>
        `;
        lock();
        document.querySelectorAll("[data-lang]").forEach(b => {
          b.onclick = () => {
            lang = b.dataset.lang;
            step = 0;
            run();
          };
        });
        break;
      }

      case 0: {
  const coin = document.getElementById("coin");
  showComment(t.tap, coin, false);

  coin.addEventListener(
    "pointerdown",
    () => {
      step = 1;
      run();
    },
    { once: true }
  );
  break;
}


      case 1:
        showComment(t.energy, document.getElementById("energy"), true);
        break;

      case 2:
        showComment(t.lbMenu, document.querySelector('[data-go="leaderboard"]'), false);
        document.querySelector('[data-go="leaderboard"]').onclick = () => { step = 3; run(); };
        break;

      case 3:
        showComment(t.lbScreen, null, true);
        break;

      case 4:
        showComment(t.transferMenu, document.querySelector('[data-go="transfer"]'), false);
        document.querySelector('[data-go="transfer"]').onclick = () => { step = 5; run(); };
        break;

      case 5:
        showComment(t.transferScreen, null, true);
        break;

      case 6:
        showComment(t.shopMenu, document.querySelector('[data-go="shop"]'), false);
        document.querySelector('[data-go="shop"]').onclick = () => { step = 7; run(); };
        break;

      case 7:
        showComment(t.shopScreen, null, true);
        break;

      case 8:
        showComment(t.tapMenu, document.querySelector('[data-go="tap"]'), false);
        document.querySelector('[data-go="tap"]').onclick = () => { step = 9; run(); };
        break;

      case 9:
        showComment(t.stakeBtn, document.getElementById("stake-btn"), false);
        document.getElementById("stake-btn").onclick = () => { step = 10; run(); };
        break;

      case 10:
        showComment(t.stakeMain, document.getElementById("stake-confirm"), true);
        break;

      case 11:
        showComment(t.stakeRef, document.getElementById("stake-referral-btn"), true);
        break;

      case 12:
        showComment(t.stakeLBEnter, document.getElementById("open-stake-lb"), false);
        document.getElementById("open-stake-lb").onclick = () => { step = 13; run(); };
        break;

      case 13:
        showComment(t.stakeLBExit, document.getElementById("back-to-stake"), false);
        document.getElementById("back-to-stake").onclick = () => { step = 14; run(); };
        break;

      case 14:
        showComment(t.referralMenu, document.getElementById("open-referral"), false);
        document.getElementById("open-referral").onclick = () => { step = 15; run(); };
        break;

      case 15:
        showComment(t.referralScreen, null, true);
        break;

      case 16:
        if (window.showScreen) showScreen("tap");
        setTimeout(() => {
          showComment(t.finish, document.getElementById("coin"), false);
          document.getElementById("coin").onclick = () => clearUI();
        }, 200);
        break;
    }
  }

  window.startNXNTutorial = function () {
    step = -1;
    run();
  };
})();
