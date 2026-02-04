export const STATES = {
  STAKE_ACTIVE: "STAKE_ACTIVE",
  CLAIM_ACTIVE: "CLAIM_ACTIVE",
  RESET: "RESET",
};

export const STAKE = {
  MIN: 50000,
  MAX: 1000000,
  COOLDOWN_MS: 60000,
};

export const CYCLE = {
  STAKE_DAYS: 14,
  CLAIM_DAYS: 3,
};

export const REWARD = {
  BASE_POOL: 1500,
  DISTRIBUTED: 1050,
};

export const TIERS = [
  { from: 1, to: 10, reward: 10 },
  { from: 11, to: 50, reward: 5 },
  { from: 51, to: 200, reward: 3 },
  { from: 201, to: 500, reward: 1 },
];
