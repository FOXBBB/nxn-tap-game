import express from "express";
import router from "./routes.js";
import { startBotEngine } from "./botEngine.js";


// 🔥 ЗАПУСК REWARD EVENT SCHEDULER
import "./rewardEvent/scheduler.js";

const app = express();

app.use(express.json());
app.use("/api", router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("NXN backend running on port", PORT);
});
startBotEngine();