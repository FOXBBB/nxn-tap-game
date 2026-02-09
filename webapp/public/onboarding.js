// ================= ONBOARDING =================

let obStep = 0;
let obLang = "en";

const ONBOARDING_VERSION = "v3"; // ← меняешь — показывается всем

const OB_STEPS = [
  {
    screen: "tap",
    t: {
      en: ["Tap the coin", "Tap to earn NXN"],
      ru: ["Тапай монету", "Нажимай чтобы зарабатывать NXN"],
      tr: ["Madeni tıkla", "NXN kazanmak için dokun"]
    }
  },
  {
    screen: "tap",
    t: {
      en: ["Energy", "Energy limits your taps"],
      ru: ["Энергия", "Энергия ограничивает тапы"],
      tr: ["Enerji", "Dokunma sayısını sınırlar"]
    }
  },
  {
    screen: "shop",
    t: {
      en: ["Shop", "Buy upgrades to grow faster"],
      ru: ["Магазин", "Покупай улучшения"],
      tr: ["Mağaza", "Geliştirmeler al"]
    }
  },
  {
    screen: "stake-screen",
    t: {
      en: ["Stake NXN", "Join reward cycles"],
      ru: ["Стейк NXN", "Участвуй в циклах наград"],
      tr: ["NXN Stake", "Ödül döngülerine katıl"]
    }
  },
  {
    screen: "stake-leaderboard",
    t: {
      en: ["Stake leaderboard", "Top 500 get real rewards"],
      ru: ["Лидерборд стейка", "Топ 500 получают награды"],
      tr: ["Stake sıralaması", "İlk 500 ödül alır"]
    }
  },
  {
    screen: "leaderboard",
    t: {
      en: ["Leaderboard", "Top players dominate"],
      ru: ["Лидерборд", "Топ игроки"],
      tr: ["Sıralama", "En iyiler"]
    }
  },
  {
    screen: "transfer",
    t: {
      en: ["Transfers", "Send NXN to other players"],
      ru: ["Переводы", "Отправляй NXN другим"],
      tr: ["Transfer", "NXN gönder"]
    }
  },
  {
    screen: "tap",
    t: {
      en: ["You’re ready", "Play & earn real NXN"],
      ru: ["Ты готов", "Играй и зарабатывай NXN"],
      tr: ["Hazırsın", "Oyna ve kazan"]
    }
  }
];

function startOnboarding(force = false) {
  const saved = localStorage.getItem("onboardingVersion");
  if (!force && saved === ONBOARDING_VERSION) return;

  obStep = 0;
  document.getElementById("onboarding-overlay").classList.remove("hidden");
  renderStep();
}

function renderStep() {
  const step = OB_STEPS[obStep];
  if (!step) return finishOnboarding();

  if (typeof showScreen === "function") {
    showScreen(step.screen);
  }

  document.getElementById("ob-step").innerText =
    `${obStep + 1} / ${OB_STEPS.length}`;

  document.getElementById("ob-title").innerText =
    step.t[obLang][0];

  document.getElementById("ob-text").innerText =
    step.t[obLang][1];
}

function nextStep() {
  obStep++;
  renderStep();
}

function finishOnboarding() {
  localStorage.setItem("onboardingVersion", ONBOARDING_VERSION);
  document.getElementById("onboarding-overlay").classList.add("hidden");
}

// buttons
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("ob-next").onclick = nextStep;
  document.getElementById("ob-skip").onclick = finishOnboarding;

  document.querySelectorAll("#ob-lang-select button").forEach(btn => {
    btn.onclick = () => {
      obLang = btn.dataset.lang;
      document
        .querySelectorAll("#ob-lang-select button")
        .forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderStep();
    };
  });
});

window.startOnboarding = startOnboarding;
