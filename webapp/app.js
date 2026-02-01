// ===== USER ID (PERSISTENT) =====
let userId = localStorage.getItem("nxn_user_id");
if (!userId) {
  userId = Date.now().toString();
  localStorage.setItem("nxn_user_id", userId);
}

// ===== STATE =====
let currentUser = null;

// ===== DOM READY =====
document.addEventListener("DOMContentLoaded", () => {

  // ===== SCREEN SWITCH =====
  function showScreen(name) {
    document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
    document.getElementById(`screen-${name}`).classList.remove("hidden");

    document.querySelectorAll(".menu-item").forEach(i => i.classList.remove("active"));
    document.querySelector(`.menu-item[data-screen="${name}"]`).classList.add("active");

    if (name === "leaderboard") loadLeaderboard();
  }

  // ===== UPDATE UI =====
  function updateUI(user) {
    if (!user) return;
    currentUser = user;

    document.getElementById("stats").innerText =
      `Balance: ${user.balance ?? 0} | Energy: ${user.energy ?? 0}/${user.max_energy ?? 0} | Tap +${user.tap_power ?? 1}`;
  }

  // ===== INIT USER =====
  async function initUser() {
    const res = await fetch("/init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: userId })
    });
    const user = await res.json();
    updateUI(user);
  }

  // ===== LEADERBOARD =====
  async function loadLeaderboard() {
    const res = await fetch("/leaderboard");
    const data = await res.json();

    document.getElementById("leaderboard").innerHTML =
      data.map((u, i) =>
        `<div>#${i + 1} — ID ${u.id} — ${u.balance}</div>`
      ).join("");
  }

  // ===== +X ANIMATION =====
  function spawnPlus(x, y, value) {
    const plus = document.createElement("div");
    plus.className = "tap-plus";
    plus.innerText = `+${value}`;
    plus.style.left = `${x}px`;
    plus.style.top = `${y}px`;

    document.getElementById("tap-effects").appendChild(plus);
    setTimeout(() => plus.remove(), 900);
  }

  // ===== TAP =====
  document.getElementById("coin").addEventListener("click", async (e) => {
    if (!currentUser || currentUser.energy <= 0) return;

    spawnPlus(e.clientX, e.clientY, currentUser.tap_power);

    const res = await fetch("/tap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: userId })
    });

    const user = await res.json();
    updateUI(user);
    loadLeaderboard();
  });

  // ===== TRANSFER =====
  document.getElementById("sendBtn").addEventListener("click", async () => {
    await fetch("/transfer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        from: userId,
        to: document.getElementById("toId").value,
        amount: Number(document.getElementById("amount").value)
      })
    });
  });

  // ===== MENU EVENTS =====
  document.querySelectorAll(".menu-item").forEach(item => {
    item.addEventListener("click", () => {
      showScreen(item.dataset.screen);
    });
  });

  // ===== AUTO ENERGY REFRESH =====
  setInterval(initUser, 3000);

  // ===== START =====
  initUser();
  showScreen("tap");
});
