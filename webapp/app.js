let user = {
  balance: 0,
  energy: 100,
  maxEnergy: 100,
  tapPower: 1
};

const balanceEl = document.getElementById("balance");
const energyEl = document.getElementById("energy");
const coinEl = document.getElementById("coin");
const effectsEl = document.getElementById("tap-effects");

function updateUI() {
  balanceEl.innerText = `Balance: ${user.balance}`;
  energyEl.innerText = `Energy: ${user.energy} / ${user.maxEnergy}`;
}

/* TAP */
coinEl.addEventListener("click", (e) => {
  if (user.energy <= 0) return;
  user.energy -= 1;
  user.balance += user.tapPower;
  spawnPlus(e.clientX, e.clientY, user.tapPower);
  updateUI();
});

/* ENERGY REGEN */
setInterval(() => {
  if (user.energy < user.maxEnergy) {
    user.energy += 1;
    updateUI();
  }
}, 3000);

/* EFFECT */
function spawnPlus(x, y, value) {
  const el = document.createElement("div");
  el.className = "tap-plus";
  el.innerText = `+${value}`;
  el.style.left = x + "px";
  el.style.top = y + "px";
  effectsEl.appendChild(el);
  setTimeout(() => el.remove(), 900);
}

/* MENU */
document.querySelectorAll(".menu-item").forEach(item => {
  item.addEventListener("click", () => {
    const screen = item.dataset.screen;

    document.querySelectorAll(".screen").forEach(s =>
      s.classList.add("hidden")
    );
    document.getElementById(`screen-${screen}`).classList.remove("hidden");

    document.querySelectorAll(".menu-item").forEach(i =>
      i.classList.remove("active")
    );
    item.classList.add("active");
  });
});

updateUI();
