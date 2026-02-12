import { query } from "./db.js";

function getTimeMultiplier() {
  const now = new Date();

  // Азербайджан UTC+4
  const hour = (now.getUTCHours() + 4) % 24;

  if (hour >= 2 && hour < 8) return 0.05;  // почти спят
  if (hour >= 8 && hour < 14) return 0.6;  // утро
  if (hour >= 14 && hour < 22) return 1;   // пик активности
  return 0.3; // поздний вечер
}


function getRandomStakeAmount(balance) {
  const options = [10000, 20000, 30000, 40000, 50000];
  const possible = options.filter(v => v <= balance);
  if (possible.length === 0) return 0;

  return possible[Math.floor(Math.random() * possible.length)];
}

async function getCycleStatus() {
  const res = await query(`
    SELECT started_at, stake_end_at, claim_end_at
    FROM reward_cycles
    ORDER BY created_at DESC
    LIMIT 1
  `);

  const cycle = res.rows[0];
  if (!cycle) return "NONE";

  const now = new Date();

  if (now < cycle.stake_end_at) return "STAKE_ACTIVE";
  if (now > cycle.stake_end_at && now < cycle.claim_end_at)
    return "CLAIM_ACTIVE";

  return "NONE";
}

async function runBotCycle() {
  try {
    const status = await getCycleStatus();
    if (status === "CLAIM_ACTIVE") return;

    const botRes = await query(`
      SELECT * FROM users
      WHERE is_bot = true
      LIMIT 1
    `);

    const bot = botRes.rows[0];
    if (!bot) return;

    const topReal = await query(`
      SELECT balance
      FROM users
      WHERE is_bot = false
      ORDER BY balance DESC
      LIMIT 6
    `);

    const sixthPlace = topReal.rows[5]?.balance || 0;

    let multiplier = getTimeMultiplier();
    let growth = Math.floor((100 + Math.random() * 250) * multiplier);

    let newBalance = Number(bot.balance) + growth;

    // защита топ 5
    if (newBalance > sixthPlace - 300) {
      newBalance = sixthPlace - 300;
    }

    await query(`
      UPDATE users
      SET balance = $1,
          last_seen = NOW()
      WHERE telegram_id = $2
    `, [newBalance, bot.telegram_id]);

    // stake логика
    if (status === "STAKE_ACTIVE") {
      const shouldStake =
        Math.random() < 0.3 ||
        newBalance > sixthPlace;

      if (shouldStake) {
        const stakeAmount = getRandomStakeAmount(newBalance);

        if (stakeAmount >= 10000) {
          await query(`
            UPDATE users
            SET balance = balance - $1,
                reward_stake = reward_stake + $1,
                last_stake_change = NOW()
            WHERE telegram_id = $2
          `, [stakeAmount, bot.telegram_id]);
        }
      }
    }

    console.log("Bot tick ok");
  } catch (err) {
    console.error("Bot error:", err);
  }
}

export function startBotEngine() {
  setInterval(runBotCycle, 20000);
}
