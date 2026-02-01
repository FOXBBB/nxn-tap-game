const userId = Math.floor(Math.random() * 1e9);

function showScreen(name) {
  document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
  document.getElementById("screen-" + name).classList.remove("hidden");

  document.querySelectorAll(".bottom-menu div").forEach(i => i.classList.remove("active"));
  if (name === "leaderboard") document.querySelector(".bottom-menu div:nth-child(1)").classList.add("active");
  if (name === "tap") document.querySelector(".bottom-menu div:nth-child(2)").classList.add("active");
  if (name === "shop") document.querySelector(".bottom-menu div:nth-child(3)").classList.add("active");
}

function update(user) {
  document.getElementById("stats").innerText =
    `Balance ${user.balance} · Energy ${user.energy}/${user.max_energy} · Tap +${user.tap_power}`;
}

function spawnFloater(x, y, value) {
  const f = document.createElement("div");
  f.className = "floater";
  f.style.left = x + "px";
  f.style.top = y + "px";
  f.innerText = `+${value}`;
  document.getElementById("floaters").appendChild(f);
  setTimeout(() => f.remove(), 800);
}

fetch("/init", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ id: userId })
})
.then(r => r.json())
.then(update);

function tap(e) {
  spawnFloater(e.clientX, e.clientY, "+");

  fetch("/tap", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: userId })
  })
  .then(r => r.json())
  .then(user => {
    spawnFloater(e.clientX, e.clientY, user.tap_power);
    update(user);
  });
}

function buy(type) {
  fetch("/upgrade", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: userId, type })
  });
}

function transfer() {
  fetch("/transfer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      from: userId,
      to: document.getElementById("toId").value,
      amount: Number(document.getElementById("amount").value)
    })
  });
}
