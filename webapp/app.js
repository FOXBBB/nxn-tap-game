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
let tapInProgress = false;
let tonConnectUI = null;
let tapBuffer = 0;
let tapFlushInProgress = false;
let isTappingNow = false;
let flushTimer = null;
let hasLocalEnergyDelta = false;
let predictedEnergy = null;



// ================= INIT =================
document.addEventListener("DOMContentLoaded", async () => {
  if (!window.Telegram || !Telegram.WebApp) {
    alert("Open app from Telegram");
    return;
  }

  Telegram.WebApp.ready();
  Telegram.WebApp.expand();
  Telegram.WebApp.enableClosingConfirmation();
  Telegram.WebApp.setHeaderColor("#02040a");
  Telegram.WebApp.setBackgroundColor("#02040a");

  tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: "https://nxn-tap-game.onrender.com/tonconnect-manifest.json"
  });


  tgUser = Telegram.WebApp.initDataUnsafe.user;
  userId = String(tgUser.id);

  // show my id
  const myIdEl = document.getElementById("my-id");
  if (myIdEl) {
    myIdEl.textContent = "Your ID: " + userId;
    myIdEl.onclick = () => {
      navigator.clipboard.writeText(userId);
    };
  }




  await syncUser();
await refreshMe();
await loadRewardState();
updateUI();
initMenu();

});

document.getElementById("open-referral").onclick = async () => {
  const data = await loadReferral();

  showScreen("referral-screen");

  document.getElementById("ref-code").innerText = data.referralCode;
  document.getElementById("ref-balance").innerText =
    formatNumber(data.referralStackBalance);

  document.getElementById("ref-invited").innerText =
    data.stats.invited;

  document.getElementById("ref-active").innerText =
    data.stats.active;

  document.getElementById("ref-earned").innerText =
    formatNumber(data.stats.totalEarned);

  // если уже привязан
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

};


document.getElementById("bind-ref").onclick = async () => {
  const code = document.getElementById("ref-input").value.trim();

  if (!code) {
    alert("Enter referral code");
    return;
  }

  const res = await fetch("/api/referral/bind", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      code
    })
  });

  const data = await res.json();

  if (!data.ok) {
    alert(data.error);
    return;
  }

  // перезагружаем экран
  document.getElementById("open-referral").click();
};

document.getElementById("back-from-ref").onclick = () => {
  showScreen("stake-screen");
};



const stakeBackBtn = document.getElementById("stake-back");

if (stakeBackBtn) {
  stakeBackBtn.onclick = () => {
  showScreen("tap");
};
}


const refStakeBtn = document.getElementById("stake-referral-btn");
const refModal = document.getElementById("referral-stake-modal");

refStakeBtn.onclick = async () => {
  const data = await loadReferral();

  document.getElementById("referral-stake-balance").innerText =
    formatNumber(data.referralStackBalance);

  refModal.classList.remove("hidden");
};


document.getElementById("cancel-referral-stake").onclick = () => {
  refModal.classList.add("hidden");
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
    body: JSON.stringify({
      userId,
      amount
    })
  });

  const data = await res.json();

  if (!data.ok) {
  alert(data.error);
  return;
}

/* ===== SUCCESS ANIMATION ===== */

// закрываем модалку
refModal.classList.add("hidden");

// 💥 glow стейк карточки
const stakeCard = document.querySelector(".stake-card");
if (stakeCard) {
  stakeCard.classList.add("ref-stake-success");
  setTimeout(() => {
    stakeCard.classList.remove("ref-stake-success");
  }, 600);
}

// 🚀 летящий текст
const fly = document.createElement("div");
fly.className = "ref-stake-fly";
fly.innerText = `+${formatNumber(amount)} NXN`;
document.body.appendChild(fly);
setTimeout(() => fly.remove(), 900);

// обновляем данные
await refreshMe();
await loadRewardState();

};




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

async function loadReferral() {
  const res = await fetch(`/api/referral/me/${userId}`);
  return await res.json();
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

// ===== REFERRAL STAKE AVAILABILITY =====
const refStakeBtn = document.getElementById("stake-referral-btn");
const refConfirmBtn = document.getElementById("confirm-referral-stake");

if (refStakeBtn && refConfirmBtn) {
  if (rewardState !== "STAKE_ACTIVE") {
    refStakeBtn.disabled = true;
    refStakeBtn.textContent = "Stake Closed";
    refConfirmBtn.disabled = true;
  } else {
    refStakeBtn.disabled = false;
    refStakeBtn.textContent = "Stake Referral NXN";
    refConfirmBtn.disabled = false;
  }
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
    const shownEnergy =
  predictedEnergy !== null ? predictedEnergy : energy;

e.innerText = `Energy: ${shownEnergy} / ${maxEnergy}`;
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
if (coin) {
coin.addEventListener("touchstart", (e) => {
  e.preventDefault();

  if (!canTap) return;

  isTappingNow = true;

  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = setTimeout(() => {
    flushTapBuffer();
  }, 120);



  const touches = e.touches.length || 1;

  // 🔴 СНАЧАЛА считаем, сколько реально можем потратить
  const actualTaps = Math.min(energy, touches);
  if (actualTaps <= 0) return;

  // 🎨 UI
  animateCoinHit();
  animatePlus(e, tapPower * actualTaps);

  // 🧠 ЛОКАЛЬНО меняем состояние
  tapBuffer += actualTaps;
  balance += tapPower * actualTaps;

if (predictedEnergy === null) {
  predictedEnergy = energy;
}

predictedEnergy = Math.max(0, predictedEnergy - actualTaps);


  hasLocalEnergyDelta = true; // 👈 КРИТИЧЕСКИ ВАЖНО

  updateUI();
  updateTapState();
}, { passive: false });

}


async function flushTapBuffer() {
  if (tapFlushInProgress) return;
  if (tapBuffer <= 0) return;

  tapFlushInProgress = true;

  const amount = tapBuffer;
  tapBuffer = 0;

  try {
    const res = await fetch("/api/tap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: userId,
        taps: amount
      })
    });

    const data = await res.json();

    if (!data.ok) {
      // сервер отклонил — откат
      balance -= tapPower * amount;
      energy += amount;
      updateUI();
      updateTapState();
    } else {
    // ❗ НИЧЕГО НЕ ДЕЛАЕМ
// сервер только подтверждает, что всё ок

      updateUI();
      updateTapState();
    }

  } catch (e) {
  balance -= tapPower * amount;
  energy += amount;
  updateUI();
  updateTapState();
}

  tapFlushInProgress = false;
isTappingNow = false;
hasLocalEnergyDelta = false; // 👈 ТЕПЕРЬ СЕРВЕРУ МОЖНО ВЕРИТЬ
predictedEnergy = null;
}





async function loadReferral() {
  const res = await fetch(`/api/referral/me/${userId}`);
  return await res.json();
}




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

  let x = 0;
  let y = 0;

  if (e.touches && e.touches[0]) {
    x = e.touches[0].clientX;
    y = e.touches[0].clientY;
  } else {
    x = e.clientX || window.innerWidth / 2;
    y = e.clientY || window.innerHeight / 2;
  }

  plus.style.left = x + "px";
  plus.style.top  = (y - 20) + "px";

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

  // TOP 4–10
  const list = document.querySelector(".lb-list");
  list.innerHTML = "";

  data.slice(3).forEach((u, i) => {
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `
      <span>#${i + 4}</span>
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

    if (val === "max") {
      selectedStakeAmount = Math.min(balance, 1_000_000);
    } else {
      selectedStakeAmount = Number(val);
    }

    document.querySelectorAll(".stake-amounts button")
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

    if (selectedStakeAmount < 10000) {
      alert("Minimum stake is 10,000 NXN");
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
  if (isTappingNow) return;
  if (!userId) return;

  const res = await fetch(`/api/me/${userId}`);
  const data = await res.json();

  balance = Number(data.balance) || balance;

  // ❗ ВАЖНО: сервер НЕ ТРОГАЕТ энергию, если есть локальные тапы
  if (!hasLocalEnergyDelta) {
    energy = Number(data.energy) || energy;
  }

  maxEnergy = Number(data.maxEnergy) || maxEnergy;

  updateUI();
  updateTapState();
}, 1000);


function updateTapState() {
  if (!coin) return;

  const effectiveEnergy =
    predictedEnergy !== null ? predictedEnergy : energy;

  if (effectiveEnergy <= 0) {
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

// ===== REFERRAL STAKE QUICK AMOUNTS =====

document.querySelectorAll("[data-ref-amount]").forEach(btn => {
  btn.addEventListener("click", () => {
    const val = btn.dataset.refAmount;
    const input = document.getElementById("referral-stake-amount");

    if (val === "max") {
      input.value = window.referralStackBalance || 0;
    } else {
      input.value = Number(val);
    }
  });
});
