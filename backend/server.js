import express from "express";
import http from "http";
import router from "./routes.js";
import { initPvp } from "./pvp.js";
import { startBotEngine } from "./botEngine.js";
import "./rewardEvent/scheduler.js";

const app = express();
app.use(express.json());
app.use("/api", router);

const server = http.createServer(app);

// 🔥 ВАЖНО — ИНИЦИАЛИЗАЦИЯ PvP
initPvp(server);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("NXN backend running on port", PORT);
});

startBotEngine();
