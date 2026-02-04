import db from "../db.js";
import { STATES } from "./constants.js";

export async function getActiveCycle() {
  const res = await db.query(
    "SELECT * FROM reward_event_cycles ORDER BY id DESC LIMIT 1"
  );
  return res.rows[0];
}

export async function updateState(cycleId, state) {
  await db.query(
    "UPDATE reward_event_cycles SET state=$1 WHERE id=$2",
    [state, cycleId]
  );
}
