import express from "express";
import router from "./routes.js";

// 🔥 ЗАПУСК REWARD EVENT SCHEDULER
import "./rewardEvent/scheduler.js";

const app = express();

app.use(express.json());
app.use("/", router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("NXN backend running on port", PORT);
});
