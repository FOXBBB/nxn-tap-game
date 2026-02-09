/* ============== NXN COMMENTARY TUTORIAL (FINAL FIX) ============== */

(function () {
  const rootId = "nxn-tutorial-root";
  let step = -1;
  let lang = "EN";

  const steps = {
    EN: [
      { screen: "tap", title: "Tap", text: "Tap the coin to earn NXN.", target: "#coin" },
      { screen: "tap", title: "Energy", text: "Each tap consumes energy.", target: "#energy" },
      { screen: "leaderboard", title: "Leaderboard", text: "Compete with other players." },
      { screen: "transfer", title: "Transfer", text: "Send NXN to other players." },
      { screen: "shop", title: "Shop", text: "Upgrade your power and energy." },
      { screen: "tap", title: "Stake", text: "Stake NXN to earn rewards every cycle." },
      { screen: "tap", title: "Finish", text: "Play, stake and earn NXN!" }
    ],
    RU: [
      { screen: "tap", title: "Тап", text: "Нажимай на монету и зарабатывай NXN.", target: "#coin" },
      { screen: "tap", title: "Энергия", text: "Каждый тап тратит энергию.", target: "#energy" },
      { screen: "leaderboard", title: "Лидерборд", text: "Соревнуйся с другими игроками." },
      { screen: "transfer", title: "Переводы", text: "Отправляй NXN другим игрокам." },
      { screen: "shop", title: "Магазин", text: "Покупай улучшения." },
      { screen: "tap", title: "Стейк", text: "Стейк — участие в наградах." },
      { screen: "tap", title: "Готово", text: "Играй и зарабатывай NXN!" }
    ],
    TR: [
      { screen: "tap", title: "Dokun", text: "Coin'e dokunarak NXN kazan.", target: "#coin" },
      { screen: "tap", title: "Enerji", text: "Her dokunuş enerji harcar.", target: "#energy" },
      { screen: "leaderboard", title: "Sıralama", text: "Diğer oyuncularla yarış." },
      { screen: "transfer", title: "Transfer", text: "NXN gönder." },
      { screen: "shop", title: "Mağaza", text: "Yükseltmeler satın al." },
      { screen: "tap", title: "Stake", text: "Ödüller için stake et." },
      { screen: "tap", title: "Bitti", text: "Oyna ve kazan!" }
    ]
  };

  function waitForTarget(selector, cb) {
    if (!selector) {
      cb();
      return;
    }

    const check = () => {
      const el = document.querySelector(selector);
      if (el) cb();
      else requestAnimationFrame(check);
    };

    check();
  }

  function render() {
    const root = document.getElementById(rootId);
    if (!root) return;
    root.innerHTML = "";

    if (step === -1) {
      root.innerHTML = `
        <div class="nxn-comment" style="top:40%;left:50%;transform:translateX(-50%)">
          <div class="nxn-comment-title">Choose language</div>
          <div class="nxn-comment-actions">
            <button class="nxn-comment-btn" data-lang="EN">EN</button>
            <button class="nxn-comment-btn" data-lang="RU">RU</button>
            <button class="nxn-comment-btn" data-lang="TR">TR</button>
          </div>
        </div>
      `;
      bindLang();
      return;
    }

    const s = steps[lang][step];
    if (window.showScreen) window.showScreen(s.screen);

    waitForTarget(s.target, () => {
      const comment = document.createElement("div");
      comment.className = "nxn-comment";
      comment.innerHTML = `
        <div class="nxn-comment-title">${s.title}</div>
        <div class="nxn-comment-text">${s.text}</div>
        <div class="nxn-comment-actions">
          <button class="nxn-comment-btn">Next</button>
        </div>
      `;

      positionComment(comment, s.target);
      root.appendChild(comment);

      comment.querySelector("button").onclick = next;
    });
  }

  function positionComment(el, target) {
    if (!target) {
      el.style.top = "18vh";
      el.style.left = "50vw";
      el.style.transform = "translateX(-50%)";
      return;
    }

    const t = document.querySelector(target);
    if (!t) return;

    const r = t.getBoundingClientRect();
    const margin = 12;

    let top = r.bottom + margin;
    if (top + 120 > window.innerHeight) {
      top = r.top - 120 - margin;
    }

    let left = r.left;
    left = Math.max(12, Math.min(left, window.innerWidth - 280));

    el.style.top = `${top}px`;
    el.style.left = `${left}px`;
    el.style.transform = "none";
  }

  function next() {
    step++;
    if (step >= steps[lang].length) close();
    else render();
  }

  function bindLang() {
    document.querySelectorAll("[data-lang]").forEach(b => {
      b.onclick = () => {
        lang = b.dataset.lang;
        step = 0;
        render();
      };
    });
  }

  function close() {
    const root = document.getElementById(rootId);
    if (root) root.innerHTML = "";
  }

  window.startNXNTutorial = function () {
    step = -1;
    render();
  };
})();
