let balance = 0;
let energy = 100;
const maxEnergy = 100;

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
