// ================= TELEGRAM =================
let tgUser = null;
let userId = null;

// ================= GAME STATE (ONLY FROM SERVER) =================
// ===== REWARD EVENT =====
let rewardState = null;
let rewardStakeEndsAt = null;
let rewardClaimEndsAt = null;
let currentStake = 0;
let selectedStakeAmount = 0;
let boosts = {
  tap: null,
  energy: null,
  autoclicker: null
};
let balance = 0;
let energy = 0;
let maxEnergy = 100;
let tapPower = 1;
let canTap = false;
let tonConnectUI = null;
window.__NXN_TUTORIAL_ACTIVE__ = false;
let pvpSocket = null;
let pvpStake = 0;
let pvpTimerInterval = null;
let pvpInGame = false;



// ================= INIT =================
document.addEventListener("DOMContentLoaded", async () => {
  if (!window.Telegram || !Telegram.WebApp) {
    alert("Open app from Telegram");
    return;
  }

  document
    .querySelectorAll("#referral-stake-modal .stake-amounts button")
    .forEach(btn => {
      btn.onclick = () => {
        const val = btn.dataset.refAmount;

        const balance = parseFormattedNumber(
          document.getElementById("referral-stake-balance").innerText
        );


        let amount;
        if (val === "max") {
          amount = balance;
        } else {
          amount = Number(val);
        }

        if (amount < 10000) {
          showMinStackModal("Minimum referral stake is 10,000 NXN");
          return;
        }

        if (amount > balance) {
          showMinStackModal("Not enough referral NXN");
          return;
        }

        document.getElementById("referral-stake-amount").value = amount;
      };
    });

  



  Telegram.WebApp.ready();
  Telegram.WebApp.expand();

  // получаем пользователя СРАЗУ
  tgUser = Telegram.WebApp.initDataUnsafe.user;
  userId = String(tgUser.id);


  // ▶️ туториал — ПОСЛЕ
  startNXNTutorial();


  tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: "https://nxn-tap-game.onrender.com/tonconnect-manifest.json"
  });






  const myIdEl = document.getElementById("my-id");
  if (myIdEl) {
    myIdEl.textContent = "Your ID: " + userId;
    myIdEl.onclick = () => navigator.clipboard.writeText(userId);
  }

  await syncUser();
  await refreshMe();
  await loadRewardState();
  updateUI();
  initMenu();

  // ================= SUBSCRIBE GATE =================

  Telegram.WebApp.ready();

  // 1️⃣ СНАЧАЛА DOM-элементы
  const subscribeOverlay = document.getElementById("subscribe-overlay");
  const checkSubscribeBtn = document.getElementById("check-subscribe-btn");
  // 🔥 ПЕРВАЯ ПРОВЕРКА ПОДПИСКИ (КОГДА DOM ГОТОВ)
  checkSubscribeAccess();


  async function checkSubscribeAccess() {
    let data;

    try {
      const res = await fetch(`/api/subscribe/access/${userId}`);
      data = await res.json();
    } catch (e) {
      console.error("SUB FETCH ERROR", e);
      return;
    }

    console.log("SUB STATUS:", data);

    if (!data.subscribed) {
      subscribeOverlay.classList.remove("hidden");
      lockGame();
      return;
    }

    subscribeOverlay.classList.add("hidden");
    unlockGame();
  }


  // 🔁 повторная проверка при возврате в WebApp
  Telegram.WebApp.onEvent("visibilityChanged", () => {
    if (!userId) return;
    checkSubscribeAccess();
  });






  function lockGame() {
    document.body.classList.add("locked");

    // 🔒 блокируем игру
    document.querySelectorAll(".screen, .menu").forEach(el => {
      el.style.pointerEvents = "none";
    });

    // 🔓 РАЗРЕШАЕМ КЛИКИ ТОЛЬКО В SUBSCRIBE
    const overlay = document.getElementById("subscribe-overlay");
    if (overlay) {
      overlay.style.pointerEvents = "auto";
    }
  }


  function unlockGame() {
    document.body.classList.remove("locked");

    document.querySelectorAll(".screen, .menu").forEach(el => {
      el.style.pointerEvents = "";
    });
  }








  checkSubscribeBtn.onclick = async () => {
    const res = await fetch("/api/subscribe/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId })
    });

    const data = await res.json();

    if (!data.ok) {
      Telegram.WebApp.showPopup({
        title: "❌ Not subscribed",
        message: "Please subscribe to the channel first."
      });
      return;
    }

    if (data.bonus > 0) {
      const toast = document.createElement("div");
      toast.className = "transfer-toast success";
      toast.innerText = `+${data.bonus} NXN BONUS`;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 1800);
    }

    await refreshMe();
    updateUI();

    subscribeOverlay.classList.add("hidden");
    unlockGame();
  };







  // ===== OPEN REFERRAL =====
  document.getElementById("open-referral").onclick = async () => {
    const res = await fetch(`/api/referral/me/${userId}`);
    const data = await res.json();

    showScreen("referral-screen");

    document.getElementById("ref-code").innerText = data.referralCode;
    document.getElementById("ref-balance").innerText =
      formatNumber(data.referralStackBalance);

    document.getElementById("ref-invited").innerText = data.stats.invited;
    document.getElementById("ref-active").innerText = data.stats.active;
    document.getElementById("ref-earned").innerText =
      formatNumber(data.stats.totalEarned);

    if (data.referredBy) {
      const input = document.getElementById("ref-input");
      input.value = "Bound";
      input.disabled = true;
      document.getElementById("bind-ref").disabled = true;
    }
  };


  document.getElementById("copy-ref").onclick = () => {
    const code = document.getElementById("ref-code").innerText;
    navigator.clipboard.writeText(code);

    const toast = document.createElement("div");
    toast.className = "transfer-toast";
    toast.style.background = "#0f172a";
    toast.style.border = "1px solid #22c55e";
    toast.style.color = "#22c55e";
    toast.innerText = "Referral code copied";
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 1500);
  };


  document.getElementById("bind-ref").onclick = async () => {
    const code = document.getElementById("ref-input").value.trim();
    if (!code) return;

    const res = await fetch("/api/referral/bind", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, code })
    });

    const data = await res.json();
    if (!data.ok) return alert(data.error);

    document.getElementById("open-referral").click();
  };



  document.getElementById("back-from-ref").onclick = () => {
    showScreen("stake-screen");
  };


  document.getElementById("stake-referral-btn").onclick = async () => {
    const res = await fetch(`/api/referral/me/${userId}`);
    const data = await res.json();

    document.getElementById("referral-stake-balance").innerText =
      formatNumber(data.referralStackBalance);

    document
      .getElementById("referral-stake-modal")
      .classList.remove("hidden");
  };

  document.getElementById("cancel-referral-stake").onclick = () => {
    document
      .getElementById("referral-stake-modal")
      .classList.add("hidden");
  };

  document.getElementById("confirm-referral-stake").onclick = async () => {
    const amount = Number(
      document.getElementById("referral-stake-amount").value
    );

    if (amount < 10000) {
      showMinStackModal();
      return;
    }

    const res = await fetch("/api/referral/stake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, amount })
    });

    const data = await res.json();
    if (!data.ok) return;

    // fly animation
    const fly = document.createElement("div");
    fly.className = "stake-fly";
    fly.innerText = `-${formatNumber(amount)} NXN`;
    document.body.appendChild(fly);
    setTimeout(() => fly.remove(), 900);


    document
      .getElementById("referral-stake-modal")
      .classList.add("hidden");


    // 🔄 обновляем ВСЁ состояние
    await refreshMe();
    await loadRewardState();

    // 🔄 обновляем referral данные
    const refRes = await fetch(`/api/referral/me/${userId}`);
    const refData = await refRes.json();

    // referral balances
    document.getElementById("ref-balance").innerText =
      formatNumber(refData.referralStackBalance);

    document.getElementById("referral-stake-balance").innerText =
      formatNumber(refData.referralStackBalance);

    // 🔥 ОБЯЗАТЕЛЬНО обновляем stake экран
    document.getElementById("stake-balance").innerText =
      formatNumber(balance);
};

  document.getElementById("open-pvp").onclick = () => {

  showScreen("pvp");

  const resultScreen = document.getElementById("pvp-result-screen");
  const resultText = document.getElementById("pvp-result-text");
  const finalScore = document.getElementById("pvp-final-score");

  // 🔥 ПОЛНЫЙ СБРОС UI
  resultScreen.classList.add("hidden");

  resultText.innerText = "";
  resultText.classList.remove("win", "lose");

  finalScore.innerText = "";

  document.getElementById("pvp-match").classList.add("hidden");

  document.getElementById("pvp-you").innerText = 0;
  document.getElementById("pvp-opp").innerText = 0;

  document.getElementById("pvp-status").innerText =
    "Choose your stake";

  document.getElementById("pvp-play").disabled = false;

  if (pvpSocket) {
    pvpSocket.close();
    pvpSocket = null;
  }
};



  document.querySelectorAll("[data-pvp]").forEach(btn => {
    btn.onclick = () => {
      pvpStake = Number(btn.dataset.pvp);

      document.querySelectorAll("[data-pvp]")
        .forEach(b => b.classList.remove("active"));

      btn.classList.add("active");
    };
  });

  const pvpPlayBtn = document.getElementById("pvp-play");

  pvpPlayBtn.onclick = () => {

  if (!pvpStake) return alert("Choose stake");
  if (pvpSocket) return;

  // 🔒 СРАЗУ блокируем игру
  pvpInGame = true;

  document.querySelectorAll(".menu div").forEach(b => {
    b.style.pointerEvents = "none";
    b.style.opacity = "0.4";
  });

  pvpPlayBtn.disabled = true;

  startPvpSearch();
};




  const pvpCoin = document.getElementById("pvp-tap-coin");

  if (pvpCoin) {

    const sendTap = () => {
      if (!pvpSocket) return;

      pvpSocket.send(JSON.stringify({ type: "tap" }));

      if (Telegram?.WebApp?.HapticFeedback) {
        Telegram.WebApp.HapticFeedback.impactOccurred("light");
      }

      pvpCoin.classList.add("hit");
      setTimeout(() => pvpCoin.classList.remove("hit"), 80);
    };


    pvpCoin.addEventListener("touchstart", (e) => {
      e.preventDefault();
      sendTap();
    }, { passive: false });

    pvpCoin.addEventListener("click", sendTap);
  }

});



const stakeBackBtn = document.getElementById("stake-back");

if (stakeBackBtn) {
  stakeBackBtn.onclick = () => {
    showScreen("tap");
  };
}

async function loadClaimInfo() {
  const res = await fetch(`/api/reward/claim-info/${userId}`);
  const data = await res.json();

  const box = document.getElementById("claim-box");
  const amountEl = document.getElementById("claim-amount");
  const input = document.getElementById("claim-wallet");
  const btn = document.getElementById("claim-btn");

  if (!box) return;

  // ❌ Claim фаза не активна
  if (rewardState !== "CLAIM_ACTIVE") {
    box.classList.add("hidden");
    return;
  }

  // ✅ УЖЕ КЛЕЙМИЛ
  if (data.claimed) {
    box.classList.remove("hidden");

    amountEl.innerText = `${data.reward} NXN`;
    input.value = data.wallet;
    input.disabled = true;

    btn.disabled = true;
    btn.innerText = "Wallet added ✓";

    return;
  }

  // ❌ НЕ В ТОП-500
  if (!data.eligible) {
    box.classList.add("hidden");
    return;
  }

  // ✅ МОЖНО КЛЕЙМИТЬ
  box.classList.remove("hidden");

  amountEl.innerText = `${data.reward} NXN`;

  input.value = "";
  input.disabled = false;

  btn.disabled = false;
  btn.innerText = "Claim Reward";
}




// ================= SERVER SYNC =================
async function syncUser() {
  if (!tgUser) return;

  await fetch("/api/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: userId,
      username: tgUser.username || "",
      first_name: tgUser.first_name || "",
      photo_url: tgUser.photo_url || ""
    })
  });
}

// ================= LOAD MY STATE =================
async function refreshMe() {
  const res = await fetch(`/api/me/${userId}`);
  const data = await res.json();

  balance = Number(data.balance) || 0;   // 🔥 ВОТ ЭТОГО НЕ ХВАТАЛО
  energy = Number(data.energy) || 0;
  maxEnergy = Number(data.maxEnergy) || 100;
  tapPower = Number(data.tapPower) || tapPower;

  if (data.boosts) {
    boosts = data.boosts;
    updateBoostTimers();
  }

  canTap = energy > 0;
  updateUI();
  updateTapState();
}

async function loadRewardState() {
  const res = await fetch(`/api/reward/state/${userId}`);
  const data = await res.json();


  if (!data.state) {
    rewardState = null;
    return;
  }


  rewardState = data.state;

  rewardStakeEndsAt = new Date(data.stakeEndsAt);
  rewardClaimEndsAt = new Date(data.claimEndsAt);
  currentStake = Number(data.userStake || 0);

  document.getElementById("stake-balance").innerText =
    formatNumber(balance);

  document.getElementById("stake-current").innerText =
    formatNumber(currentStake);

  updateStakeButton();
  updateRewardTimer();

  // 👇 ЕДИНСТВЕННЫЙ ВЫЗОВ
  if (rewardState === "CLAIM_ACTIVE") {
    loadClaimInfo();
  }
}




// ================= UI =================
function updateUI() {
  const value = document.querySelector(".balance-value");
  const hud = document.getElementById("balance");
  const e = document.getElementById("energy");

  if (value) {
    const newVal = balance.toLocaleString("en-US");

    if (value.innerText !== newVal && hud) {
      hud.classList.add("pulse");
      setTimeout(() => hud.classList.remove("pulse"), 260);
    }

    value.innerText = newVal;
  }

  if (e) {
    e.innerText = `Energy: ${energy} / ${maxEnergy}`;
    if (energy <= 5) e.classList.add("energy-low");
    else e.classList.remove("energy-low");
  }
}



const coin = document.getElementById("coin");

function animateCoinHit() {
  if (!coin) return;

  coin.classList.add("hit");
  coin.classList.add("glow");

  setTimeout(() => {
    coin.classList.remove("hit");
    coin.classList.remove("glow");
  }, 120);
}



// ================= TAP =================
coin.addEventListener("touchstart", (e) => {
  e.preventDefault();
  if (!canTap) return;

  const touches = e.touches.length;
  const taps = Math.min(touches, energy);
  if (taps <= 0) return;

  // UI СРАЗУ
  animateCoinHit();
  animatePlus(e, tapPower * taps);

  balance += tapPower * taps;
  energy -= taps;

  updateUI();
  updateTapState();

  // сервер — БЕЗ await, не блокирует
  fetch("/api/tap", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: userId, taps })
  });
}, { passive: false });






// ================= TRANSFER HISTORY =================
async function loadHistory() {
  if (!userId) return;

  const res = await fetch(`/api/history/${userId}`);
  const data = await res.json();

  const box = document.getElementById("history");
  if (!box) return;

  box.innerHTML = "";

  if (!Array.isArray(data) || data.length === 0) {
    box.innerHTML = "<i>No transfers yet</i>";
    return;
  }

  data.forEach(t => {
    const row = document.createElement("div");
    row.className = "history-row";

    const isOut = t.from_id === userId;
    const arrow = isOut ? "→" : "←";
    const sign = isOut ? "-" : "+";
    const otherId = isOut ? t.to_id : t.from_id;

    row.innerHTML = `
      <b>${arrow} ${otherId}</b>
      <span>${sign}${t.received} NXN</span>
      <i>${new Date(t.created_at).toLocaleString()}</i>
    `;

    box.appendChild(row);
  });
}



function animatePlus(e, value) {
  const plus = document.createElement("div");
  plus.className = "plus-one";
  plus.innerText = `+${value}`;

  let x, y;

  if (e.touches && e.touches[0]) {
    x = e.touches[0].clientX;
    y = e.touches[0].clientY;
  } else {
    x = e.clientX;
    y = e.clientY;
  }

  plus.style.left = x + "px";
  plus.style.top = (y - 20) + "px";

  document.body.appendChild(plus);
  setTimeout(() => plus.remove(), 800);
}




// ================= TRANSFER =================
document.getElementById("send").onclick = async () => {
  const btn = document.getElementById("send");
  btn.disabled = true;

  try {
    const toId = document.getElementById("to-id")?.value.trim();
    const amount = Number(document.getElementById("amount")?.value);

    if (!toId || amount <= 0) {
      alert("Enter valid ID and amount");
      return;
    }

    if (amount < 100) {
      const box = document.querySelector(".transfer-box");
      if (box) {
        box.classList.add("transfer-error");
        setTimeout(() => box.classList.remove("transfer-error"), 450);
      }

      const toast = document.createElement("div");
      toast.className = "transfer-toast error";
      toast.innerText = "Minimum transfer is 100 NXN";
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 1600);

      btn.disabled = false;
      return;
    }


    const res = await fetch("/api/transfer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fromId: userId,
        toId,
        amount
      })
    });


    const data = await res.json();
    if (!data.ok) {
      const box = document.querySelector(".transfer-box");
      if (box) {
        box.classList.add("transfer-error");
        setTimeout(() => box.classList.remove("transfer-error"), 450);
      }

      const toast = document.createElement("div");
      toast.className = "transfer-toast error";
      toast.innerText = data.error || "TRANSFER FAILED";
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 1600);

      return;
    }

    await loadHistory();

    await refreshMe();
    updateUI();




    // ===== TRANSFER SUCCESS UI =====
    const box = document.querySelector(".transfer-box");
    if (box) {
      box.classList.add("transfer-success");
      setTimeout(() => box.classList.remove("transfer-success"), 600);
    }



    // burn animation
    const burn = document.createElement("div");
    burn.className = "plus-one";
    burn.innerText = "-10% BURNED";
    burn.style.color = "#ff6b6b";
    burn.style.textShadow = "0 0 10px rgba(255,80,80,0.8)";
    burn.style.left = "50%";
    burn.style.top = "60%";
    burn.style.transform = "translateX(-50%)";
    document.body.appendChild(burn);
    setTimeout(() => burn.remove(), 900);


    // toast message
    const toast = document.createElement("div");
    toast.className = "transfer-toast";
    toast.innerText = "TRANSFER SUCCESS ✓";
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 1600);

  } finally {
    // 🔒 ВСЕГДА возвращаем кнопку
    btn.disabled = false;
  }
};



// ===== HISTORY TOGGLE =====
const toggle = document.getElementById("history-toggle");
const historyBox = document.getElementById("history");

if (toggle && historyBox) {
  toggle.onclick = () => {
    historyBox.classList.toggle("hidden");
    toggle.innerText = historyBox.classList.contains("hidden")
      ? "Transfer history ⬇️"
      : "Transfer history ⬆️";

    if (!historyBox.classList.contains("hidden")) {
      loadHistory();
    }
  };
}



// ================= LEADERBOARD =================
async function loadLeaderboard() {
  const res = await fetch("/api/leaderboard");
  const data = await res.json();
  if (!Array.isArray(data)) return;

  const placeholder = "avatar.png";

  // TOP 1
  if (data[0]) {
    document.querySelector(".lb-top1 .name").innerText = data[0].name;
    document.querySelector(".lb-top1 .score").innerText =
      formatNumber(data[0].balance);
    document.querySelector(".lb-top1 .avatar").src =
      data[0].avatar || placeholder;
  }

  // TOP 2 / 3
  const cards = document.querySelectorAll(".lb-top23 .lb-card");

  if (data[1] && cards[0]) {
    cards[0].querySelector(".name").innerText = data[1].name;
    cards[0].querySelector(".score").innerText =
      formatNumber(data[1].balance);
    cards[0].querySelector(".avatar").src =
      data[1].avatar || placeholder;
  }

  if (data[2] && cards[1]) {
    cards[1].querySelector(".name").innerText = data[2].name;
    cards[1].querySelector(".score").innerText =
      formatNumber(data[2].balance);
    cards[1].querySelector(".avatar").src =
      data[2].avatar || placeholder;
  }


  // TOP 4–100
  const list = document.querySelector(".lb-list");
  list.innerHTML = "";

  data.slice(3).forEach((u, i) => {
    const rank = i + 4;

    const row = document.createElement("div");
    row.className = "row";

    // 🔥 ВОТ ОНО — ПОДСВЕТКА ТОЛЬКО СЕБЯ
    if (String(u.telegram_id) === String(userId)) {
      row.classList.add("me");
    }

    row.innerHTML = `
    <span>#${rank}</span>
    <img src="${u.avatar || placeholder}">
    <b>${u.name}</b>
    <i>${formatNumber(u.balance)}</i>
  `;

    list.appendChild(row);
  });
}

// ================= MENU =================
function initMenu() {
  document.querySelectorAll(".menu div").forEach(btn => {
    btn.addEventListener("click", (e) => {
      // 🔑 важно: всегда берём div, даже если клик по img
      const targetBtn = e.currentTarget;
      const go = targetBtn.dataset.go;

      if (!go) return;

      showScreen(go);

      if (go === "transfer") {
        loadHistory();
      }

      if (go === "leaderboard") {
        loadLeaderboard();
      }
    });
  });
}


const stakeBtn = document.getElementById("stake-btn");
const stakeScreen = document.getElementById("stake-screen");

stakeBtn.onclick = async () => {
  showScreen("stake-screen");

  await refreshMe();
  await loadRewardState();

  if (rewardState === "CLAIM_ACTIVE") {
    loadClaimInfo();
  }
};





document.querySelectorAll(".stake-amounts button").forEach(btn => {
  btn.onclick = () => {
    const val = btn.dataset.amount;

    let amount;
    if (val === "max") {
      amount = balance;
    } else {
      amount = Number(val);
    }

    // ❌ not enough balance
    if (amount > balance) {
      showMinStackModal("Not enough NXN to stake");
      return;
    }

    selectedStakeAmount = amount;

    document
      .querySelectorAll(".stake-amounts button")
      .forEach(b => b.classList.remove("active"));

    btn.classList.add("active");
  };
});


const stakeConfirm = document.getElementById("stake-confirm");

if (stakeConfirm) {
  stakeConfirm.onclick = async () => {
    if (rewardState !== "STAKE_ACTIVE") {
      alert("Stake phase is closed");
      return;
    }

    if (!selectedStakeAmount || selectedStakeAmount < 10000) {
      showMinStackModal();
      return;
    }


    const res = await fetch("/api/reward/stake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: userId,
        amount: selectedStakeAmount
      })
    });

    const data = await res.json();

    if (!data.ok) {

      const fly = document.createElement("div");
      fly.className = "stake-fly";
      fly.innerText = `-${formatNumber(selectedStakeAmount)} NXN`;
      document.body.appendChild(fly);
      setTimeout(() => fly.remove(), 900);

      const toast = document.createElement("div");
      toast.className = "transfer-toast success";
      toast.innerText = "Stake successful ✓";
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 1600);



      if (data.error === "Cooldown active") {
        const toast = document.createElement("div");
        toast.className = "transfer-toast error";
        toast.innerText = "⏳ Please wait 60 seconds";
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 1800);

        const screen = document.getElementById("stake-screen");
        screen.classList.add("stake-cooldown");
        setTimeout(() => screen.classList.remove("stake-cooldown"), 400);

        return;
      }

      alert(data.error || "Stake failed");
      return;
    }




    // ===== ✅ SUCCESS =====
    const screen = document.getElementById("stake-screen");
    screen.classList.add("stake-success");
    setTimeout(() => screen.classList.remove("stake-success"), 600);

    const fly = document.createElement("div");
    fly.className = "stake-fly";
    fly.innerText = `-${formatNumber(selectedStakeAmount)} NXN`;
    document.body.appendChild(fly);
    setTimeout(() => fly.remove(), 900);

    const toast = document.createElement("div");
    toast.className = "transfer-toast success";
    toast.innerText = "✅ Stake successful";
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 1600);

    await refreshMe();
    await loadRewardState();

  };
}



function updateStakeButton() {
  const btn = document.getElementById("stake-confirm");

  if (rewardState !== "STAKE_ACTIVE") {
    btn.disabled = true;
    btn.innerText = "Stake Closed";
    return;
  }


  btn.disabled = false;
  btn.innerText = "Stake NeXoN";
}



// ================= KEEP USER ONLINE =================
setInterval(() => {
  syncUser();
}, 5000);
// ================= ENERGY SYNC TICK =================
setInterval(async () => {
  if (!userId) return;

  const res = await fetch(`/api/me/${userId}`);
  const data = await res.json();

  balance = Number(data.balance) || balance;
  energy = Number(data.energy) || energy;
  maxEnergy = Number(data.maxEnergy) || maxEnergy;

  updateUI();
  updateTapState();
}, 1000); // 🔥 каждую секунду

function updateTapState() {
  if (!coin) return;

  if (energy <= 0) {
    coin.classList.add("coin-disabled");
    canTap = false;
  } else {
    coin.classList.remove("coin-disabled");
    canTap = true;
  }
}


function showScreen(id) {
  // скрываем все экраны
  document.querySelectorAll(".screen")
    .forEach(s => s.classList.add("hidden"));

  // показываем нужный
  const screen = document.getElementById(id);
  if (screen) {
    screen.classList.remove("hidden");
  }

  // обновляем активное меню
  document.querySelectorAll(".menu div")
    .forEach(b => b.classList.remove("active"));

  const activeBtn = document.querySelector(`.menu div[data-go="${id}"]`);
  if (activeBtn) activeBtn.classList.add("active");
}



// ===== STAR FIELD (FALLING, SAFE) =====
const stars = document.getElementById("stars");

if (stars) {
  for (let i = 0; i < 60; i++) {
    const s = document.createElement("span");

    const size = Math.random() * 2 + 1;
    s.style.width = size + "px";
    s.style.height = size + "px";

    s.style.left = Math.random() * 100 + "vw";
    s.style.top = Math.random() * 100 + "vh";

    s.style.opacity = Math.random() * 0.6 + 0.2;
    s.style.animationDuration = 8 + Math.random() * 12 + "s";
    s.style.animationDelay = Math.random() * 10 + "s";

    stars.appendChild(s);
  }
}

async function buyNXN(itemId) {
  const box = document.querySelector(".shop-box") || document.body;

  let res;
  try {
    res = await fetch("/api/buy-nxn", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: userId,
        itemId
      })
    });
  } catch (e) {
    alert("Network error");
    return;
  }

  let data;
  try {
    data = await res.json();
  } catch {
    alert("Server error");
    return;
  }

  // ❌ НЕДОСТАТОЧНО NXN / УЖЕ КУПЛЕНО
  if (!data.ok) {
    box.classList.add("shop-error");
    setTimeout(() => box.classList.remove("shop-error"), 450);

    const toast = document.createElement("div");
    toast.className = "transfer-toast error";
    toast.innerText = data.error || "NOT ENOUGH NXN";
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 1600);

    return;
  }

  // ✅ УСПЕШНАЯ ПОКУПКА
  balance = data.balance;
  tapPower = data.tapPower;
  maxEnergy = data.maxEnergy;

  updateUI();

  box.classList.add("shop-success");
  setTimeout(() => box.classList.remove("shop-success"), 600);

  const toast = document.createElement("div");
  toast.className = "transfer-toast";
  toast.innerText = "PURCHASE SUCCESS ✓";
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 1600);
}



async function payTON(amountTon, itemId) {
  if (!tonConnectUI) {
    alert("TON not ready");
    return;
  }

  if (!tonConnectUI.connected) {
    await tonConnectUI.openModal();
    return;
  }

  const amountNano = Math.floor(amountTon * 1e9).toString();

  try {
    const tx = await tonConnectUI.sendTransaction({
      validUntil: Math.floor(Date.now() / 1000) + 600,
      messages: [
        {
          address: "UQDg0qiBTFbmCc6OIaeCSF0tL6eSX8cC56PYTF44Ob8hDqWf",
          amount: amountNano
        }
      ]
    });

    // UI receipt
    const receipt = document.createElement("div");
    receipt.className = "transfer-toast";
    receipt.innerText = "TON PAYMENT SENT ✓";
    document.body.appendChild(receipt);
    setTimeout(() => receipt.remove(), 1600);

    // подтверждение на сервер
    await fetch("/api/ton-confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        itemId,
        txHash: tx.boc
      })
    });

    // обновляем состояние
    await refreshMe();
    updateUI();

  } catch (e) {
    console.error("TON ERROR", e);
    alert("Payment cancelled or failed");
  }
}




// ================= FORMAT LARGE NUMBERS =================
function formatNumber(n) {
  n = Number(n) || 0;

  if (n >= 1e9) return (n / 1e9).toFixed(1).replace(".0", "") + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(".0", "") + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace(".0", "") + "K";
  return n.toString();
}


function parseFormattedNumber(text) {
  if (!text) return 0;

  const t = text.toUpperCase();

  if (t.includes("B")) return parseFloat(t) * 1e9;
  if (t.includes("M")) return parseFloat(t) * 1e6;
  if (t.includes("K")) return parseFloat(t) * 1e3;

  return Number(t.replace(/[^0-9.]/g, ""));
}



function formatRemaining(ms) {
  if (ms <= 0) return "Expired";

  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m ${seconds}s`;
}

/* ===== REWARD TIMER ===== */
function updateRewardTimer() {
  const timerEl = document.getElementById("stake-timer");
  if (!timerEl) return;

  let end;
  if (rewardState === "STAKE_ACTIVE") {
    end = rewardStakeEndsAt;
  } else if (rewardState === "CLAIM_ACTIVE") {
    end = rewardClaimEndsAt;
  } else {
    timerEl.innerText = "New cycle soon";
    return;
  }

  const diff = new Date(end).getTime() - Date.now();
  timerEl.innerText = "⏳ " + formatRemaining(diff);
}

setInterval(() => {
  if (rewardState) updateRewardTimer();
}, 1000);


function updateBoostTimers() {
  const now = Date.now();

  updateOneBoost(
    boosts.tap,
    "tap_plus_3",
    "Tap Power +3"
  );

  updateOneBoost(
    boosts.energy,
    "energy_plus_300",
    "Energy +300"
  );

  updateOneBoost(
    boosts.autoclicker,
    "autoclicker_30d",
    "Autoclicker"
  );
}

function updateOneBoost(until, itemId, label) {
  const btn = document.querySelector(`[data-item="${itemId}"]`);
  if (!btn) return;

  if (!until) {
    btn.disabled = false;
    btn.innerText = btn.dataset.price;
    return;
  }

  const end = new Date(until).getTime();
  const remaining = end - Date.now();

  if (remaining <= 0) {
    btn.disabled = false;
    btn.innerText = btn.dataset.price;
    return;
  }

  btn.disabled = true;
  btn.innerText = `ACTIVE · ${formatRemaining(remaining)}`;
}
setInterval(() => {
  updateBoostTimers();
}, 1000);


const openStakeLbBtn = document.getElementById("open-stake-lb");
const stakeLbScreen = document.getElementById("stake-leaderboard");

if (openStakeLbBtn && stakeLbScreen) {
  openStakeLbBtn.onclick = async () => {

    // скрываем все экраны
    document.querySelectorAll(".screen")
      .forEach(s => s.classList.add("hidden"));

    // показываем stake leaderboard
    stakeLbScreen.classList.remove("hidden");

    // грузим данные
    await loadStakeLeaderboard();
  };
}
async function loadStakeLeaderboard() {
  const list = document.getElementById("stake-lb-list");
  list.innerHTML = "Loading...";

  const res = await fetch(`/api/reward/leaderboard/${userId}`);
  const data = await res.json();

  list.innerHTML = "";

  // TOP LIST
  data.top.forEach(u => {
    const row = document.createElement("div");
    row.className = "stake-lb-row";

    row.innerHTML = `
      <span class="rank">#${u.rank}</span>
      <img class="avatar" src="${u.avatar || 'avatar.png'}">
      <span class="name">${u.name}</span>
      <div class="bar">
        <div class="fill" style="width:${u.progress}%"></div>
      </div>
    `;

    list.appendChild(row);
  });

  // YOU
  if (data.me) {
    const meBox = document.getElementById("stake-lb-me");
    meBox.classList.remove("hidden");

    document.getElementById("stake-me-bar")
      .style.width = data.me.progress + "%";

    document.getElementById("stake-me-rank")
      .innerText = `#${data.me.rank}`;
  }
}
document.getElementById("back-to-stake").onclick = () => {
  showScreen("stake-screen");
};


const claimBtn = document.getElementById("claim-btn");

if (claimBtn) {
  claimBtn.onclick = async () => {
    const wallet =
      document.getElementById("claim-wallet").value.trim();

    if (!wallet) {
      alert("Enter TON wallet");
      return;
    }

    const res = await fetch("/api/reward/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: userId, wallet })
    });

    const data = await res.json();

    if (!data.ok) {
      alert(data.error || "Claim failed");
      return;
    }

    // ✅ UI после клейма
    document.getElementById("claim-amount").innerText =
      "Claimed ✓";

    claimBtn.disabled = true;
    claimBtn.innerText = "Reward Claimed";

  };
}
// ================= MIN STAKE MODAL =================
function showMinStackModal(
  text = "Minimum stake is 10,000 NXN"
) {
  const modal = document.getElementById("stackModal");
  if (!modal) return;

  document.getElementById("modalTitle").innerText = "Stake Error";
  document.getElementById("modalText").innerText = text;

  modal.classList.remove("hidden");

  // небольшая анимация
  modal.querySelector(".modal-card")?.classList.remove("shake");
  void modal.offsetWidth;
  modal.querySelector(".modal-card")?.classList.add("shake");
}

function closeModal() {
  document.getElementById("stackModal")?.classList.add("hidden");
}
// ================= MAIN TRANSFER BUTTON =================
const mainTransferBtn = document.getElementById("main-transfer-btn");

if (mainTransferBtn) {
  mainTransferBtn.onclick = () => {
    showScreen("transfer");
    loadHistory(); // чтобы сразу загрузилась история
  };
}

// ================= PvP FUNCTIONS =================

function startPvpSearch() {

  pvpSocket = new WebSocket(
    (location.protocol === "https:" ? "wss://" : "ws://") +
    location.host +
    "/pvp"
  );

  pvpSocket.onopen = () => {
    pvpSocket.send(JSON.stringify({
      type: "search",
      userId,
      username: tgUser.username || tgUser.first_name || "Player",
      stake: pvpStake
    }));

    document.getElementById("pvp-status").innerText =
      "Searching opponent...";
  };

  pvpSocket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "opponent") {
      document.getElementById("pvp-opp-name").innerText = data.name;
    }

    if (data.type === "countdown") {

      document.getElementById("pvp-match").classList.remove("hidden");

      const overlay = document.getElementById("pvp-countdown-overlay");
      const number = document.getElementById("pvp-countdown-number");

      overlay.classList.remove("hidden");

      if (data.value > 0) {
        number.innerText = data.value;
      } else if (data.value === 0) {
        number.innerText = "FIGHT!";
        setTimeout(() => overlay.classList.add("hidden"), 600);
      }
    }

    if (data.type === "start") {


      const overlay = document.getElementById("pvp-countdown-overlay");
      if (overlay) overlay.classList.add("hidden");

      document.getElementById("pvp-match").classList.remove("hidden");
      document.getElementById("pvp-status").innerText = "FIGHT!";

      startMatchTimer();
    }

    if (data.type === "score") {
      document.getElementById("pvp-you").innerText = data.you;
      document.getElementById("pvp-opp").innerText = data.opponent;
    }

    if (data.type === "end") {

      clearInterval(pvpTimerInterval);
      document.getElementById("pvp-timer").innerText = 0;

      const resultScreen = document.getElementById("pvp-result-screen");
      const resultText = document.getElementById("pvp-result-text");
      const finalScore = document.getElementById("pvp-final-score");

      const you = data.you;
      const opp = data.opponent;

      finalScore.innerText = `${you} : ${opp}`;

      if (String(data.winner) === String(userId)) {
        resultText.innerText = "YOU WIN";
        resultText.classList.remove("lose");
        resultText.classList.add("win");
      } else {
        resultText.innerText = "YOU LOSE";
        resultText.classList.remove("win");
        resultText.classList.add("lose");
      }

      resultScreen.classList.add("show");

      if (pvpSocket) {
        pvpSocket.close();
        pvpSocket = null;
      }

      document.getElementById("pvp-play").disabled = false;

      pvpInGame = false;

      document.querySelectorAll(".menu div").forEach(b => {
        b.style.pointerEvents = "";
        b.style.opacity = "";
      });
    }
  };

  pvpSocket.onclose = () => {
    clearInterval(pvpTimerInterval);
    const btn = document.getElementById("pvp-play");
    if (btn) btn.disabled = false;
  };

  function startMatchTimer() {

    const endTime = Date.now() + 20000;

    pvpTimerInterval = setInterval(() => {

      const diff = endTime - Date.now();

      if (diff <= 0) {
        document.getElementById("pvp-timer").innerText = 0;
        clearInterval(pvpTimerInterval);
        return;
      }

      const remaining = Math.ceil(diff / 1000);

      document.getElementById("pvp-timer").innerText = remaining;

      if (remaining <= 5) {
        document.getElementById("pvp-timer").classList.add("low");
      } else {
        document.getElementById("pvp-timer").classList.remove("low");
      }

    }, 1000);
  }

}
const againBtn = document.getElementById("pvp-again");

if (againBtn) {
  againBtn.onclick = () => {

    document.getElementById("pvp-result-screen")
      .classList.add("hidden");

    document.getElementById("pvp-match")
      .classList.add("hidden");

    document.getElementById("pvp-you").innerText = 0;
    document.getElementById("pvp-opp").innerText = 0;
    document.getElementById("pvp-status").innerText =
      "Choose your stake";
  };
}

