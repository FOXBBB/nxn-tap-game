// ===== GAME STATE (PERSISTENT) =====
let balance = Number(localStorage.getItem("balance") || 0);
let tapPower = Number(localStorage.getItem("tapPower") || 1);

let maxEnergy = Number(localStorage.getItem("maxEnergy") || 100);
let energy = Number(localStorage.getItem("energy") || maxEnergy);

const screens = ["leaderboard", "tap", "transfer", "shop"];

document.querySelectorAll(".menu div").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".menu div").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    screens.forEach(s => document.getElementById(s).classList.add("hidden"));
    document.getElementById(btn.dataset.go).classList.remove("hidden");
  };
});

const coin = document.getElementById("coin");
const bal = document.getElementById("balance");
const eng = document.getElementById("energy");
const balanceEl = document.getElementById("balance");
const energyEl = document.getElementById("energy");

function updateUI() {
  if (balanceEl) balanceEl.textContent = "Balance: " + balance;
  if (energyEl) energyEl.textContent = `Energy: ${energy} / ${maxEnergy}`;
}

updateUI();

coin.onclick = (e) => {
  if (energy <= 0) return;

  balance += 1;
  energy -= 1;

  bal.innerText = "Balance: " + balance;
  eng.innerText = `Energy: ${energy} / ${maxEnergy}`;

  // +1 animation
  const plus = document.createElement("div");
  plus.innerText = "+1";
  plus.className = "plus-one";
  plus.style.left = e.clientX + "px";
  plus.style.top = e.clientY + "px";
  document.body.appendChild(plus);

  setTimeout(() => plus.remove(), 900);
};

setInterval(() => {
  if (energy < maxEnergy) {
    energy++;
    eng.innerText = `Energy: ${energy} / ${maxEnergy}`;
  }
}, 3000);

document.getElementById("max").onclick = () => {
  document.getElementById("amount").value = balance + " NXN";
};

document.getElementById("send").onclick = () => {
  alert("Transfer sent (UI demo)");
};
// ===== TRANSFER LOGIC =====
const sendBtn = document.getElementById("send");
const amountInput = document.querySelector("#transfer input[value='67 NXN'], #transfer input[type='text']:nth-of-type(2)");
const idInput = document.querySelector("#transfer input");

function getBalance() {
  return Number(localStorage.getItem("balance") || 0);
}

function setBalance(val) {
  localStorage.setItem("balance", val);
  const balanceEl = document.getElementById("balance");
  if (balanceEl) balanceEl.textContent = "Balance: " + val;
}

sendBtn.addEventListener("click", () => {
  const recipientId = idInput.value.trim();
  const amount = parseInt(amountInput.value);

  if (!recipientId || isNaN(amount) || amount <= 0) {
    alert("Enter valid ID and amount");
    return;
  }

  let balance = getBalance();

  if (balance < amount) {
    alert("Not enough balance");
    return;
  }

  // списываем
  balance -= amount;
  setBalance(balance);

  // сохраняем получателю (симуляция)
  const key = "user_" + recipientId;
  const received = Number(localStorage.getItem(key) || 0);
  localStorage.setItem(key, received + amount);

  alert(`Sent ${amount} NXN to ID ${recipientId}`);
});

// ===== SHOP STATS LOAD =====
// maxEnergy уже существует выше — просто перезаписываем значение
maxEnergy = Number(localStorage.getItem("maxEnergy") || maxEnergy);

// применяем сохранённые значения
function applyStats() {
  const energyEl = document.getElementById("energy");
  if (energyEl) {
    energyEl.textContent = `Energy: ${energy} / ${maxEnergy}`;
  }
}

// сохраняем
function saveState() {
  localStorage.setItem("balance", balance);
  localStorage.setItem("energy", energy);
  localStorage.setItem("maxEnergy", maxEnergy);
  localStorage.setItem("tapPower", tapPower);
}


// баланс
function getBalance() {
  return Number(localStorage.getItem("balance") || 0);
}
function setBalance(val) {
  localStorage.setItem("balance", val);
  const balanceEl = document.getElementById("balance");
  if (balanceEl) balanceEl.textContent = "Balance: " + val;
}

// список покупок (1 раз навсегда)
const purchased = JSON.parse(localStorage.getItem("purchased") || "{}");

function savePurchased() {
  localStorage.setItem("purchased", JSON.stringify(purchased));
}

// обработка кликов по кнопкам магазина
document.querySelectorAll(".shop-buy").forEach(btn => {
  btn.addEventListener("click", () => {
    const text = btn.innerText;

    // === TAP +1 за NXN ===
    if (text === "10 000 NXN") {
      if (purchased.tap1) {
        alert("Already purchased");
        return;
      }
      const balance = getBalance();
      if (balance < 10000) {
        alert("Not enough NXN");
        return;
      }

      setBalance(balance - 10000);
      tapPower += 1;
      purchased.tap1 = true;
      saveStats();
      savePurchased();
      alert("Tap Power +1 activated");
    }

    // === ENERGY +100 за NXN ===
    if (text === "20 000 NXN") {
      if (purchased.energy100) {
        alert("Already purchased");
        return;
      }
      const balance = getBalance();
      if (balance < 20000) {
        alert("Not enough NXN");
        return;
      }

      setBalance(balance - 20000);
      maxEnergy += 100;
      energy += 100;
      purchased.energy100 = true;
      saveStats();
      savePurchased();
      applyStats();
      alert("Energy +100 activated");
    }
  });
});
