/* ============== NXN GAME ONBOARDING (STABLE FINAL) ============== */

(function () {
  const root = document.getElementById("nxn-tutorial-root");
  let step = -1;
  let lang = "RU";

  /* ================= TEXTS (НЕ ТРОГАЮ) ================= */
  const TEXT = window.TEXT_NXN || TEXT; // если ты вынес TEXT отдельно — ок

  /* ================= DOM HELPERS ================= */

  function clearUI() {
    root.innerHTML = "";
    document.querySelectorAll(".nxn-pointer, .nxn-line").forEach(e => e.remove());
    document.body.classList.remove("tutorial-lock");
    document.querySelectorAll(".allow-click").forEach(el =>
      el.classList.remove("allow-click")
    );
  }

  function lock(target) {
    document.body.classList.add("tutorial-lock");
    if (target) target.classList.add("allow-click");
  }

  function drawPointer(target, box) {
    if (!target || !box) return;

    const tr = target.getBoundingClientRect();
    const br = box.getBoundingClientRect();

    const px = tr.left + tr.width / 2;
    const py = tr.top + tr.height / 2;

    const bx = br.left + br.width / 2;
    const by = br.top + br.height;

    const pointer = document.createElement("div");
    pointer.className = "nxn-pointer";
    pointer.style.left = px + "px";
    pointer.style.top = py + "px";

    const line = document.createElement("div");
    line.className = "nxn-line";

    const dx = px - bx;
    const dy = py - by;
    const len = Math.sqrt(dx * dx + dy * dy);

    line.style.width = len + "px";
    line.style.left = bx + "px";
    line.style.top = by + "px";
    line.style.transform = `rotate(${Math.atan2(dy, dx)}rad)`;

    root.appendChild(line);
    root.appendChild(pointer);
  }

  function showComment({ title, text }, target, withNext) {
    clearUI();

    const box = document.createElement("div");
    box.className = "nxn-comment big";
    box.innerHTML = `
      <div class="nxn-comment-title">${title}</div>
      <div class="nxn-comment-text">${text.replace(/\n/g, "<br>")}</div>
      ${withNext ? `<div class="nxn-comment-actions"><button class="nxn-comment-btn">Next</button></div>` : ""}
    `;

    root.appendChild(box);

    if (target) {
      lock(target);

      const r = target.getBoundingClientRect();
      const boxH = 160;

      let top = r.top - boxH - 12;
      if (top < 10) top = r.bottom + 12;

      box.style.top = top + "px";
      box.style.left = Math.max(12, r.left + r.width / 2 - 160) + "px";

      requestAnimationFrame(() => drawPointer(target, box));
    } else {
      lock();
      box.style.top = "20vh";
      box.style.left = "50%";
      box.style.transform = "translateX(-50%)";
    }

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

      /* ===== LANGUAGE ===== */
      case -1: {
        const tLang = TEXT.EN;
        clearUI();

        root.innerHTML = `
          <div class="nxn-comment nxn-lang-center">
            <div class="nxn-comment-title">${tLang.langTitle}</div>
            <div class="nxn-comment-text">${tLang.langText}</div>
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

      /* ===== TAP ===== */
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

      /* ===== LEADERBOARD ===== */
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

      /* ===== TRANSFER ===== */
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

      /* ===== SHOP ===== */
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

      /* ===== BACK TO TAP ===== */
      case 8: {
        const btn = document.querySelector('.menu [data-go="tap"]');
        showComment(t.tapMenu, btn, false);
        btn.addEventListener("click", () => {
          step = 9;
          run();
        }, { once: true });
        break;
      }

      /* ===== STAKE ===== */
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

      /* ===== STAKE LEADERBOARD ===== */
      case 12: {
        const btn = document.getElementById("open-stake-lb");
        showComment(t.stakeLBEnter, btn, false);
        btn.addEventListener("click", () => {
          step = 13;
          run();
        }, { once: true });
        break;
      }

      case 13: {
        const back = document.getElementById("back-to-stake");
        showComment(t.stakeLBExit, back, false);
        back.addEventListener("click", () => {
          step = 14;
          run();
        }, { once: true });
        break;
      }

      /* ===== REFERRAL ===== */
      case 14: {
        const btn = document.getElementById("open-referral");
        showComment(t.referralMenu, btn, false);
        btn.addEventListener("click", () => {
          step = 15;
          run();
        }, { once: true });
        break;
      }

      case 15:
        showComment(t.referralScreen, null, true);
        break;

      /* ===== FINISH ===== */
      case 16: {
        if (window.showScreen) showScreen("tap");
        setTimeout(() => {
          const coin = document.getElementById("coin");
          showComment(t.finish, coin, false);
          coin.addEventListener("pointerdown", () => {
            clearUI();
          }, { once: true });
        }, 300);
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
