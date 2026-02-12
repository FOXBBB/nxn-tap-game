import { WebSocketServer } from "ws";
import { query, pool } from "./db.js";
import { v4 as uuidv4 } from "uuid";

const MATCH_DURATION = 20000; // 20 сек
const BOT_SCORE_MIN = 280;
const BOT_SCORE_MAX = 420;

let waitingQueue = new Map(); // stake -> { playerId, ws, timeout }

export function initPvp(server) {
  const wss = new WebSocketServer({ server, path: "/pvp" });

  wss.on("connection", (ws) => {
    ws.on("message", async (msg) => {
      try {
        const data = JSON.parse(msg);

        if (data.type === "search") {
          await handleSearch(ws, data);
        }

        if (data.type === "tap") {
          await handleTap(ws);
        }

      } catch (e) {
        console.error("WS ERROR:", e);
      }
    });

    ws.on("close", () => {
      cleanup(ws);
    });
  });

  console.log("🔥 PvP WebSocket ready");
}

async function handleSearch(ws, data) {
  const { userId, stake } = data;

  if (stake < 1000 || stake > 100000) return;

  ws.userId = userId;
  ws.stake = stake;

  // проверка баланса
  const user = await query(
    "SELECT balance FROM users WHERE telegram_id = $1",
    [userId]
  );

  if (!user.rows.length || user.rows[0].balance < stake) {
    ws.send(JSON.stringify({ type: "error", message: "Not enough NXN" }));
    return;
  }

  // ищем соперника
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
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(
      "UPDATE users SET balance = balance - $1 WHERE telegram_id = $2",
      [stake, ws1.userId]
    );
    await client.query(
      "UPDATE users SET balance = balance - $1 WHERE telegram_id = $2",
      [stake, ws2.userId]
    );

    const res = await client.query(
      `INSERT INTO pvp_matches 
       (player1_id, player2_id, stake, status)
       VALUES ($1,$2,$3,'active')
       RETURNING id`,
      [ws1.userId, ws2.userId, stake]
    );

    await client.query("COMMIT");

    const matchId = res.rows[0].id;

    startMatch(matchId, ws1, ws2, stake);

  } catch (e) {
    await client.query("ROLLBACK");
    console.error(e);
  } finally {
    client.release();
  }
}

function startMatch(matchId, ws1, ws2, stake) {
  ws1.matchId = matchId;
  ws2.matchId = matchId;

  ws1.score = 0;
  ws2.score = 0;

  ws1.opponent = ws2;
  ws2.opponent = ws1;

  ws1.send(JSON.stringify({ type: "start", duration: 20 }));
  ws2.send(JSON.stringify({ type: "start", duration: 20 }));

  setTimeout(() => {
    finishMatch(matchId, ws1, ws2, stake);
  }, MATCH_DURATION);
}

async function handleTap(ws) {
  if (!ws.matchId) return;

  ws.score++;

  ws.send(JSON.stringify({ type: "score", you: ws.score }));
}

async function finishMatch(matchId, ws1, ws2, stake) {
  const total = stake * 2;
  const winnerReward = Math.floor(total * 0.9);
  const burn = total - winnerReward;

  let winner = null;

  if (ws1.score > ws2.score) winner = ws1;
  else if (ws2.score > ws1.score) winner = ws2;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    if (winner) {
      await client.query(
        "UPDATE users SET balance = balance + $1 WHERE telegram_id = $2",
        [winnerReward, winner.userId]
      );
    }

    await client.query(
      `UPDATE pvp_matches
       SET status='finished',
           player1_score=$1,
           player2_score=$2,
           winner_id=$3,
           burn_amount=$4
       WHERE id=$5`,
      [
        ws1.score,
        ws2.score,
        winner ? winner.userId : null,
        burn,
        matchId
      ]
    );

    await client.query("COMMIT");

  } catch (e) {
    await client.query("ROLLBACK");
    console.error(e);
  } finally {
    client.release();
  }

  ws1.send(JSON.stringify({ type: "end", winner: winner?.userId }));
  ws2.send(JSON.stringify({ type: "end", winner: winner?.userId }));
}

function createBotMatch(ws, stake) {
  const botScore =
    Math.floor(Math.random() * (BOT_SCORE_MAX - BOT_SCORE_MIN)) +
    BOT_SCORE_MIN;

  ws.score = 0;

  ws.send(JSON.stringify({ type: "start", duration: 20 }));

  setTimeout(async () => {
    const total = stake * 2;
    const winnerReward = Math.floor(total * 0.9);
    const burn = total - winnerReward;

    const playerWins = ws.score > botScore;

    if (playerWins) {
      await query(
        "UPDATE users SET balance = balance + $1 WHERE telegram_id = $2",
        [winnerReward, ws.userId]
      );
    }

    ws.send(JSON.stringify({
      type: "end",
      winner: playerWins ? ws.userId : "bot",
      botScore
    }));

  }, MATCH_DURATION);
}

function cleanup(ws) {
  if (ws.stake && waitingQueue.has(ws.stake)) {
    waitingQueue.delete(ws.stake);
  }
}
