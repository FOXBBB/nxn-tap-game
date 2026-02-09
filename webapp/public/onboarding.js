// ================= ONBOARDING =================

let obStep = 0;
let obLang = "en";

const ONBOARDING_VERSION = "v1"; // 🔥 МЕНЯЕШЬ — показывается всем снова


const OB_STEPS = [
  {
    screen: "tap",
    t: {
      en: ["Welcome to NeXoN", "Tap the coin to earn NXN."],
      ru: ["Добро пожаловать в NeXoN", "Нажимай на монету, чтобы зарабатывать NXN."],
      tr: ["NeXoN'a hoş geldin", "NXN kazanmak için madeni paraya dokun."]
    }
  },
  {
    screen: "tap",
    t: {
      en: ["Energy system", "Energy limits how fast you can tap."],
      ru: ["Система энергии", "Энергия ограничивает скорость тапов."],
      tr: ["Enerji sistemi", "Enerji dokunma hızını sınırlar."]
    }
  },
  {
    screen: "stake-screen",
    t: {
      en: ["Stake NXN", "Stake NXN to join reward cycles."],
      ru: ["Стейк NXN", "Стейкай NXN для участия в циклах наград."],
      tr: ["NXN stake", "Ödül döngülerine katılmak için stake et."]
    }
  },
  {
    screen: "stake-leaderboard",
    t: {
      en: ["Stake leaderboard", "Top 500 receive real rewards every cycle."],
      ru: ["Лидерборд стейка", "Топ 500 получают реальные награды каждый цикл."],
      tr: ["Stake sıralaması", "İlk 500 gerçek ödüller alır."]
    }
  },
  {
    screen: "leaderboard",
    t: {
      en: ["Global leaderboard", "Top players earn prestige and rewards."],
      ru: ["Глобальный лидерборд", "Топ игроки получают престиж и награды."],
      tr: ["Global sıralama", "En iyiler ödül kazanır."]
    }
  },
  {
    screen: "transfer",
    t: {
      en: ["Transfers", "Send NXN to other players by ID."],
      ru: ["Переводы", "Отправляй NXN другим игрокам по ID."],
      tr: ["Transferler", "NXN'i ID ile gönder."]
    }
  },
  {
    screen: "shop",
    t: {
      en: ["Shop", "Upgrades boost your progress."],
      ru: ["Магазин", "Улучшения ускоряют прогресс."],
      tr: ["Mağaza", "Geliştirmeler ilerlemeyi hızlandırır."]
    }
  },
  {
    screen: "tap",
    t: {
      en: ["You're ready", "Play, stake and earn real rewards."],
      ru: ["Ты готов", "Играй, стейкай и получай награды."],
      tr: ["Hazırsın", "Oyna, stake et ve kazan."]
    }
  }
];

function startOnboarding() {
  const savedVersion = localStorage.getItem("onboardingVersion");

  // если уже проходил ЭТУ версию — не показываем
  if (savedVersion === ONBOARDING_VERSION) return;

  obStep = 0;
  document.getElementById("onboarding-overlay").classList.remove("hidden");
  renderStep();
}


function renderStep() {
  const step = OB_STEPS[obStep];
  if (!step) return finishOnboarding();

  showScreen(step.screen);

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

  fetch("/api/onboarding/complete", { method: "POST" });
}


// buttons
document.getElementById("ob-next").onclick = nextStep;
document.getElementById("ob-skip").onclick = finishOnboarding;

// language
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
window.startOnboarding = startOnboarding;