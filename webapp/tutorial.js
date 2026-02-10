/* ============== NXN GAME ONBOARDING (FINAL STABLE FULL) ============== */

(function () {
  const root = document.getElementById("nxn-tutorial-root");
  let step = -1;
  let lang = "EN";

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
        text: "Нажми на иконку лидерборда, чтобы посмотреть рейтинг игроков."
      },
      lbScreen: {
        title: "Рейтинг игроков",
        text: "Здесь отображается общий рейтинг всех игроков."
      },
      transferMenu: {
        title: "Переводы",
        text: "Нажми на иконку трансфера, чтобы отправлять NXN другим игрокам."
      },
      transferScreen: {
        title: "Переводы NXN",
        text: "Отправляй NXN другим игрокам по их ID."
      },
      shopMenu: {
        title: "Магазин",
        text: "Нажми на иконку магазина, чтобы купить улучшения."
      },
      shopScreen: {
        title: "Магазин",
        text: "Улучши силу тапа, энергию и покупай автокликер."
      },
      tapMenu: {
        title: "Главный экран",
        text: "Нажми на иконку тапа, чтобы вернуться на главный экран."
      },
      stakeBtn: {
        title: "Стейк",
        text: "Нажми кнопку STAKE, чтобы участвовать в наградных циклах."
      },
      stakeMain: {
        title: "Стейк NXN",
        text: "Выбери сумму и застейкай NXN для участия в цикле."
      },
      finish: {
        title: "Готово",
        text: "Теперь ты готов. Сделай первый тап и начинай зарабатывать NXN."
      }
    },

    EN: {
      langTitle: "Language",
      langText: "Choose your language to start",

      tap: {
        title: "Tap",
        text: "Tap the coin to earn NXN. Each tap gives you coins."
      },
      energy: {
        title: "Energy",
        text: "Each tap consumes energy. When energy runs out, taps stop."
      },
      lbMenu: {
        title: "Leaderboard",
        text: "Tap the leaderboard icon to view player rankings."
      },
      lbScreen: {
        title: "Global Ranking",
        text: "This screen shows the global ranking of all players."
      },
      transferMenu: {
        title: "Transfers",
        text: "Tap the transfer icon to send NXN to other players."
      },
      transferScreen: {
        title: "NXN Transfers",
        text: "Send NXN to other players using their ID."
      },
      shopMenu: {
        title: "Shop",
        text: "Tap the shop icon to buy upgrades."
      },
      shopScreen: {
        title: "Shop",
        text: "Upgrade tap power, energy and buy autoclicker."
      },
      tapMenu: {
        title: "Main Screen",
        text: "Tap the tap icon to return to the main screen."
      },
      stakeBtn: {
        title: "Stake",
        text: "Tap the STAKE button to participate in reward cycles."
      },
      stakeMain: {
        title: "NXN Staking",
        text: "Choose an amount and stake NXN to join the cycle."
      },
      finish: {
        title: "All Set",
        text: "You are ready. Make your first tap and start earning NXN."
      }
    },

    TR: {
      langTitle: "Dil",
      langText: "Başlamak için dil seçin",

      tap: {
        title: "Dokun",
        text: "NXN kazanmak için coin'e dokun."
      },
      energy: {
        title: "Enerji",
        text: "Her dokunuş enerji harcar."
      },
      lbMenu: {
        title: "Sıralama",
        text: "Oyuncu sıralamasını görmek için simgeye dokun."
      },
      lbScreen: {
        title: "Oyuncu Sıralaması",
        text: "Burada tüm oyuncuların genel sıralaması gösterilir."
      },
      transferMenu: {
        title: "Transfer",
        text: "NXN göndermek için transfer simgesine dokun."
      },
      transferScreen: {
        title: "NXN Transfer",
        text: "NXN'i diğer oyunculara gönder."
      },
      shopMenu: {
        title: "Mağaza",
        text: "Yükseltmeler için mağazaya gir."
      },
      shopScreen: {
        title: "Mağaza",
        text: "Gücünü ve enerjini artır."
      },
      tapMenu: {
        title: "Ana Ekran",
        text: "Ana ekrana dönmek için dokun."
      },
      stakeBtn: {
        title: "Stake",
        text: "Ödül döngülerine katılmak için stake yap."
      },
      stakeMain: {
        title: "NXN Stake",
        text: "Miktar seç ve stake et."
      },
      finish: {
        title: "Hazır",
        text: "Hazırsın. İlk dokunuşunu yap ve başla."
      }
    }
  };

  /* ================= HELPERS ================= */

  function clearUI() {
    root.innerHTML = "";
    document.body.classList.remove("tutorial-lock");
    document.querySelectorAll(".allow-click").forEach(el =>
      el.classList.remove("allow-click")
    );
  }

  function lock(screen, clickable) {
    document.body.classList.add("tutorial-lock");
    if (screen) screen.classList.add("allow-click");
    if (clickable) clickable.classList.add("allow-click");
  }

  function showTopComment({ title, text }, withNext = false) {
    root.innerHTML = `
      <div class="nxn-comment nxn-lang-center">
        <div class="nxn-comment-title">${title}</div>
        <div class="nxn-comment-text">${text.replace(/\n/g, "<br>")}</div>
        ${
          withNext
            ? `<div class="nxn-comment-actions">
                 <button class="nxn-comment-btn">Next</button>
               </div>`
            : ""
        }
      </div>
    `;

    if (withNext) {
      root.querySelector(".nxn-comment-btn").onclick = () => {
        step++;
        run();
      };
    }
  }

  /* ================= FLOW ================= */

  function run() {
    const t = TEXT[lang];
    clearUI();

    switch (step) {

      case -1:
        showTopComment(
          { title: TEXT.EN.langTitle, text: TEXT.EN.langText }
        );
        root.querySelector(".nxn-comment-actions")?.remove();
        root.querySelector(".nxn-lang-center").insertAdjacentHTML(
          "beforeend",
          `
          <div class="nxn-comment-actions">
            <button class="nxn-comment-btn" data-lang="RU">RU</button>
            <button class="nxn-comment-btn" data-lang="EN">EN</button>
            <button class="nxn-comment-btn" data-lang="TR">TR</button>
          </div>
        `
        );
        lock();
        root.querySelectorAll("[data-lang]").forEach(b => {
          b.onclick = () => {
            lang = b.dataset.lang;
            step = 0;
            run();
          };
        });
        break;

      case 0: {
        const screen = document.getElementById("tap");
        const coin = document.getElementById("coin");
        showTopComment(t.tap);
        lock(screen, coin);
        coin.onclick = () => { step = 1; run(); };
        break;
      }

      case 1:
        showTopComment(t.energy, true);
        lock(document.getElementById("tap"));
        break;

      case 2: {
        const btn = document.querySelector('[data-go="leaderboard"]');
        showTopComment(t.lbMenu);
        lock(document.getElementById("tap"), btn);
        btn.onclick = () => { step = 3; run(); };
        break;
      }

      case 3:
        showTopComment(t.lbScreen, true);
        lock(document.getElementById("leaderboard"));
        break;

      case 4: {
        const btn = document.querySelector('[data-go="transfer"]');
        showTopComment(t.transferMenu);
        lock(document.getElementById("leaderboard"), btn);
        btn.onclick = () => { step = 5; run(); };
        break;
      }

      case 5:
        showTopComment(t.transferScreen, true);
        lock(document.getElementById("transfer"));
        break;

      case 6: {
        const btn = document.querySelector('[data-go="shop"]');
        showTopComment(t.shopMenu);
        lock(document.getElementById("transfer"), btn);
        btn.onclick = () => { step = 7; run(); };
        break;
      }

      case 7:
        showTopComment(t.shopScreen, true);
        lock(document.getElementById("shop"));
        break;

      case 8: {
        const btn = document.querySelector('[data-go="tap"]');
        showTopComment(t.tapMenu);
        lock(document.getElementById("shop"), btn);
        btn.onclick = () => { step = 9; run(); };
        break;
      }

      case 9: {
        const screen = document.getElementById("tap");
        const btn = document.getElementById("stake-btn");
        showTopComment(t.stakeBtn);
        lock(screen, btn);
        btn.onclick = () => { step = 10; run(); };
        break;
      }

      case 10:
        showTopComment(t.stakeMain, true);
        lock(document.getElementById("stake-screen"));
        break;

      case 11: {
        const screen = document.getElementById("tap");
        const coin = document.getElementById("coin");
        showTopComment(t.finish);
        lock(screen, coin);
        coin.onclick = () => { clearUI(); };
        break;
      }
    }
  }

  window.startNXNTutorial = function () {
    step = -1;
    run();
  };
})();
