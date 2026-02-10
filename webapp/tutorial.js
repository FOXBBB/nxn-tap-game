/* ============== NXN GAME ONBOARDING (STABLE + POINTER) ============== */

(function () {
  const root = document.getElementById("nxn-tutorial-root");
  let step = -1;
  let lang = "RU";
  let pointer = null;

  /* ================= TEXTS ================= */

  const TEXT = {
    RU: {
      langTitle: "Choose language",
      langText: "Select language to start",

      tap: { title: "Тап", text: "Нажми на монету, чтобы заработать NXN." },
      energy: { title: "Энергия", text: "Каждый тап тратит энергию." },

      lbMenu: { title: "Лидерборд", text: "Нажми на иконку лидерборда." },
      lbScreen: { title: "Рейтинг", text: "Здесь рейтинг всех игроков." },

      transferMenu: { title: "Переводы", text: "Нажми, чтобы открыть переводы." },
      transferScreen: { title: "Переводы", text: "Здесь можно отправлять NXN." },

      shopMenu: { title: "Магазин", text: "Нажми, чтобы открыть магазин." },
      shopScreen: { title: "Магазин", text: "Улучши силу и энергию." },

      tapMenu: { title: "Главный экран", text: "Вернись на экран тапалки." },

      stakeBtn: { title: "Стейк", text: "Нажми, чтобы открыть стейк." },
      stakeMain: { title: "Стейк", text: "Застейкай NXN для наград." },

      stakeLB: { title: "Стейк-лидерборд", text: "Открой рейтинг стейка." },
      stakeBack: { title: "Назад", text: "Нажми назад, чтобы выйти." },

      referral: { title: "Рефералы", text: "Поделись кодом и получи 50 000 NXN." },

      finish: { title: "Готово", text: "Сделай первый тап и начинай игру." }
    },

    EN: {
      langTitle: "Choose language",
      langText: "Select language to start",

      tap: { title: "Tap", text: "Tap the coin to earn NXN." },
      energy: { title: "Energy", text: "Each tap consumes energy." },

      lbMenu: { title: "Leaderboard", text: "Tap leaderboard icon." },
      lbScreen: { title: "Ranking", text: "Global ranking." },

      transferMenu: { title: "Transfers", text: "Open transfers." },
      transferScreen: { title: "Transfers", text: "Send NXN to players." },

      shopMenu: { title: "Shop", text: "Open the shop." },
      shopScreen: { title: "Shop", text: "Upgrade power and energy." },

      tapMenu: { title: "Main screen", text: "Return to tap screen." },

      stakeBtn: { title: "Stake", text: "Open staking." },
      stakeMain: { title: "Stake", text: "Stake NXN to earn rewards." },

      stakeLB: { title: "Stake leaderboard", text: "Open stake ranking." },
      stakeBack: { title: "Back", text: "Exit leaderboard." },

      referral: { title: "Referrals", text: "Invite friends and earn NXN." },

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
      shopScreen: { title: "Mağaza", text: "Gücü ve enerjiyi artır." },

      tapMenu: { title: "Ana ekran", text: "Tap ekranına dön." },

      stakeBtn: { title: "Stake", text: "Stake aç." },
      stakeMain: { title: "Stake", text: "NXN stake et." },

      stakeLB: { title: "Stake sıralama", text: "Stake sıralamasını aç." },
      stakeBack: { title: "Geri", text: "Çıkmak için geri." },

      referral: { title: "Referans", text: "Arkadaş davet et." },

      finish: { title: "Hazır", text: "İlk dokunuşunu yap." }
    }
  };

  /* ================= HELPERS ================= */

  function clearAll() {
    root.innerHTML = "";
    document.body.classList.remove("tutorial-lock");
    document.querySelectorAll(".allow-click").forEach(e => e.classList.remove("allow-click"));
    if (pointer) pointer.remove();
    pointer = null;
  }

  function lock(target) {
    document.body.classList.add("tutorial-lock");
    if (target) target.classList.add("allow-click");
  }

  function showPointer(target) {
    if (!target) return;
    if (pointer) pointer.remove();

    pointer = document.createElement("div");
    pointer.className = "nxn-pointer";

    const r = target.getBoundingClientRect();
    pointer.style.left = r.left + r.width / 2 + "px";
    pointer.style.top = r.top - 14 + "px";

    root.appendChild(pointer);
  }

  function showComment({ title, text }, target) {
    clearAll();
    lock(target);
    showPointer(target);

    const box = document.createElement("div");
    box.className = "nxn-comment";
    box.innerHTML = `
      <div class="nxn-comment-title">${title}</div>
      <div class="nxn-comment-text">${text}</div>
    `;

    root.appendChild(box);

    if (target) {
      const r = target.getBoundingClientRect();
      let top = r.top - box.offsetHeight - 10;
      if (top < 10) top = r.bottom + 10;
      box.style.top = top + "px";
      box.style.left = Math.max(10, r.left + r.width / 2 - box.offsetWidth / 2) + "px";
    } else {
      box.style.top = "20vh";
      box.style.left = "50%";
      box.style.transform = "translateX(-50%)";
    }
  }

  /* ================= FLOW ================= */

  function run() {
    const t = TEXT[lang];

    switch (step) {

      case -1: {
        clearAll();
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
        showComment(t.tap, coin);
        coin.addEventListener("pointerdown", () => { step = 1; run(); }, { once: true });
        break;
      }

      case 1: {
        showComment(t.energy, document.getElementById("energy"));
        step = 2;
        setTimeout(run, 600);
        break;
      }

      case 2: {
        const btn = document.querySelector('[data-go="leaderboard"]');
        showComment(t.lbMenu, btn);
        btn.onclick = () => { step = 3; run(); };
        break;
      }

      case 3: {
        showComment(t.lbScreen, null);
        step = 4;
        setTimeout(run, 600);
        break;
      }

      case 4: {
        const btn = document.querySelector('[data-go="transfer"]');
        showComment(t.transferMenu, btn);
        btn.onclick = () => { step = 5; run(); };
        break;
      }

      case 5: {
        showComment(t.transferScreen, null);
        step = 6;
        setTimeout(run, 600);
        break;
      }

      case 6: {
        const btn = document.querySelector('[data-go="shop"]');
        showComment(t.shopMenu, btn);
        btn.onclick = () => { step = 7; run(); };
        break;
      }

      case 7: {
        showComment(t.shopScreen, null);
        step = 8;
        setTimeout(run, 600);
        break;
      }

      case 8: {
        const btn = document.querySelector('[data-go="tap"]');
        showComment(t.tapMenu, btn);
        btn.onclick = () => { step = 9; run(); };
        break;
      }

      case 9: {
        const btn = document.getElementById("stake-btn");
        showComment(t.stakeBtn, btn);
        btn.onclick = () => { step = 10; run(); };
        break;
      }

      case 10: {
        showComment(t.stakeMain, null);
        step = 11;
        setTimeout(run, 600);
        break;
      }

      case 11: {
        const btn = document.getElementById("open-stake-lb");
        showComment(t.stakeLB, btn);
        btn.onclick = () => { step = 12; run(); };
        break;
      }

      case 12: {
        const back = document.getElementById("back-to-stake");
        showComment(t.stakeBack, back);
        back.onclick = () => { step = 13; run(); };
        break;
      }

      case 13: {
        const btn = document.getElementById("open-referral");
        showComment(t.referral, btn);
        btn.onclick = () => { step = 14; run(); };
        break;
      }

      case 14: {
        if (window.showScreen) showScreen("tap");
        setTimeout(() => {
          const coin = document.getElementById("coin");
          showComment(t.finish, coin);
          coin.addEventListener("pointerdown", clearAll, { once: true });
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
