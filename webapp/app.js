// ===== GAME STATE (PERSISTENT) =====
let balance = Number(localStorage.getItem("balance") || 0);
let tapPower = Number(localStorage.getItem("tapPower") || 1);
let maxEnergy = Number(localStorage.getItem("maxEnergy") || 100);
let energy = Number(localStorage.getItem("energy") || maxEnergy);

// ===== SAVE / LOAD =====
function saveState() {
  localStorage.setItem("balance", balance);
  localStorage.setItem("tapPower", tapPower);
  localStorage.setItem("maxEnergy", maxEnergy);
  localStorage.setItem("energy", energy);
}

function updateUI() {
  const balanceEl = document.getElementById("balance");
  const energyEl = document.getElementById("energy");
  if (balanceEl) balanceEl.textContent = "Balance: " + balance;
  if (energyEl) energyEl.textContent = `Energy: ${energy} / ${maxEnergy}`;
}

updateUI();

// ===== NAVIGATION =====
const screens = ["leaderboard", "tap", "transfer", "shop"];

document.querySelectorAll(".menu div").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".menu div").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    screens.forEach(s => document.getElementById(s).classList.add("hidden"));
    document.getElementById(btn.dataset.go).classList.remove("hidden");
  };
});

// ===== TAP =====
const coin = document.getElementById("coin");

coin.onclick = (e) => {
  if (energy <= 0) return;

  balance += tapPower;
  energy -= 1;

  saveState();
  updateUI();

  // +1 animation
  const plus = document.createElement("div");
  plus.innerText = `+${tapPower}`;
  plus.className = "plus-one";
  plus.style.left = e.clientX + "px";
  plus.style.top = e.clientY + "px";
  document.body.appendChild(plus);

  setTimeout(() => plus.remove(), 900);
};

// ===== ENERGY REGEN =====
setInterval(() => {
  if (energy < maxEnergy) {
    energy += 1;
    saveState();
    updateUI();
  }
}, 3000);

// ===== TRANSFER (UI DEMO) =====
const sendBtn = document.getElementById("send");
const idInput = document.querySelector("#transfer input");
const amountInput = document.querySelectorAll("#transfer input")[1];

sendBtn.onclick = () => {
  const recipientId = idInput.value.trim();
  const amount = parseInt(amountInput.value);

  if (!recipientId || isNaN(amount) || amount <= 0) {
    alert("Enter valid ID and amount");
    return;
  }

  if (balance < amount) {
    alert("Not enough balance");
    return;
  }

  balance -= amount;
  saveState();
  updateUI();

  alert(`Sent ${amount} NXN to ID ${recipientId}`);
};

// ===== SHOP (NXN ONLY) =====
const purchased = JSON.parse(localStorage.getItem("purchased") || "{}");

function savePurchased() {
  localStorage.setItem("purchased", JSON.stringify(purchased));
}

document.querySelectorAll(".shop-buy").forEach(btn => {
  btn.onclick = () => {
    const text = btn.innerText;

    // TAP +1
    if (text === "10 000 NXN") {
      if (purchased.tap1) return alert("Already purchased");
      if (balance < 10000) return alert("Not enough NXN");

      balance -= 10000;
      tapPower += 1;
      purchased.tap1 = true;

      saveState();
      savePurchased();
      updateUI();

      alert("Tap Power +1 activated");
    }

    // ENERGY +100
    if (text === "20 000 NXN") {
      if (purchased.energy100) return alert("Already purchased");
      if (balance < 20000) return alert("Not enough NXN");

      balance -= 20000;
      maxEnergy += 100;
      energy += 100;
      purchased.energy100 = true;

      saveState();
      savePurchased();
      updateUI();

      alert("Energy +100 activated");
    }
  };
});
