/* ============== NXN GAME COMMENTARY ONBOARDING ============== */

(function () {
  const root = document.getElementById("nxn-tutorial-root");
  let step = -1;
  let lang = "RU";

  const TEXT = {
    RU: {
      tap: {
        title: "Тап",
        text: "Нажимай на монету, чтобы зарабатывать NXN. Каждый тап приносит монеты."
      },
      energy: {
        title: "Энергия",
        text: "Каждый тап тратит энергию. Когда энергия закончится — тапы остановятся."
      },
      lbMenu: {
        title: "Лидерборд",
        text: "Нажми сюда, чтобы открыть рейтинг игроков."
      },
      lbScreen: {
        title: "Лидерборд",
        text: "Здесь отображаются лучшие игроки. Соревнуйся и поднимайся в рейтинге."
      },
      transfer: {
        title: "Переводы",
        text: "Здесь ты можешь отправлять NXN другим игрокам по ID."
      },
      shop: {
        title: "Магазин",
        text: "В магазине можно улучшать силу тапа, энергию и покупать автокликер."
      },
      stakeBtn: {
        title: "Стейк",
        text: "Нажми сюда, чтобы участвовать в наградных циклах и получать NXN."
      },
      stakeMain: {
        title: "Стейк NXN",
        text: "Выбери сумму и застейкай NXN, чтобы участвовать в распределении наград."
      },
      stakeRef: {
        title: "Реферальный стейк",
        text: "Реферальные NXN можно использовать только для стейка."
      },
      stakeLB: {
        title: "Стейк-лидерборд",
        text: "ТОП-участники получают награды на реальные кошельки каждый цикл."
      },
      finish: {
        title: "Готово",
        text: "Теперь ты знаешь всё необходимое. Играй, стейкай и зарабатывай NXN!"
      }
    }
  };

  function showComment({ title, text }, target, next = true) {
    root.innerHTML = "";

    const box = document.createElement("div");
    box.className = "nxn-comment big";
    box.innerHTML = `
      <div class="nxn-comment-title">${title}</div>
      <div class="nxn-comment-text">${text}</div>
      ${next ? `<div class="nxn-comment-actions"><button class="nxn-comment-btn">Next</button></div>` : ""}
    `;

    if (target) {
      const el = document.querySelector(target);
      if (el) {
        const r = el.getBoundingClientRect();
        box.style.top = `${r.top - 120}px`;
        box.style.left = `${Math.max(12, r.left)}px`;
      }
    } else {
      box.style.top = "20vh";
      box.style.left = "50vw";
      box.style.transform = "translateX(-50%)";
    }

    root.appendChild(box);

    if (next) {
      box.querySelector("button").onclick = nextStep;
    }
  }

  function nextStep() {
    step++;
    run();
  }

  function run() {
    const t = TEXT[lang];

    switch (step) {
      case -1:
  root.innerHTML = `
    <div class="nxn-comment nxn-lang-center">
      <div class="nxn-comment-title">Choose language</div>
      <div class="nxn-comment-text">
        Select the language to start the game
      </div>
      <div class="nxn-comment-actions">
        <button class="nxn-comment-btn" data-lang="RU">RU</button>
        <button class="nxn-comment-btn" data-lang="EN">EN</button>
        <button class="nxn-comment-btn" data-lang="TR">TR</button>
      </div>
    </div>
  `;

  document.querySelectorAll("[data-lang]").forEach(btn => {
    btn.onclick = () => {
      lang = btn.dataset.lang;
      step = 0;
      run();
    };
  });
  break;

      case 0:
        showComment(t.tap, "#coin", false);
        document.getElementById("coin").onclick = () => nextStep();
        break;

      case 1:
        showComment(t.energy, "#energy", true);
        break;

      case 2:
        showComment(t.lbMenu, '.menu [data-go="leaderboard"]', false);
        document.querySelector('.menu [data-go="leaderboard"]').onclick = () => nextStep();
        break;

      case 3:
        showComment(t.lbScreen, null, true);
        break;

      case 4:
        showComment(t.transfer, null, true);
        showScreen("transfer");
        break;

      case 5:
        showComment(t.shop, null, true);
        showScreen("shop");
        break;

      case 6:
        showScreen("tap");
        showComment(t.stakeBtn, "#stake-btn", false);
        document.getElementById("stake-btn").onclick = () => nextStep();
        break;

      case 7:
        showComment(t.stakeMain, "#stake-confirm", true);
        break;

      case 8:
        showComment(t.stakeRef, "#stake-referral-btn", true);
        break;

      case 9:
        showComment(t.stakeLB, null, true);
        break;

      case 10:
        showComment(t.finish, null, false);
        break;
    }
  }

  window.startNXNTutorial = function () {
    step = -1;
    run();
  };
})();
