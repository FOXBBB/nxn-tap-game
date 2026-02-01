let userId = localStorage.getItem("nxn_user_id");
if (!userId) {
  userId = Date.now().toString();
  localStorage.setItem("nxn_user_id", userId);
}

let currentUser = null;

document.addEventListener("DOMContentLoaded", () => {

 function showScreen(name) {
  document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
  document.getElementById(`screen-${name}`).classList.remove("hidden");

  document.querySelectorAll(".menu-item").forEach(i => i.classList.remove("active"));
  document.querySelector(`.menu-item[data-screen="${name}"]`).classList.add("active");

  // 🔥 ВАЖНО: показываем transfer ТОЛЬКО на tap
  const transferBox = document.querySelector(".transfer-box");
  if (transferBox) {
    transferBox.style.display = name === "tap" ? "block" : "none";
  }

  if (name === "leaderboard") loadLeaderboard();
}


  function updateUI(user) {
    currentUser = user;
    document.getElementById("balance").innerText = `Balance: ${user.balance ?? 0}`;
    document.getElementById("energy").innerText =
      `Energy: ${user.energy ?? 0} / ${user.max_energy ?? 0}`;
  }

  async function initUser() {
    const res = await fetch("/init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: userId })
    });
    updateUI(await res.json());
  }

  async function loadLeaderboard() {
    const res = await fetch("/leaderboard");
    const data = await res.json();
    document.getElementById("leaderboard").innerHTML =
      data.map((u, i) =>
        `<div>#${i + 1} — ID ${u.id} — ${u.balance}</div>`
      ).join("");
  }

  function spawnPlus(x, y, value) {
    const el = document.createElement("div");
    el.className = "tap-plus";
    el.innerText = `+${value}`;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    document.getElementById("tap-effects").appendChild(el);
    setTimeout(() => el.remove(), 900);
  }

  document.getElementById("coin").addEventListener("click", async (e) => {
    if (!currentUser || currentUser.energy <= 0) return;

    spawnPlus(e.clientX, e.clientY, currentUser.tap_power);

    const res = await fetch("/tap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: userId })
    });

    updateUI(await res.json());
    loadLeaderboard();
  });

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

  document.querySelectorAll(".menu-item").forEach(item => {
    item.addEventListener("click", () => showScreen(item.dataset.screen));
  });

  setInterval(initUser, 3000);

  initUser();
  showScreen("tap");
});
