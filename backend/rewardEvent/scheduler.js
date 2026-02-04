import { getActiveCycle, updateState } from "./stateMachine.js";
import { calculateRewards, resetCycle, createNewCycle } from "./reward.engine.js";
import { STATES } from "./constants.js";

async function tick() {
  const cycle = await getActiveCycle();
  if (!cycle) return;

  const now = new Date();

  if (cycle.state === STATES.STAKE_ACTIVE && now >= cycle.stake_end) {
    await calculateRewards(cycle.id);
    await updateState(cycle.id, STATES.CLAIM_ACTIVE);
  }

  if (cycle.state === STATES.CLAIM_ACTIVE && now >= cycle.claim_end) {
    await resetCycle(cycle.id);
    await createNewCycle();
  }
}

setInterval(tick, 60 * 1000);
