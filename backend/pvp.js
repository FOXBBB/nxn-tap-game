import { WebSocketServer } from "ws";
import { query, pool } from "./db.js";

const MATCH_DURATION = 20000;


let waitingQueue = new Map();

export function initPvp(server) {
  const wss = new WebSocketServer({ server, path: "/pvp" });

  wss.on("connection", (ws) => {

    ws.isActive = false;

    ws.on("message", async (msg) => {
      try {
        const data = JSON.parse(msg);

        if (data.type === "search") {
          await handleSearch(ws, data);
        }

       if (data.type === "tap") {

  if (!ws.isActive) return;

  ws.score++;

  // 🔥 РЕАЛЬНЫЙ ПРОТИВНИК
  if (ws.opponent) {
    sendScore(ws);
    return;
  }

  // 🔥 БОТ
  if (ws.matchId === "bot") {
    ws.send(JSON.stringify({
      type: "score",
      you: ws.score,
      opponent: Math.floor(ws.botScore || 0)
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
  const { userId, stake } = data;

  ws.userId = userId;
  ws.stake = stake;

  const user = await query(
    "SELECT balance FROM users WHERE telegram_id = $1",
    [userId]
  );

  if (!user.rows.length || user.rows[0].balance < stake) {
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

  ws1.send(JSON.stringify({
  type: "opponent",
  name: ws2.userId
}));

ws2.send(JSON.stringify({
  type: "opponent",
  name: ws1.userId
}));

  startCountdown(ws1, ws2, stake);
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
    opponent: ws.opponent?.score || 0
  }));

  if (ws.opponent) {
    ws.opponent.send(JSON.stringify({
      type: "score",
      you: ws.opponent.score,
      opponent: ws.score
    }));
  }
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
}

async function createBotMatch(ws, stake) {

  await query(
    "UPDATE users SET balance = balance - $1 WHERE telegram_id = $2",
    [stake, ws.userId]
  );

  ws.matchId = "bot";
  ws.score = 0;
  ws.botScore = 0;
  ws.isActive = true;

  // 🎯 60% шанс что бот выиграет
  const botShouldWin = Math.random() < 0.6;

  ws.send(JSON.stringify({ type: "start" }));

  const startTime = Date.now();

  const botInterval = setInterval(() => {

    if (!ws.isActive) return;

    const elapsed = Date.now() - startTime;
    const progress = elapsed / MATCH_DURATION;

    if (progress >= 1) return;

    // 🔥 бот адаптируется под твой счёт
    const targetBase = ws.score + (botShouldWin ? 15 : -10);

    const dynamicSpeed =
      (targetBase - ws.botScore) * 0.08;

    ws.botScore += Math.max(dynamicSpeed, 1);

    ws.send(JSON.stringify({
      type: "score",
      you: ws.score,
      opponent: Math.floor(ws.botScore)
    }));

  }, 100);

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

  }, MATCH_DURATION);
}





function cleanup(ws) {
  if (ws.stake && waitingQueue.has(ws.stake)) {
    waitingQueue.delete(ws.stake);
  }
}
