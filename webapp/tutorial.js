/* ============== NXN TUTORIAL (STABLE FROM ZERO) ============== */

(function () {
  const root = document.getElementById("nxn-tutorial-root");
  root.className = "nxn-tutorial-root";

  let step = -1;
  let lang = "EN";
  let finger = null;

  /* ===== TEXTS ===== */

  const TEXT = {
    EN: {
      langTitle: "Language",
      langText: "Choose your language to start",
      tap: "Tap the coin to earn NXN.",
      energy: "Each tap consumes energy.",
      lbGo: "Tap the leaderboard icon.",
      lbInfo: "This is the global ranking of players.",
      transferGo: "Tap Transfer.",
      transferInfo: "Send NXN to other players by ID.",
      shopGo: "Tap Shop.",
      shopInfo: "Upgrade tap power and energy.",
      finish: "Done! Tap the coin and start earning."
    },
    RU: {
      langTitle: "Language",
      langText: "Choose your language to start",
      tap: "Нажимай на монету, чтобы зарабатывать NXN.",
      energy: "Каждый тап тратит энергию.",
      lbGo: "Нажми на иконку лидерборда.",
      lbInfo: "Здесь показан рейтинг игроков.",
      transferGo: "Нажми на трансфер.",
      transferInfo: "Отправляй NXN по ID.",
      shopGo: "Нажми на магазин.",
      shopInfo: "Улучшай силу тапа и энергию.",
      finish: "Готово! Тапай и зарабатывай."
    },
    TR: {
      langTitle: "Language",
      langText: "Choose your language to start",
      tap: "NXN kazanmak için coin'e dokun.",
      energy: "Her dokunuş enerji harcar.",
      lbGo: "Sıralama ikonuna dokun.",
      lbInfo: "Oyuncu sıralaması burada.",
      transferGo: "Transfer'e dokun.",
      transferInfo: "NXN ID ile gönder.",
      shopGo: "Mağazaya dokun.",
      shopInfo: "Gücü ve enerjiyi yükselt.",
      finish: "Hazır! Dokun ve kazan."
    }
  };

  /* ===== HELPERS ===== */

  function lock(target) {
    document.body.classList.add("nxn-lock");
    if (target) target.classList.add("nxn-allow");
  }

  function unlock() {
    document.body.classList.remove("nxn-lock");
    document.querySelectorAll(".nxn-allow").forEach(e =>
      e.classList.remove("nxn-allow")
    );
  }

  function clear() {
    root.innerHTML = "";
    unlock();
    if (finger) finger.remove();
    finger = null;
  }

  function typeText(el, text, cb) {
    el.textContent = "";
    el.classList.add("nxn-typing");
    let i = 0;
    const t = setInterval(() => {
      el.textContent += text[i++];
      if (i >= text.length) {
        clearInterval(t);
        el.classList.remove("nxn-typing");
        cb && cb();
      }
    }, 22);
  }

  function showComment(title, text, withNext, onNext) {
    clear();

    const box = document.createElement("div");
    box.className = "nxn-comment";
    box.innerHTML = `
      <div class="nxn-comment-title">${title}</div>
      <div class="nxn-comment-text"></div>
      ${withNext ? `<div class="nxn-comment-actions"><button class="nxn-comment-btn">Next</button></div>` : ""}
    `;

    root.appendChild(box);

    const textEl = box.querySelector(".nxn-comment-text");
    typeText(textEl, text, () => {
      if (withNext) {
        box.querySelector("button").onclick = onNext;
      }
    });
  }

  function showFinger(target) {
    const r = target.getBoundingClientRect();
    finger = document.createElement("div");
    finger.className = "nxn-finger";
    finger.style.left = r.left + r.width / 2 - 22 + "px";
    finger.style.top = r.top + r.height / 2 - 22 + "px";
    document.body.appendChild(finger);
  }

  /* ===== FLOW ===== */

  function run() {
    const t = TEXT[lang];

    switch (step) {

      case -1:
        clear();
        showComment(
          TEXT.EN.langTitle,
          TEXT.EN.langText,
          false
        );
        root.querySelector(".nxn-comment-actions")?.remove();

        const box = root.querySelector(".nxn-comment");
        box.innerHTML += `
          <div class="nxn-comment-actions">
            <button class="nxn-comment-btn" data-l="EN">EN</button>
            <button class="nxn-comment-btn" data-l="RU">RU</button>
            <button class="nxn-comment-btn" data-l="TR">TR</button>
          </div>
        `;

        lock();
        box.querySelectorAll("button").forEach(b => {
          b.onclick = () => {
            lang = b.dataset.l;
            step = 0;
            run();
          };
        });
        break;

      case 0: {
        const coin = document.getElementById("coin");
        showComment("Tap", t.tap, false);
        lock(coin);
        coin.addEventListener("pointerdown", () => {
          step = 1;
          run();
        }, { once: true });
        break;
      }

      case 1:
        showComment("Energy", t.energy, true, () => {
          step = 2;
          run();
        });
        break;

      case 2: {
        const lb = document.querySelector('[data-go="leaderboard"]');
        showComment("Leaderboard", t.lbGo, false);
        lock(lb);
        showFinger(lb);
        lb.addEventListener("click", () => {
          step = 3;
          run();
        }, { once: true });
        break;
      }

      case 3:
        showComment("Leaderboard", t.lbInfo, true, () => {
          step = 4;
          run();
        });
        break;

      case 4: {
        const tr = document.querySelector('[data-go="transfer"]');
        showComment("Transfer", t.transferGo, false);
        lock(tr);
        showFinger(tr);
        tr.addEventListener("click", () => {
          step = 5;
          run();
        }, { once: true });
        break;
      }

      case 5:
        showComment("Transfer", t.transferInfo, true, () => {
          step = 6;
          run();
        });
        break;

      case 6: {
        const shop = document.querySelector('[data-go="shop"]');
        showComment("Shop", t.shopGo, false);
        lock(shop);
        showFinger(shop);
        shop.addEventListener("click", () => {
          step = 7;
          run();
        }, { once: true });
        break;
      }

      case 7:
        showComment("Finish", t.finish, false);
        unlock();
        break;
    }
  }

  window.startNXNTutorial = function () {
    step = -1;
    run();
  };
})();
