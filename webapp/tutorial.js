/* ============== NXN PREMIUM INTERACTIVE TUTORIAL ============== */

(function () {
  const rootId = "nxn-tutorial-root";
  let step = -1;
  let lang = "EN";
  let tapDone = false;

  const steps = {
    EN: [
      { title: "Tap", text: "Tap the coin once to earn NXN." },
      { title: "Energy", text: "Each tap consumes energy." },
      { title: "Stake", text: "Stake NXN to participate in reward cycles." },
      { title: "Stake Leaderboard", text: "Check the TOP 500 stakers." },
      { title: "Global Leaderboard", text: "Compete with other players." },
      { title: "Transfer", text: "Send NXN to other players." },
      { title: "Shop", text: "Upgrade your power and energy." },
      { title: "Finish", text: "Play, stake and earn NXN." }
    ],
    RU: [
      { title: "Тап", text: "Нажми на монету один раз." },
      { title: "Энергия", text: "Каждый тап тратит энергию." },
      { title: "Стейк", text: "Стейк — участие в наградах." },
      { title: "Стейк-лидерборд", text: "ТОП-500 получают награды." },
      { title: "Лидерборд", text: "Соревнуйся с игроками." },
      { title: "Переводы", text: "Отправляй NXN другим." },
      { title: "Магазин", text: "Улучши силу и энергию." },
      { title: "Готово", text: "Играй и зарабатывай." }
    ],
    TR: [
      { title: "Dokun", text: "Coin'e bir kez dokun." },
      { title: "Enerji", text: "Her dokunuş enerji harcar." },
      { title: "Stake", text: "Ödüller için stake et." },
      { title: "Stake Sıralaması", text: "TOP 500 ödül alır." },
      { title: "Sıralama", text: "Diğer oyuncularla yarış." },
      { title: "Transfer", text: "NXN gönder." },
      { title: "Mağaza", text: "Yükseltmeler satın al." },
      { title: "Bitti", text: "Oyna ve kazan." }
    ]
  };

  function render() {
    const root = document.getElementById(rootId);
    if (!root) return;

    document.body.classList.add("nxn-tutorial-lock");
    clearHighlights();

    root.innerHTML = `
      <div class="nxn-tutorial-overlay">
        <div class="nxn-tutorial-card">
          ${
            step === -1
              ? `
                <div class="nxn-tutorial-title">Choose language</div>
                <div class="nxn-lang-select">
                  <button class="nxn-lang-btn" data-lang="EN">EN</button>
                  <button class="nxn-lang-btn" data-lang="RU">RU</button>
                  <button class="nxn-lang-btn" data-lang="TR">TR</button>
                </div>
              `
              : `
                <div class="nxn-tutorial-title">${steps[lang][step].title}</div>
                <div class="nxn-tutorial-text">${steps[lang][step].text}</div>
                ${manualStep(step) ? `<button class="nxn-tutorial-btn primary" id="nxn-next">Next</button>` : `<div style="opacity:.6">Follow the highlight</div>`}
              `
          }
        </div>
      </div>
    `;

    bind();
    applyStepLogic();
  }

  function bind() {
    document.querySelectorAll(".nxn-lang-btn").forEach(b => {
      b.onclick = () => {
        lang = b.dataset.lang;
        step = 0;
        listenTap();
        render();
      };
    });

    const next = document.getElementById("nxn-next");
    if (next) next.onclick = nextStep;
  }

  function nextStep() {
    step++;
    if (step >= steps[lang].length) close();
    else render();
  }

  function manualStep(s) {
    return s === 2 || s === 7; // Stake info + Finish
  }

  /* ===== STEP LOGIC ===== */

  function applyStepLogic() {
    if (step === 0) highlight("#coin");
    if (step === 3) autoGo("stake-screen", "#open-stake-lb");
    if (step === 4) autoGo("leaderboard", '.menu div[data-go="leaderboard"]');
    if (step === 5) autoGo("transfer", '.menu div[data-go="transfer"]');
    if (step === 6) autoGo("shop", '.menu div[data-go="shop"]');
  }

  function autoGo(screen, selector) {
    if (window.showScreen) window.showScreen(screen);
    setTimeout(() => highlight(selector), 300);
  }

  function highlight(selector) {
    const el = document.querySelector(selector);
    if (!el) return;
    el.classList.add("nxn-highlight");
  }

  function clearHighlights() {
    document.querySelectorAll(".nxn-highlight")
      .forEach(el => el.classList.remove("nxn-highlight"));
  }

  function listenTap() {
    const coin = document.getElementById("coin");
    if (!coin) return;

    coin.addEventListener("touchstart", () => {
      if (step === 0 && !tapDone) {
        tapDone = true;
        step = 1;
        render();
      }
    }, { once: true });
  }

  function close() {
    clearHighlights();
    document.body.classList.remove("nxn-tutorial-lock");
    const root = document.getElementById(rootId);
    if (root) root.innerHTML = "";

    // ⬇️ ВОТ СЮДА ПОТОМ ДОБАВИМ СОХРАНЕНИЕ
    // fetch("/api/tutorial/complete", { method: "POST" })
  }

  window.startNXNTutorial = function () {
    step = -1;
    tapDone = false;
    render();
  };
})
