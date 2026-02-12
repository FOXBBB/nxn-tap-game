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
      startMatch(ws1, ws2, stake);
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
      startBotMatch(ws, stake);
    }

  }, 1000);
}

function startBotMatch(ws, stake) {

  ws.isActive = true;
  ws.send(JSON.stringify({ type: "start" }));

  const startTime = Date.now();

 const botShouldWin = Math.random() < 0.6;

let botBaseSpeed = 8 + Math.random() * 4; // базовая скорость
let aggression = botShouldWin ? 1.2 : 0.85;

const botInterval = setInterval(() => {

  if (!ws.isActive) return;

  const elapsed = Date.now() - startTime;
  const progress = elapsed / MATCH_DURATION;

  if (progress >= 1) return;

  // базовая скорость
  let dynamicSpeed = botBaseSpeed;

  // 🔥 60% шанс — бот реально сильнее
  if (botShouldWin) {
    dynamicSpeed *= 1.3;
  }

  // если игрок резко ускорился — бот реагирует
  if (ws.score > ws.botScore - 15) {
    dynamicSpeed += 6;
  }

  // небольшая рандомизация
  dynamicSpeed += Math.random() * 2;

  ws.botScore += dynamicSpeed;

  ws.send(JSON.stringify({
    type: "score",
    you: ws.score,
    opponent: Math.floor(ws.botScore)
  }));

}, 80);



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
    // 🔥 ЧИСТИМ СОСТОЯНИЕ
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
