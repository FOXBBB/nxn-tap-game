import express from "express";
import cors from "cors";
import routes from "./routes.js";
import path from "path";
import { fileURLToPath } from "url";
import { checkRewardCycle, runAutoclickers } from "./routes.js";
import { initPvp, onlineUsers } from "./pvp.js";
import http from "http";
import { runAutoSendNXN } from "./runAutoSend.js";



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// 🔥 API ТОЛЬКО С ПРЕФИКСОМ
app.use("/api", routes);

// 🔥 Frontend
app.use(
  express.static(
    path.join(__dirname, "../webapp")
  )
);

// 🔥 SPA fallback (очень важно)
app.get("*", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../webapp/index.html")
  );
});

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

initPvp(server); // 🔥 подключаем PvP модуль

// ===== DEBUG WS =====
server.on("upgrade", (req) => {
  console.log("WS UPGRADE:", req.url);
});


server.listen(PORT, () => {
  console.log("NXN backend running on", PORT);
});

// 🔥 ONLINE LIST API
app.get("/api/online", (req, res) => {
  const list = [];

  for (const [id, socket] of onlineUsers.entries()) {
    list.push({
      id,
      username: socket.username || "Player"
    });
  }

  res.json(list);
});



// reward cycle
setInterval(() => {
  checkRewardCycle().catch(err =>
    console.error("Reward cycle error:", err)
  );
}, 60 * 60 * 1000); // 1 час

// autoclicker
setInterval(() => {
  runAutoclickers().catch(console.error);
}, 2000); // ⬅️ КАЖДУЮ СЕКУНДУ



console.log("🔥 AutoSend interval INIT");

setInterval(() => {
  console.log("⏱ AutoSend tick");
  runAutoSendNXN().catch(err =>
    console.error("AutoSend error:", err)
  );
}, 15000);

