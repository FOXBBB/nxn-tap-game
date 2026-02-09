/* ============== NXN GAME ONBOARDING (CLEAN FINAL) ============== */

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
      stakeLB: {
        title: "Стейк-лидерборд",
        text: "ТОП-500 участников получают награды каждый цикл."
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
        text: "Tap this icon to view the global ranking."
      },
      lbScreen: {
        title: "Global Ranking",
        text: "This screen shows the global player ranking."
      },
      transferMenu: {
        title: "Transfers",
        text: "Tap here to open the transfer section."
      },
      transferScreen: {
        title: "NXN Transfers",
        text: "Send NXN to other players using their ID."
      },
      shopMenu: {
        title: "Shop",
        text: "Tap here to open the upgrade shop."
      },
      shopScreen: {
        title: "Shop",
        text: "Upgrade tap power, energy and buy autoclicker."
      },
      tapMenu: {
        title: "Main Screen",
        text: "Tap here to return to the tap screen."
      },
      stakeBtn: {
        title: "Stake",
        text: "Tap here to participate in reward cycles."
      },
      stakeMain: {
        title: "NXN Staking",
        text: "Choose an amount and stake NXN to join the cycle."
      },
      stakeRef: {
        title: "Referral Stake",
        text: "Referral NXN can only be used for staking."
      },
      stakeLB: {
        title: "Stake Leaderboard",
        text: "Top 500 stakers receive rewards each cycle."
      },
      referralMenu: {
        title: "Referrals",
        text: "Tap here to open the referral section."
      },
      referralScreen: {
        title: "Referral Program",
        text:
          "Share your referral code and invite friends.\n\n" +
          "You and your friend will receive 50,000 NXN each for staking."
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
        text: "Oyuncu sıralamasını görmek için dokun."
      },
      lbScreen: {
        title: "Oyuncu Sıralaması",
        text: "Tüm oyuncuların genel sıralaması."
      },
      transferMenu: {
        title: "Transfer",
        text: "Transfer bölümüne git."
      },
      transferScreen: {
        title: "NXN Transfer",
        text: "NXN’i diğer oyunculara gönder."
      },
      shopMenu: {
        title: "Mağaza",
        text: "Mağazayı aç."
      },
      shopScreen: {
        title: "Mağaza",
        text: "Güç ve enerjini yükselt."
      },
      tapMenu: {
        title: "Ana Ekran",
        text: "Ana ekrana dön."
      },
      stakeBtn: {
        title: "Stake",
        text: "Ödül döngülerine katıl."
      },
      stakeMain: {
        title: "NXN Stake",
        text: "Bir miktar seç ve stake et."
      },
      stakeRef: {
        title: "Referans Stake",
        text: "Referans NXN sadece stake içindir."
      },
      stakeLB: {
        title: "Stake Sıralaması",
        text: "En iyi 500 stake yapan ödül alır."
      },
      referralMenu: {
        title: "Referans",
        text: "Referans bölümüne git."
      },
      referralScreen: {
        title: "Referans Programı",
        text:
          "Referans kodunu paylaş.\n\n" +
          "Sen ve arkadaşın stake için 50.000 NXN kazanırsınız."
      },
      finish: {
        title: "Hazır",
        text: "Hazırsın. İlk dokunuşunu yap ve NXN kazanmaya başla."
      }
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

  /* ================= MAIN FLOW ================= */

  function run() {
    const t = TEXT[lang];

    switch (step) {
      case -1:
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
          const back = document.getElementById("back-to-stake");
          if (back) {
            back.classList.add("allow-click");
            back.addEventListener("click", () => {
              step = 13;
              run();
            }, { once: true });
          }
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

      case 15: {
        const coin = document.getElementById("coin");
        showComment(t.finish, coin, false);
        coin.addEventListener("pointerdown", () => {
          unlock();
          root.innerHTML = "";
        }, { once: true });
        break;
      }
    }
  }

  /* ================= START ================= */

  window.startNXNTutorial = function () {
    step = -1;
    run();
  };
})();
