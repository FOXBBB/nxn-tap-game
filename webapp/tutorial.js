/* ================= NXN TUTORIAL ================= */

(function () {
  const rootId = "nxn-tutorial-root";
  let step = -1;
  let lang = "EN";

  const steps = {
    EN: [
      { title: "Tap Screen", text: "Tap the coin to earn NXN." },
      { title: "Energy", text: "Energy limits how many taps you can make." },
      { title: "Stake", text: "Stake NXN to participate in reward cycles." },
      {
        title: "Stake Leaderboard",
        text: "TOP 500 players receive rewards to real wallets each cycle."
      },
      {
        title: "Global Leaderboard",
        text: "Compete with players worldwide and climb the ranks."
      },
      {
        title: "Transfer",
        text: "Send NXN to other players by their ID."
      },
      {
        title: "Shop",
        text: "Upgrade tap power, energy and automation."
      },
      {
        title: "Finish",
        text: "Play, stake and earn NXN every cycle."
      }
    ],
    RU: [
      { title: "Тап", text: "Нажимай на монету, чтобы зарабатывать NXN." },
      { title: "Энергия", text: "Энергия ограничивает количество тапов." },
      { title: "Стейк", text: "Стейкай NXN для участия в наградных циклах." },
      {
        title: "Стейк-лидерборд",
        text: "ТОП-500 получают награды на реальные кошельки."
      },
      {
        title: "Глобальный рейтинг",
        text: "Соревнуйся с игроками по всему миру."
      },
      {
        title: "Переводы",
        text: "Переводи NXN другим игрокам по ID."
      },
      {
        title: "Магазин",
        text: "Покупай апгрейды силы, энергии и автоклика."
      },
      {
        title: "Готово",
        text: "Играй, стейкай и зарабатывай NXN."
      }
    ],
    TR: [
      { title: "Dokun", text: "NXN kazanmak için coin'e dokun." },
      { title: "Enerji", text: "Enerji dokunma sayısını sınırlar." },
      { title: "Stake", text: "Ödül döngülerine katılmak için NXN stake et." },
      {
        title: "Stake Sıralaması",
        text: "TOP 500 oyuncu gerçek cüzdanlara ödül alır."
      },
      {
        title: "Genel Sıralama",
        text: "Dünya çapında oyuncularla yarış."
      },
      {
        title: "Transfer",
        text: "NXN'i ID ile diğer oyunculara gönder."
      },
      {
        title: "Mağaza",
        text: "Güç, enerji ve otomasyon yükseltmeleri."
      },
      {
        title: "Bitti",
        text: "Oyna, stake et ve NXN kazan."
      }
    ]
  };

  function render() {
    const root = document.getElementById(rootId);
    if (!root) return;

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
            <div class="nxn-tutorial-title">
              ${steps[lang][step].title}
            </div>
            <div class="nxn-tutorial-text">
              ${steps[lang][step].text}
            </div>
            <div class="nxn-tutorial-actions">
              <button class="nxn-tutorial-btn secondary" id="nxn-skip">
                Skip
              </button>
              <button class="nxn-tutorial-btn primary" id="nxn-next">
                ${step === steps[lang].length - 1 ? "Finish" : "Next"}
              </button>
            </div>
          `
          }
        </div>
      </div>
    `;

    bindEvents();
  }

  function bindEvents() {
    document.querySelectorAll(".nxn-lang-btn").forEach(btn => {
      btn.onclick = () => {
        lang = btn.dataset.lang;
        step = 0;
        render();
      };
    });

    const next = document.getElementById("nxn-next");
    const skip = document.getElementById("nxn-skip");

    if (next) {
      next.onclick = () => {
        step++;
        if (step >= steps[lang].length) close();
        else render();
      };
    }

    if (skip) {
      skip.onclick = close;
    }
  }

  function close() {
    const root = document.getElementById(rootId);
    if (root) root.innerHTML = "";
  }

  window.startNXNTutorial = function () {
    const root = document.getElementById(rootId);
    if (!root) return;
    step = -1;
    render();
  };
})();
