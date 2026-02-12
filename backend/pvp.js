import { WebSocketServer } from "ws";
import { query } from "./db.js";

const MATCH_DURATION = 20000;
let waitingQueue = new Map();

export function initPvp(server) {
  const wss = new WebSocketServer({ server, path: "/pvp" });

  wss.on("connection", (ws) => {

    ws.isActive = false;
    ws.score = 0;
    ws.botScore = 0;

    ws.on("message", async (msg) => {
      try {
        const data = JSON.parse(msg);

        if (data.type === "search") {
          await handleSearch(ws, data);
        }

        if (data.type === "tap") {
          if (!ws.isActive) return;

          ws.score++;

          if (ws.opponent) {
            sendScore(ws);
            return;
          }

          if (ws.matchId === "bot") {
            ws.send(JSON.stringify({
              type: "score",
              you: ws.score,
              opponent: Math.floor(ws.botScore)
            }));
          }
        }

      } catch (e) {
        console.error("WS ERROR:", e);
      }
    });

    ws.on("close", () => cleanup(ws));
  });

  console.log("🔥 PvP WebSocket ready");
}

async function handleSearch(ws, data) {

  if (ws.searching || ws.isActive) return; // 🔥 ЗАЩИТА

  ws.searching = true;

  const { userId, stake } = data;


  ws.userId = userId;
  ws.stake = stake;

  const user = await query(
    "SELECT balance FROM users WHERE telegram_id = $1",
    [userId]
  );

 if (!user.rows.length || user.rows[0].balance < stake) {
  ws.searching = false; // 🔥 ВАЖНО
  ws.send(JSON.stringify({ type: "error" }));
  return;
}

  const opponent = waitingQueue.get(stake);

  if (opponent && opponent.userId !== userId) {
    waitingQueue.delete(stake);
    clearTimeout(opponent.timeout);
    await createMatch(opponent.ws, ws, stake);
  } else {
    const timeout = setTimeout(() => {

  if (ws.readyState !== 1) return; // 🔥 сокет закрыт

  waitingQueue.delete(stake);
  createBotMatch(ws, stake);

}, 8000);

    waitingQueue.set(stake, { userId, ws, timeout });
    ws.send(JSON.stringify({ type: "searching" }));
  }
}

async function createMatch(ws1, ws2, stake) {

  await query(
    "UPDATE users SET balance = balance - $1 WHERE telegram_id = $2",
    [stake, ws1.userId]
  );

  await query(
    "UPDATE users SET balance = balance - $1 WHERE telegram_id = $2",
    [stake, ws2.userId]
  );

  ws1.score = 0;
  ws2.score = 0;

  ws1.opponent = ws2;
  ws2.opponent = ws1;

  ws1.send(JSON.stringify({ type: "opponent", name: ws2.userId }));
  ws2.send(JSON.stringify({ type: "opponent", name: ws1.userId }));

  startCountdown(ws1, ws2, stake);

  ws1.searching = false;
ws2.searching = false;

}

function startCountdown(ws1, ws2, stake) {
  let count = 3;

  const interval = setInterval(() => {

    ws1.send(JSON.stringify({ type: "countdown", value: count }));
    ws2.send(JSON.stringify({ type: "countdown", value: count }));

    count--;

    if (count < 0) {
      clearInterval(interval);

      setTimeout(() => {
        startMatch(ws1, ws2, stake);
      }, 500);
    }

  }, 1000);
}


function startMatch(ws1, ws2, stake) {

  ws1.isActive = true;
  ws2.isActive = true;

  ws1.send(JSON.stringify({ type: "start" }));
  ws2.send(JSON.stringify({ type: "start" }));

  setTimeout(() => finishMatch(ws1, ws2, stake), MATCH_DURATION);
}

function sendScore(ws) {

  ws.send(JSON.stringify({
    type: "score",
    you: ws.score,
    opponent: ws.opponent.score
  }));

  ws.opponent.send(JSON.stringify({
    type: "score",
    you: ws.opponent.score,
    opponent: ws.score
  }));
}

async function finishMatch(ws1, ws2, stake) {

  ws1.isActive = false;
  ws2.isActive = false;

  const total = stake * 2;
  const reward = Math.floor(total * 0.9);

  let winner = null;

  if (ws1.score > ws2.score) winner = ws1;
  else if (ws2.score > ws1.score) winner = ws2;

  if (winner) {
    await query(
      "UPDATE users SET balance = balance + $1 WHERE telegram_id = $2",
      [reward, winner.userId]
    );
  }

  ws1.send(JSON.stringify({
    type: "end",
    winner: winner?.userId,
    you: ws1.score,
    opponent: ws2.score
  }));

  ws2.send(JSON.stringify({
    type: "end",
    winner: winner?.userId,
    you: ws2.score,
    opponent: ws1.score
  }));

  ws1.searching = false;
ws2.searching = false;
ws1.opponent = null;
ws2.opponent = null;

ws1.matchId = null;
ws2.matchId = null;

ws1.score = 0;
ws2.score = 0;


}

async function createBotMatch(ws, stake) {

  await query(
    "UPDATE users SET balance = balance - $1 WHERE telegram_id = $2",
    [stake, ws.userId]
  );

  ws.matchId = "bot";
  ws.score = 0;
  ws.botScore = 0;
  ws.isActive = false;

  ws.send(JSON.stringify({
    type: "opponent",
    name: "BOT NXN"
  }));

  startBotCountdown(ws, stake);
  ws.searching = false;

}

function startBotCountdown(ws, stake) {

  let count = 3;

  const interval = setInterval(() => {

    ws.send(JSON.stringify({ type: "countdown", value: count }));

    count--;

    if (count < 0) {
      clearInterval(interval);

      setTimeout(() => {
        startBotMatch(ws, stake);
      }, 500); // даём UI показать FIGHT
    }

  }, 1000);
}

function startBotMatch(ws, stake) {

  ws.isActive = true;
  ws.send(JSON.stringify({ type: "start" }));

  const botTarget = 240 + Math.floor(Math.random() * 180); // 240–420

  ws.botScore = 0;

  const tickRate = 100; // 100мс
  const totalTicks = MATCH_DURATION / tickRate;

  const baseSpeed = botTarget / totalTicks;

  const matchStart = Date.now();

  const botInterval = setInterval(() => {

    if (!ws.isActive) return;

    const elapsed = Date.now() - matchStart;
    const timeLeft = MATCH_DURATION - elapsed;

    let speed = baseSpeed;

    // рандом живости
    speed *= (0.8 + Math.random() * 0.4);

    // иногда микропауза
    if (Math.random() < 0.05) {
      speed *= 0.3;
    }

    // ускорение в конце
    if (timeLeft < 5000) {
      speed *= 1.3 + Math.random() * 0.3;
    }

    ws.botScore += speed;

    if (ws.botScore > botTarget) {
      ws.botScore = botTarget;
    }

    ws.send(JSON.stringify({
      type: "score",
      you: ws.score,
      opponent: Math.floor(ws.botScore)
    }));

  }, tickRate);


  setTimeout(async () => {

    ws.isActive = false;
    clearInterval(botInterval);

    const finalBot = Math.floor(ws.botScore);
    const total = stake * 2;
    const reward = Math.floor(total * 0.9);

    const playerWins = ws.score > finalBot;

    if (playerWins) {
      await query(
        "UPDATE users SET balance = balance + $1 WHERE telegram_id = $2",
        [reward, ws.userId]
      );
    }

    ws.send(JSON.stringify({
      type: "end",
      winner: playerWins ? ws.userId : "bot",
      you: ws.score,
      opponent: finalBot
    }));

    // очистка
    ws.matchId = null;
    ws.opponent = null;
    ws.score = 0;
    ws.botScore = 0;
    ws.searching = false;

  }, MATCH_DURATION);
}






function cleanup(ws) {

  if (ws.stake && waitingQueue.has(ws.stake)) {
    waitingQueue.delete(ws.stake);
  }

  ws.isActive = false;
  ws.searching = false;
  ws.opponent = null;
  ws.matchId = null;
}
