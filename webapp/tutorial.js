/* ============== NXN GAME ONBOARDING (FULL STABLE FINAL) ============== */

(function () {
  const root = document.getElementById("nxn-tutorial-root");
  let step = -1;
  let lang = "RU";

  /* ================= TEXTS ================= */

  const TEXT = {
    RU: {
      langTitle: "Choose language",
      langText: "Select language to start",

      tap: { title: "Тап", text: "Нажимай на монету, чтобы зарабатывать NXN." },
      energy: { title: "Энергия", text: "Каждый тап тратит энергию." },

      lbMenu: { title: "Лидерборд", text: "Нажми на иконку лидерборда." },
      lbScreen: { title: "Рейтинг", text: "Здесь общий рейтинг игроков." },

      transferMenu: { title: "Переводы", text: "Нажми, чтобы перейти в переводы." },
      transferScreen: { title: "Переводы", text: "Отправляй NXN другим игрокам." },

      shopMenu: { title: "Магазин", text: "Нажми, чтобы открыть магазин." },
      shopScreen: { title: "Магазин", text: "Улучши тап и энергию." },

      tapMenu: { title: "Главный экран", text: "Вернись на тапалку." },

      stakeBtn: { title: "Стейк", text: "Нажми, чтобы открыть стейк." },
      stakeMain: { title: "Стейк", text: "Застейкай NXN для участия в цикле." },
      stakeRef: { title: "Реферальный стейк", text: "Реферальные NXN только для стейка." },

      stakeLBEnter: { title: "Стейк-лидерборд", text: "Открой рейтинг стейка." },
      stakeLBExit: { title: "Назад", text: "Нажми назад, чтобы выйти." },

      referralMenu: { title: "Рефералы", text: "Перейди в реферальный раздел." },
      referralScreen: {
        title: "Рефералы",
        text: "Делись кодом и получай по 50 000 NXN для стейка."
      },

      finish: { title: "Готово", text: "Сделай первый тап и начинай игру." }
    },

    EN: {
      langTitle: "Choose language",
      langText: "Select language to start",

      tap: { title: "Tap", text: "Tap the coin to earn NXN." },
      energy: { title: "Energy", text: "Each tap consumes energy." },

      lbMenu: { title: "Leaderboard", text: "Tap leaderboard icon." },
      lbScreen: { title: "Ranking", text: "Global player ranking." },

      transferMenu: { title: "Transfers", text: "Open transfers." },
      transferScreen: { title: "Transfers", text: "Send NXN to players." },

      shopMenu: { title: "Shop", text: "Open the shop." },
      shopScreen: { title: "Shop", text: "Upgrade tap and energy." },

      tapMenu: { title: "Main screen", text: "Return to tap screen." },

      stakeBtn: { title: "Stake", text: "Open staking." },
      stakeMain: { title: "Stake", text: "Stake NXN to join cycle." },
      stakeRef: { title: "Referral stake", text: "Referral NXN only for staking." },

      stakeLBEnter: { title: "Stake leaderboard", text: "Open stake ranking." },
      stakeLBExit: { title: "Back", text: "Exit leaderboard." },

      referralMenu: { title: "Referrals", text: "Open referral section." },
      referralScreen: {
        title: "Referrals",
        text: "Share your code and get 50,000 NXN each."
      },

      finish: { title: "Done", text: "Make your first tap." }
    },

    TR: {
      langTitle: "Dil seç",
      langText: "Başlamak için dil seç",

      tap: { title: "Dokun", text: "NXN kazanmak için coin'e dokun." },
      energy: { title: "Enerji", text: "Her dokunuş enerji harcar." },

      lbMenu: { title: "Sıralama", text: "Sıralamaya dokun." },
      lbScreen: { title: "Sıralama", text: "Oyuncu sıralaması." },

      transferMenu: { title: "Transfer", text: "Transferleri aç." },
      transferScreen: { title: "Transfer", text: "NXN gönder." },

      shopMenu: { title: "Mağaza", text: "Mağazayı aç." },
      shopScreen: { title: "Mağaza", text: "Güç ve enerjiyi artır." },

      tapMenu: { title: "Ana ekran", text: "Tap ekranına dön." },

      stakeBtn: { title: "Stake", text: "Stake aç." },
      stakeMain: { title: "Stake", text: "NXN stake et." },
      stakeRef: { title: "Referans stake", text: "Referans NXN sadece stake." },

      stakeLBEnter: { title: "Stake sıralama", text: "Stake sıralamasını aç." },
      stakeLBExit: { title: "Geri", text: "Çıkmak için geri." },

      referralMenu: { title: "Referans", text: "Referans bölümü." },
      referralScreen: {
        title: "Referans",
        text: "Kodu paylaş ve 50.000 NXN kazan."
      },

      finish: { title: "Hazır", text: "İlk dokunuşunu yap." }
    }
  };

  /* ================= HELPERS ================= */

  function clearUI() {
    root.innerHTML = "";
    document.body.classList.remove("tutorial-lock");
    document.querySelectorAll(".allow-click").forEach(e =>
      e.classList.remove("allow-click")
    );
  }

  function lock(target) {
    document.body.classList.add("tutorial-lock");
    if (target) target.classList.add("allow-click");
  }

  function showComment({ title, text }) {
    root.innerHTML = `
      <div class="nxn-comment nxn-fixed-bottom">
        <div class="nxn-comment-title">${title}</div>
        <div class="nxn-comment-text">${text}</div>
      </div>
    `;
  }

  /* ================= FLOW ================= */

  function run() {
    const t = TEXT[lang];

    switch (step) {

      case -1: {
        clearUI();
        root.innerHTML = `
          <div class="nxn-comment nxn-lang-center">
            <div class="nxn-comment-title">Choose language</div>
            <div class="nxn-comment-actions">
              <button class="nxn-comment-btn" data-lang="RU">RU</button>
              <button class="nxn-comment-btn" data-lang="EN">EN</button>
              <button class="nxn-comment-btn" data-lang="TR">TR</button>
            </div>
          </div>
        `;
        lock();
        document.querySelectorAll("[data-lang]").forEach(b => {
          b.onclick = () => { lang = b.dataset.lang; step = 0; run(); };
        });
        break;
      }

      case 0: {
        const coin = document.getElementById("coin");
        showComment(t.tap);
        lock(coin);
        coin.addEventListener("pointerdown", () => { step = 1; run(); }, { once: true });
        break;
      }

      case 1:
        showComment(t.energy);
        step = 2; setTimeout(run, 400);
        break;

      case 2: {
        const btn = document.querySelector('[data-go="leaderboard"]');
        showComment(t.lbMenu);
        lock(btn);
        btn.onclick = () => { step = 3; run(); };
        break;
      }

      case 3:
        showComment(t.lbScreen);
        step = 4; setTimeout(run, 400);
        break;

      case 4: {
        const btn = document.querySelector('[data-go="transfer"]');
        showComment(t.transferMenu);
        lock(btn);
        btn.onclick = () => { step = 5; run(); };
        break;
      }

      case 5:
        showComment(t.transferScreen);
        step = 6; setTimeout(run, 400);
        break;

      case 6: {
        const btn = document.querySelector('[data-go="shop"]');
        showComment(t.shopMenu);
        lock(btn);
        btn.onclick = () => { step = 7; run(); };
        break;
      }

      case 7:
        showComment(t.shopScreen);
        step = 8; setTimeout(run, 400);
        break;

      case 8: {
        const btn = document.querySelector('[data-go="tap"]');
        showComment(t.tapMenu);
        lock(btn);
        btn.onclick = () => { step = 9; run(); };
        break;
      }

      case 9: {
        const btn = document.getElementById("stake-btn");
        showComment(t.stakeBtn);
        lock(btn);
        btn.onclick = () => { step = 10; run(); };
        break;
      }

      case 10:
        showComment(t.stakeMain);
        step = 11; setTimeout(run, 400);
        break;

      case 11:
        showComment(t.stakeRef);
        step = 12; setTimeout(run, 400);
        break;

      case 12: {
        const btn = document.getElementById("open-stake-lb");
        showComment(t.stakeLBEnter);
        lock(btn);
        btn.onclick = () => { step = 13; run(); };
        break;
      }

      case 13: {
        const back = document.getElementById("back-to-stake");
        showComment(t.stakeLBExit);
        lock(back);
        back.onclick = () => { step = 14; run(); };
        break;
      }

      case 14: {
        const btn = document.getElementById("open-referral");
        showComment(t.referralMenu);
        lock(btn);
        btn.onclick = () => { step = 15; run(); };
        break;
      }

      case 15:
        showComment(t.referralScreen);
        step = 16; setTimeout(run, 400);
        break;

      case 16: {
        if (window.showScreen) showScreen("tap");
        setTimeout(() => {
          const coin = document.getElementById("coin");
          showComment(t.finish);
          lock(coin);
          coin.addEventListener("pointerdown", clearUI, { once: true });
        }, 300);
        break;
      }
    }
  }

  window.startNXNTutorial = function () {
    step = -1;
    run();
  };

})();
