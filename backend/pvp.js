import { WebSocketServer } from "ws";
import { query } from "./db.js";

export const onlineUsers = new Map();

const MATCH_DURATION = 20000;
let waitingQueue = new Map();

export function initPvp(server) {
  const wss = new WebSocketServer({ server, path: "/pvp" });



  wss.on("connection", (ws) => {

    ws.isActive = false;
    ws.score = 0;
    ws.botScore = 0;

    ws.on("close", () => {
  if (ws.userId) {
    onlineUsers.delete(ws.userId);
    broadcastOnlineList(); // 🔥 обновляем список
  }
  cleanup(ws);
});


  



    ws.on("message", async (msg) => {
      try {
        const data = JSON.parse(msg);

        // 🔥 REGISTER ONLINE
if (data.type === "register") {

  ws.userId = String(data.userId);
  ws.username = data.username || "Player";
  ws.avatar = data.avatar || null;

  onlineUsers.set(ws.userId, ws);

  broadcastOnlineList();
  return;
}




        if (data.type === "search") {
          await handleSearch(ws, data);
        }
        // 🔥 SEND INVITE
if (data.type === "invite") {
  const target = onlineUsers.get(data.targetId);

  if (target && target.readyState === 1) {
    target.send(JSON.stringify({
      type: "invite_received",
      fromId: ws.userId,
      fromName: ws.username,
      stake: data.stake
    }));
  }
}

// 🔥 ACCEPT INVITE
if (data.type === "accept_invite") {
  const inviter = onlineUsers.get(data.fromId);

  if (inviter && inviter.readyState === 1) {
    await createMatch(inviter, ws, data.stake);
  }
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
  });

  console.log("🔥 PvP WebSocket ready");
}

async function handleSearch(ws, data) {

  if (ws.searching || ws.isActive) return;

  ws.searching = true;

  const { userId, stake, username } = data;

  ws.username = username || "Player";
  ws.userId = String(userId);
  ws.stake = stake;

  const user = await query(
    "SELECT balance FROM users WHERE telegram_id = $1",
    [ws.userId]
  );

  if (!user.rows.length || user.rows[0].balance < stake) {
    ws.searching = false;
    ws.send(JSON.stringify({ type: "error" }));
    return;
  }

  const opponent = waitingQueue.get(stake);

  if (opponent && opponent.ws !== ws) {

    waitingQueue.delete(stake);
    clearTimeout(opponent.timeout);

    await createMatch(opponent.ws, ws, stake);

  } else {

    const timeout = setTimeout(() => {

      if (ws.readyState !== 1) return;

      waitingQueue.delete(stake);

      createBotMatch(ws, stake);

    }, 5000); // 🔥 делаем 5 сек для теста

    waitingQueue.set(stake, { ws, timeout });

    if (ws.readyState === 1) {
  ws.send(JSON.stringify({ type: "searching" }));
}

  }
}


async function createMatch(ws1, ws2, stake) {

  if (
  !ws1 || !ws2 ||
  ws1.readyState !== 1 ||
  ws2.readyState !== 1
) {
  return;
}

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

  if (ws1.readyState === 1) {
  ws1.send(JSON.stringify({
    type: "opponent",
    name: ws2.username
  }));
}

if (ws2.readyState === 1) {
  ws2.send(JSON.stringify({
    type: "opponent",
    name: ws1.username
  }));
}

  startCountdown(ws1, ws2, stake);

  ws1.searching = false;
  ws2.searching = false;

}

function startCountdown(ws1, ws2, stake) {
  let count = 3;

  const interval = setInterval(() => {

    if (ws1.readyState === 1) {
      ws1.send(JSON.stringify({
        type: "countdown",
        value: count
      }));
    }

    if (ws2.readyState === 1) {
      ws2.send(JSON.stringify({
        type: "countdown",
        value: count
      }));
    }

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

  if (ws1.readyState === 1)
  ws1.send(JSON.stringify({ type: "start" }));

if (ws2.readyState === 1)
  ws2.send(JSON.stringify({ type: "start" }));
  setTimeout(() => finishMatch(ws1, ws2, stake), MATCH_DURATION);
}

function sendScore(ws) {

  if (!ws.opponent) return;

  if (ws.readyState === 1) {
    ws.send(JSON.stringify({
      type: "score",
      you: ws.score,
      opponent: ws.opponent.score
    }));
  }

  if (ws.opponent.readyState === 1) {
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

  if (ws1.readyState === 1) {
  ws1.send(JSON.stringify({
    type: "end",
    winner: winner?.userId,
    you: ws1.score,
    opponent: ws2.score
  }));
}

if (ws2.readyState === 1) {
  ws2.send(JSON.stringify({
    type: "end",
    winner: winner?.userId,
    you: ws2.score,
    opponent: ws1.score
  }));
}


  ws1.searching = false;
  ws2.searching = false;
  ws1.opponent = null;
  ws2.opponent = null;

  ws1.matchId = null;
  ws2.matchId = null;

  ws1.score = 0;
  ws2.score = 0;

  broadcastOnlineList();

}

async function createBotMatch(ws, stake) {

  if (!ws || ws.readyState !== 1) return;

  await query(
    "UPDATE users SET balance = balance - $1 WHERE telegram_id = $2",
    [stake, ws.userId]
  );

  ws.score = 0;
  ws.botScore = 0;
  ws.matchId = "bot";

  if (ws.readyState === 1) {
  ws.send(JSON.stringify({
    type: "opponent",
    name: "BOT NXN"
  }));
}


  startBotCountdown(ws, stake);
}





function startBotCountdown(ws, stake) {

  let count = 3;

  const interval = setInterval(() => {

    if (ws.readyState === 1) {
  ws.send(JSON.stringify({
    type: "countdown",
    value: count
  }));
}


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
  if (ws.readyState === 1) {
  ws.send(JSON.stringify({ type: "start" }));
}


  // ===== BOT DIFFICULTY LOGIC =====

  // 30% — АГРЕССИВНЫЙ (420–500)
  // 40% — СРЕДНИЙ (330–420)
  // 30% — ЛЁГКИЙ (250–330)

  const roll = Math.random();
  let botTarget;

  if (roll < 0.30) {
    // 🔥 30% агрессивный
    botTarget = 420 + Math.floor(Math.random() * 81);
    // 420–500
  }
  else if (roll < 0.70) {
    // ⚖️ 40% средний
    botTarget = 330 + Math.floor(Math.random() * 91);
    // 330–420
  }
  else {
    // 🟢 30% лёгкий
    botTarget = 250 + Math.floor(Math.random() * 81);
    // 250–330
  }


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

    if (ws.readyState === 1) {
  ws.send(JSON.stringify({
    type: "score",
    you: ws.score,
    opponent: Math.floor(ws.botScore)
  }));
}

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

    if (ws.readyState === 1) {
  ws.send(JSON.stringify({
    type: "end",
    winner: playerWins ? ws.userId : "bot",
    you: ws.score,
    opponent: finalBot
  }));
}


    // очистка
    ws.matchId = null;
    ws.opponent = null;
    ws.score = 0;
    ws.botScore = 0;
    ws.searching = false;

      broadcastOnlineList();

  }, MATCH_DURATION);
}






function cleanup(ws) {

  if (ws.userId) {
  onlineUsers.delete(String(ws.userId));
}


  if (ws.stake && waitingQueue.has(ws.stake)) {
    waitingQueue.delete(ws.stake);
  }

  ws.isActive = false;
  ws.searching = false;
  ws.opponent = null;
  ws.matchId = null;
}
function broadcastOnlineList() {

  // 🔥 ОЧИЩАЕМ мёртвые сокеты
  onlineUsers.forEach((ws, id) => {
    if (!ws || ws.readyState !== 1) {
      onlineUsers.delete(id);
    }
  });

  const players = [];

 onlineUsers.forEach((ws, id) => {

  if (ws.isActive || ws.searching) return;

  players.push({
    id,
    name: ws.username,
    avatar: ws.avatar || ""
  });
});



  const payload = JSON.stringify({
    type: "online_list",
    players
  });

  onlineUsers.forEach(ws => {
    if (ws.readyState === 1) {
      ws.send(payload);
    }
  });
}


