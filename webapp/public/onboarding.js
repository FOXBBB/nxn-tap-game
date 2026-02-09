// ================= ONBOARDING =================

let obStep = 0;
let obLang = "en";

const ONBOARDING_VERSION = "v2";

const OB_STEPS = [
  { screen: "tap", t:{ en:["Welcome to NeXoN","Tap the coin to earn NXN."], ru:["Добро пожаловать","Нажимай на монету"], tr:["Hoş geldin","NXN kazan"]}},
  { screen: "tap", t:{ en:["Energy","Energy limits taps"], ru:["Энергия","Ограничивает тапы"], tr:["Enerji","Sınırlar"]}},
  { screen: "stake-screen", t:{ en:["Stake","Join reward cycles"], ru:["Стейк","Участвуй"], tr:["Stake","Katıl"]}},
  { screen: "leaderboard", t:{ en:["Leaderboard","Top players"], ru:["Лидерборд","Топ"], tr:["Sıralama","En iyiler"]}},
  { screen: "shop", t:{ en:["Shop","Boost progress"], ru:["Магазин","Бусты"], tr:["Mağaza","Boost"]}},
  { screen: "tap", t:{ en:["Ready","Play & earn"], ru:["Готов","Играй"], tr:["Hazır","Oyna"]}}
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

  showScreen(step.screen);

  document.getElementById("ob-step").innerText = `${obStep+1} / ${OB_STEPS.length}`;
  document.getElementById("ob-title").innerText = step.t[obLang][0];
  document.getElementById("ob-text").innerText  = step.t[obLang][1];
}

function finishOnboarding() {
  localStorage.setItem("onboardingVersion", ONBOARDING_VERSION);
  document.getElementById("onboarding-overlay").classList.add("hidden");
}

document.getElementById("ob-next").onclick = () => { obStep++; renderStep(); };
document.getElementById("ob-skip").onclick = finishOnboarding;

document.querySelectorAll("#ob-lang-select button").forEach(btn=>{
  btn.onclick=()=>{
    obLang = btn.dataset.lang;
    renderStep();
  };
});

window.startOnboarding = startOnboarding;
