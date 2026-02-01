import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { routes } from "./routes.js";
import "./db.js";

const app = express();
app.use(cors());
app.use(bodyParser.json());

routes(app);
app.use(express.static("webapp"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("NXN Tap Game started on port", PORT);
});
