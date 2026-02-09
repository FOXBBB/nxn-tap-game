/* ============== NXN GAME STRICT COMMENTARY ONBOARDING ============== */

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
        text: "Каждый тап тратит энергию. Когда энергия закончится, тапы временно остановятся."
      },
      lbMenu: {
        title: "Лидерборд",
        text: "Нажми на эту иконку, чтобы посмотреть рейтинг игроков."
      },
      lbScreen: {
        title: "Рейтинг игроков",
        text: "Здесь ты видишь общий рейтинг всех игроков. Соревнуйся и поднимайся выше."
      },
      transferMenu: {
        title: "Переводы",
        text: "Нажми сюда, чтобы перейти к переводам NXN."
      },
      transferScreen: {
        title: "Переводы NXN",
        text: "Здесь ты можешь отправлять NXN другим игрокам по их ID."
      },
      shopMenu: {
        title: "Магазин",
        text: "Нажми сюда, чтобы открыть магазин улучшений."
      },
      shopScreen: {
        title: "Магазин",
        text: "Улучшай силу тапа, энергию и покупай автокликер."
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
        text: "Выбери сумму и застейкай NXN для участия в наградном цикле."
      },
      stakeRef: {
        title: "Реферальный стейк",
        text: "Реферальные NXN можно использовать только для стейка."
      },
      stakeLB: {
        title: "Стейк-лидерборд",
        text: "Нажми сюда, чтобы посмотреть ТОП участников стейка и награды."
      },
      referralMenu: {
        title: "Рефералы",
        text: "Нажми сюда, чтобы перейти в реферальный раздел."
      },
      referralScreen: {
        title: "Реферальная программа",
        text:
          "Делитесь своим реферальным кодом и приглашайте друзей.\n\n" +
          "Вы и ваш друг получите по 50 000 NXN, которые можно использовать для стейка."
      },
      finish: {
        title: "Готово",
        text: "Теперь ты готов. Играй, стейкай и зарабатывай NXN!"
      }
    }
  };

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
      ${
        withNext
          ? `<div class="nxn-comment-actions">
               <button class="nxn-comment-btn">Next</button>
             </div>`
          : ""
      }
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

  function run() {
    const t = TEXT[lang];

    switch (step) {
      case -1:
        unlock();
        root.innerHTML = `
          <div class="nxn-comment nxn-lang-center">
            <div class="nxn-comment-title">Choose language</div>
            <div class="nxn-comment-text">Select the language to start the game</div>
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

      case 0: {
        const coin = document.getElementById("coin");
        showComment(t.tap, coin, false);
        coin.addEventListener("pointerdown", () => {
          step = 1;
          run();
        }, { once: true });
        break;
      }

      case 1:
        showComment(t.energy, document.getElementById("energy"), true);
        break;

      case 2: {
        const btn = document.querySelector('.menu [data-go="leaderboard"]');
        showComment(t.lbMenu, btn, false);
        btn.addEventListener("click", () => {
          step = 3;
          run();
        }, { once: true });
        break;
      }

      case 3:
        showComment(t.lbScreen, null, true);
        break;

      case 4: {
        const btn = document.querySelector('.menu [data-go="transfer"]');
        showComment(t.transferMenu, btn, false);
        btn.addEventListener("click", () => {
          step = 5;
          run();
        }, { once: true });
        break;
      }

      case 5:
        showComment(t.transferScreen, null, true);
        break;

      case 6: {
        const btn = document.querySelector('.menu [data-go="shop"]');
        showComment(t.shopMenu, btn, false);
        btn.addEventListener("click", () => {
          step = 7;
          run();
        }, { once: true });
        break;
      }

      case 7:
        showComment(t.shopScreen, null, true);
        break;

      case 8: {
        const btn = document.querySelector('.menu [data-go="tap"]');
        showComment(t.tapMenu, btn, false);
        btn.addEventListener("click", () => {
          step = 9;
          run();
        }, { once: true });
        break;
      }

      case 9: {
        const btn = document.getElementById("stake-btn");
        showComment(t.stakeBtn, btn, false);
        btn.addEventListener("click", () => {
          step = 10;
          run();
        }, { once: true });
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
  showComment(t.stakeLB, btn, false);

  btn.addEventListener("click", () => {
    // разрешаем ТОЛЬКО кнопку выхода
    setTimeout(() => {
      const back = document.getElementById("back-to-stake");
      if (back) {
        back.classList.add("allow-click");
        back.addEventListener("click", () => {
          step = 13;
          run();
        }, { once: true });
      }
    }, 400);
  }, { once: true });

  break;
}


      case 13: {
        const btn = document.getElementById("open-referral");
        showComment(t.referralMenu, btn, false);
        btn.addEventListener("click", () => {
          step = 14;
          run();
        }, { once: true });
        break;
      }

      case 14:
        showComment(t.referralScreen, null, true);
        break;

      case 15:
        showScreen("tap");
        showComment(t.finish, null, false);
        break;
    }
  }

  window.startNXNTutorial = function () {
    step = -1;
    run();
  };
})();
