/* ============== NXN GAME ONBOARDING (FINAL STABLE) ============== */

(function () {
  const root = document.getElementById("nxn-tutorial-root");
  let step = -1;
  let lang = "EN";
  let finger = null;

  /* ================= TEXTS ================= */

  const TEXT = {
    EN: {
      langTitle: "Choose language",
      langText: "Select your language to start",

      tap: { title: "Tap", text: "Tap the coin to earn NXN." },
      energy: { title: "Energy", text: "Each tap consumes energy." },

      lbGo: { title: "Leaderboard", text: "Tap the leaderboard icon." },
      lbInfo: { title: "Leaderboard", text: "This is the global player ranking." },

      transferGo: { title: "Transfer", text: "Tap Transfer." },
      transferInfo: { title: "Transfer", text: "Send NXN to other players by ID." },

      shopGo: { title: "Shop", text: "Tap Shop." },
      shopInfo: { title: "Shop", text: "Buy upgrades and boost progress." },

      backTap: { title: "Main screen", text: "Return to main screen." },

      stakeGo: { title: "Stake", text: "Tap Stake to open staking." },
      stakeInfo: { title: "Stake", text: "Stake NXN to earn rewards." },
      stakeNXN: { title: "Stake NXN", text: "Choose amount and confirm." },
      stakeRef: { title: "Referral stake", text: "Referral NXN is for staking only." },

      stakeLBGo: { title: "Stake leaderboard", text: "Open stake leaderboard." },
      stakeLBInfo: { title: "Stake leaderboard", text: "Top stakers earn rewards." },
      stakeLBBack: { title: "Back", text: "Tap Back to exit." },

      referralGo: { title: "Referral", text: "Open referral section." },
      referralInfo: {
        title: "Referral",
        text: "Share your code.\nYou and your friend get 50,000 NXN for staking."
      },

      finish: { title: "Done", text: "Tap the coin and start playing." }
    }
  };

  /* ================= HELPERS ================= */

  function clearUI() {
    root.innerHTML = "";
    if (finger) finger.remove();
    finger = null;
    document.body.classList.remove("tutorial-lock");
    document.querySelectorAll(".allow-click").forEach(e =>
      e.classList.remove("allow-click")
    );
  }

  function lockOnly(target) {
    document.body.classList.add("tutorial-lock");
    if (target) target.classList.add("allow-click");
  }

  function showFinger(target) {
    if (!target) return;
    const r = target.getBoundingClientRect();
    finger = document.createElement("div");
    finger.className = "nxn-finger";
    finger.style.left = r.left + r.width / 2 - 23 + "px";
    finger.style.top = r.top + r.height / 2 - 23 + "px";
    document.body.appendChild(finger);
  }

  function showComment({ title, text }, withNext) {
    clearUI();

    const box = document.createElement("div");
    box.className = "nxn-comment";
    box.innerHTML = `
      <div class="nxn-comment-title">${title}</div>
      <div class="nxn-comment-text">${text.replace(/\n/g, "<br>")}</div>
      ${withNext ? `<div class="nxn-comment-actions"><button class="nxn-comment-btn">Next</button></div>` : ""}
    `;

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
    const t = TEXT[lang];

    switch (step) {

      case -1:
        clearUI();
        const box = document.createElement("div");
        box.className = "nxn-comment nxn-lang-center";
        box.innerHTML = `
          <div class="nxn-comment-title">${t.langTitle}</div>
          <div class="nxn-comment-text">${t.langText}</div>
          <div class="nxn-comment-actions">
            <button class="nxn-comment-btn" data-lang="EN">EN</button>
            <button class="nxn-comment-btn" data-lang="RU">RU</button>
            <button class="nxn-comment-btn" data-lang="TR">TR</button>
          </div>
        `;
        root.appendChild(box);
        document.querySelectorAll("[data-lang]").forEach(b => {
          b.onclick = () => {
            lang = b.dataset.lang;
            step = 0;
            run();
          };
        });
        break;

      case 0: {
        showComment(t.tap, false);
        const coin = document.getElementById("coin");
        lockOnly(coin);
        showFinger(coin);
        coin.addEventListener("pointerdown", () => {
          step = 1;
          run();
        }, { once: true });
        break;
      }

      case 1:
        showComment(t.energy, true);
        break;

      case 2: {
        showComment(t.lbGo, false);
        const btn = document.querySelector('[data-go="leaderboard"]');
        lockOnly(btn);
        showFinger(btn);
        btn.addEventListener("click", () => {
          step = 3;
          run();
        }, { once: true });
        break;
      }

      case 3:
        showComment(t.lbInfo, true);
        break;

      case 4: {
        showComment(t.transferGo, false);
        const btn = document.querySelector('[data-go="transfer"]');
        lockOnly(btn);
        showFinger(btn);
        btn.addEventListener("click", () => {
          step = 5;
          run();
        }, { once: true });
        break;
      }

      case 5:
        showComment(t.transferInfo, true);
        break;

      case 6: {
        showComment(t.shopGo, false);
        const btn = document.querySelector('[data-go="shop"]');
        lockOnly(btn);
        showFinger(btn);
        btn.addEventListener("click", () => {
          step = 7;
          run();
        }, { once: true });
        break;
      }

      case 7:
        showComment(t.shopInfo, true);
        break;

      case 8: {
        showComment(t.backTap, false);
        const btn = document.querySelector('[data-go="tap"]');
        lockOnly(btn);
        showFinger(btn);
        btn.addEventListener("click", () => {
          step = 9;
          run();
        }, { once: true });
        break;
      }

      case 9: {
        showComment(t.stakeGo, false);
        const btn = document.getElementById("stake-btn");
        lockOnly(btn);
        showFinger(btn);
        btn.addEventListener("click", () => {
          step = 10;
          run();
        }, { once: true });
        break;
      }

      case 10:
        showComment(t.stakeInfo, true);
        break;

      case 11:
        showComment(t.stakeNXN, true);
        break;

      case 12:
        showComment(t.stakeRef, true);
        break;

      case 13: {
        showComment(t.stakeLBGo, false);
        const btn = document.getElementById("open-stake-lb");
        lockOnly(btn);
        showFinger(btn);
        btn.addEventListener("click", () => {
          step = 14;
          run();
        }, { once: true });
        break;
      }

      case 14:
        showComment(t.stakeLBInfo, true);
        break;

      case 15: {
        showComment(t.stakeLBBack, false);
        const btn = document.getElementById("back-to-stake");
        lockOnly(btn);
        showFinger(btn);
        btn.addEventListener("click", () => {
          step = 16;
          run();
        }, { once: true });
        break;
      }

      case 16: {
        showComment(t.referralGo, false);
        const btn = document.getElementById("open-referral");
        lockOnly(btn);
        showFinger(btn);
        btn.addEventListener("click", () => {
          step = 17;
          run();
        }, { once: true });
        break;
      }

      case 17:
        showComment(t.referralInfo, true);
        break;

      case 18: {
        showComment(t.finish, false);
        const coin = document.getElementById("coin");
        lockOnly(coin);
        showFinger(coin);
        coin.addEventListener("pointerdown", () => {
          clearUI();
        }, { once: true });
        break;
      }
    }
  }

  window.startNXNTutorial = function () {
    step = -1;
    run();
  };
})();
