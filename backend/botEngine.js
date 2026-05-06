import { query } from "./db.js";

const BOT_PLAYERS = [
  ["900000001", "alex_77", "aggressive", "https://i.pinimg.com/736x/4d/9b/d0/4d9bd02d718c4909b69b2618e707f0e0.jpg"],
  ["900000002", "maksim", "aggressive", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrUsmO133AFxw2fDUbWzemC27xBUKL1MFpaA&s"],
  ["900000003", "denis_01", "aggressive", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJiHE_tGKEs93mskoCU0gZ_I34wAQw1VWUpw&s"],
  ["900000004", "leo", "aggressive", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtBE6KTerqkBeMU1uRVioAa8_2A5am9n4e4w&s"],
  ["900000005", "timur", "aggressive", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSyAbvTZ-eu2ZuETNaDwD-Fl-_hCAhIzBb5-g&s"],
  ["900000006", "nick99", "aggressive", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRkUMjTBWiv5XkRfbalr8a7QfSiw2SilItNPA&s"],

  ["900000007", "ryan", "medium", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvVTEgPpEXGiGCePHk81PAVSMHILxnp34rCg&s"],
  ["900000008", "adam_x", "medium", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQrb3eL3Lr-xsEmfHyW-l3GlsBB0HPGG2iQvw&s"],
  ["900000009", "marko", "medium", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5KAzOehBCHcqXIKklMa8ZGiqAa_1GV94oeiidlUYyThZJsRklE5jyc5w&s"],
  ["900000010", "chris_88", "medium", "https://i.pravatar.cc/150?img=24"],
  ["900000011", "sam", "medium", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJ-j0SlWpRYz1lgkq7zLvEkEhc-9XzZrcLPg&s"],
  ["900000012", "daniel", "medium", "https://avatars.mds.yandex.net/get-shedevrum/11451254/img_d30bb68e058211efa5849a79ffaf5bd2/orig"],
  ["900000013", "oliver_7", "medium", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQMAAADCCAMAAAB6zFdcAAAAkFBMVEX+AAD8AwD6BADBBQfXBQj9AQX5BAP6BQb1BQ3zBQb0BgPtBAfpBwvqCgfOBQyqBQvTBQu8CgmfCQriCAi0BgnNBg/MBgfJLxudcTegbzKdcjOsXCoABQuPAwg1BQqcBg5wBxB7BxNbBgt1BgmUcDk262pA5GmCuVahAACYCAvSCQarBgi6RSV8lkqAkkiXdjuaz4EoAAABLElEQVR4nO3Uy3LTQBAF0BlJI1mRJcvWAwIEh5chmIT//zuUClSqXGzl1Tmb6d2dru6ZEMuYYgxlFhchxSzEsoxZDDGsLVuyqyo9H1dIuwz/Vyxdx2qTNvVNk7ah7Xb9vjm0YWjGfE6rX+PmvC3GqWgOUz5vV0+7EN+8vb199z6rt8vk8w93H6duHot2PO7b+/qcUlfNeb/+ZIr7bn+cjs2nu89fitXTLn39djqdvv8YH5Y9qPt2GOqiLkL+Mx92/bxcbir6bv09aB6m6bDbN1O2Ow+rp1369fj09Pi7Hjbl83MIf59jemk7vpbrSuElJVUhXCPvf7LXjwEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAK7uD/XQCpdnDtIoAAAAAElFTkSuQmCC"],

  ["900000014", "mike_crypto", "neutral", "https://cs9.pikabu.ru/post_img/2016/11/05/8/1478348889113012245.jpg"],
  ["900000015", "tony", "neutral", "https://wallpaper.forfun.com/fetch/49/4903ea88841e11ebe216139e70aa0c98.jpeg"],
  ["900000016", "kevindeb", "neutral", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3cBxFhdLKzPJTd7rABBDj-kO_4WqUah6xwQ&s"],
  ["900000017", "jacklore", "neutral", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJQAAACUCAMAAABC4vDmAAAAA1BMVEVGm94gs2CqAAAALElEQVR4nO3BMQEAAADCoPVPbQwfoAAAAAAAAAAAAAAAAAAAAAAAAAAAAHgZViQAAd2fpbUAAAAASUVORK5CYII="],
  ["900000018", "evan", "neutral", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQF0QMj_YHqItYwHB2kdbNKP6JsqeE88r28Rw&s"],
  ["900000019", "noah", "neutral", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAA1BMVEWZ/5lPT2g3AAAASElEQVR4nO3BgQAAAADDoPlTX+AIVQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADwDcaiAAFXD1ujAAAAAElFTkSuQmCC"],
  ["900000020", "liamak", "neutral", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtS1C8WvMvlNVofTBFMBZ6S4EpMs9AJv3cWA&s"],

  ["900000021", "amir_07", "aggressive", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfyVwr7ST_DCT4fmH4tt1u69WQ-prN48iqWw&s"],
  ["900000022", "roma_x", "aggressive", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTf_TUedg_Cuz6ZztJ2IZGbAimNxdM7iZhY-Q&s"],
  ["900000023", "daniil_91", "aggressive", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcREtHsdvQI5Z_I0jRnZISuO2jUQ-91Xf6i9zA&s"],
  ["900000024", "sergo", "aggressive", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6FdU7EPS8udoir1DPmKvXye9oxH076V2zrA&s"],
  ["900000025", "matvey_13", "aggressive", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTKaCID2Yhnb8G4aOnu8B0XtgEVOwr9mCvzcg&s"],
  ["900000026", "arslan", "aggressive", "https://99px.ru/sstorage/1/2026/05/image_10105260706486415303.jpg"],
  ["900000027", "vladik", "aggressive", "https://99px.ru/sstorage/1/2026/03/10303261230558566.jpg"],
  ["900000028", "egor_88", "aggressive", "https://99px.ru/sstorage/1/2026/02/image_10202260203251267242.jpg"],
  ["900000029", "ruslanov", "aggressive", "https://99px.ru/sstorage/1/2025/12/image_11412251103547183635.jpg"],
  ["900000030", "kiril_22", "aggressive", "https://99px.ru/sstorage/1/2025/09/image_13009251739234057141.jpg"],

  ["900000031", "artemka", "medium", "https://commons.wikimedia.org/wiki/Special:FilePath/Doge_meme.png"],
  ["900000032", "dan_xx", "medium", "https://forummaxi.ru/uploads/profile/photo-25379.gif"],
  ["900000033", "slava_05", "medium", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCZteVArtjY14cVav_Yb976-9RWCEAOsI605avNQMgEw&s"],
  ["900000034", "ivan4ik", "medium", "https://commons.wikimedia.org/wiki/Special:FilePath/Sample_User_Icon.png"],
  ["900000035", "maks_777", "medium", "https://commons.wikimedia.org/wiki/Special:FilePath/Doge_meme_example.jpg"],

  ["900000036", "temka", "medium", "https://commons.wikimedia.org/wiki/Special:FilePath/Avatar%201%20cerca.png"],
  ["900000037", "azizbek", "medium", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-0ag62Usm7d25FfFFDK8vaOMcVJ0jS7L-pw&s"],
  ["900000038", "murad_11", "medium", "https://commons.wikimedia.org/wiki/Special:FilePath/Chlod%20%28avatar%29.png"],
  ["900000039", "emirhan", "medium", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT-ASMTG7K58C7_VUxJ3mb_rVdjAFxuLXZ9KvJk0JPeZg&s"],
  ["900000040", "volkan_34", "medium", "https://commons.wikimedia.org/wiki/Special:FilePath/Dedalium%20icon%20128x128.png"],

  ["900000041", "mert_09", "medium", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-fvrNNJ9jxye07lLVTI25btfzWxMn5_0haw&s"],
  ["900000042", "kaantr", "medium", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmNP8ahMk9Hr8DcGx2Bn_qxX0U9ijc8uGxzg&s"],
  ["900000043", "ilya_17", "medium", "https://commons.wikimedia.org/wiki/Special:FilePath/CityBattle%20Virtual%20Earth%20avatar.jpg"],
  ["900000044", "nikitos", "medium", "https://commons.wikimedia.org/wiki/Special:FilePath/Bluesign-avatar.png"],
  ["900000045", "sasha_q", "medium", "https://commons.wikimedia.org/wiki/Special:FilePath/Barrow%20Avatar.jpg"],

  ["900000046", "andrey", "neutral", "https://99px.ru/sstorage/1/2024/12/image_10112240928587939284.jpg"],
  ["900000047", "pasha_01", "neutral", "https://99px.ru/sstorage/1/2024/02/image_11502241202505160441.gif"],
  ["900000048", "stason", "neutral", "https://99px.ru/sstorage/1/2024/10/image_12910241918402121245.jpg"],
  ["900000049", "leha_90", "neutral", "https://avatarko.ru/img/kartinka/33/maska_film_galstuk_33913.jpg"],
  ["900000050", "miron", "neutral", "https://falcon-eyes.ru/upload/iblock/74e/yx2louwjrh7v8uk5z5ajtw9hv5tlcut0.jpg"],
  ["900000051", "ramil", "neutral", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDzCJTLYIeG4qtmkDln7uaBop7MXX1DgulOg&s"],
  ["900000052", "arsen_4", "neutral", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQSEyNm7G0rZ7BN7i3kJTwuupvXjuSZeDr_Jw&s"],
  ["900000053", "yusuf", "neutral", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRpl90RC7MdWdTdiCZY5320ooR-ZkrcZgL0XA&s"],
  ["900000054", "enes", "neutral", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBXmp4G8FsAP6A1FxmhbxrjTH_G3mTETPZGA&s"],
  ["900000055", "burak_61", "neutral", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ1ks8ZeR0QTuTn4KA3dIGRztfmgvEvX7fY2A&s"],
  ["900000056", "kerem", "neutral", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSka0Zt8-D4z2-D2ia4XnuDniUn6T9GwNBSSA&s"],
  ["900000057", "selim", "neutral", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbF6xC9ekW19yE-nD68sMccayNHTc2PKprJQ&s"],
  ["900000058", "taha_19", "neutral", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtNS-E_sO8cuYYi3Bkg4L6YUNMLqTkLQCk-A&s"],
  ["900000059", "oleg_ua", "neutral", "https://avatarko.ru/img/kartinka/2/muzhchina_kapyushon_1806.jpg"],
  ["900000060", "misha", "neutral", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcROxLB33uNtvS-Gh9K8lMTCkXLCJsbx0P22jJ4sHhzkwA&s"],
  ["900000061", "dimon_33", "neutral", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7-aOQRfF9mVJEhtPT7eMQI2XMrhD3V4_V2A&s"],
  ["900000062", "vadimka", "neutral", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSWzF5YZbGDQTup8jIlF8jp00_WpT2nf_gu0A&s"],
  ["900000063", "goga", "neutral", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSSPtb0AVxmOo-qxteP5seN3tpc4OG3FIJ_JA&s"],
  ["900000064", "marat", "neutral", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpV1ov2YmU5sRHCXq8QHQxtFTo24V0BS3pRA&s"],
  ["900000065", "renat_21", "neutral", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR20IRWbANpQ9o4PvWmNtHToypU4-xmSdHvMw&s"],
  ["900000066", "tigran", "neutral", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTXHSoCvAx1HQvNBsR8TwmGYhPUsqDmT9q48Hhl0NjfBw&s"],
["900000067", "nightzz", "aggressive", "/avatar-proxy?url=https%3A%2F%2Fi.pinimg.com%2F564x%2F9b%2F53%2F1f%2F9b531fd2c6b3d6e7d6f4f9a2a0b5f6a7.jpg"],
["900000068", "venom_x", "aggressive", "/avatar-proxy?url=https%3A%2F%2Fi.pinimg.com%2F564x%2F82%2F66%2F3c%2F82663c1f48dbe8d4b1a6c7e5f4c2d8f1.jpg"],
["900000069", "toxicboy", "aggressive", "/avatar-proxy?url=https%3A%2F%2Fi.pinimg.com%2F564x%2F73%2F92%2Fe1%2F7392e1e3f8a7d2b4c1f6e9d5a2c7b8f0.jpg"],
["900000070", "ghostik", "aggressive", "/avatar-proxy?url=https%3A%2F%2Fi.pinimg.com%2F564x%2F65%2F44%2Fa7%2F6544a7f9d1b3e6c8f2a5d7e1c9b4f6a2.jpg"],
["900000071", "darkwave", "aggressive", "/avatar-proxy?url=https%3A%2F%2Fi.pinimg.com%2F564x%2F51%2F90%2Fb2%2F5190b2d8e6f3c1a7d4b9e2f5c8a6d1b3.jpg"],

["900000072", "akira_x", "medium", "/avatar-proxy?url=https%3A%2F%2Fi.pinimg.com%2F564x%2F8f%2F31%2F42%2F8f3142f7d9a6b5e1c3d8f4a2b7c1e5d9.jpg"],
["900000073", "midnight", "medium", "/avatar-proxy?url=https%3A%2F%2Fi.pinimg.com%2F564x%2F47%2F62%2F91%2F476291e8c4f1d7a5b3e9c2f6a8d1b4e7.jpg"],
["900000074", "voidzero", "medium", "/avatar-proxy?url=https%3A%2F%2Fi.pinimg.com%2F564x%2F71%2F28%2Ff5%2F7128f5d9b4c1e7a3f6d2b8c5a1e9f4d7.jpg"],
["900000075", "animekid", "medium", "/avatar-proxy?url=https%3A%2F%2Fi.pinimg.com%2F564x%2F63%2F95%2F1d%2F63951de7a4b8c2f5d1e9a6b3c7f4d2e8.jpg"],
["900000076", "rider_77", "medium", "/avatar-proxy?url=https%3A%2F%2Fi.pinimg.com%2F564x%2F2a%2F84%2F67%2F2a8467d1f9b5c3e7a4d8f2b6c1e5d9a3.jpg"],

["900000077", "neonix", "medium", "/avatar-proxy?url=https%3A%2F%2Fi.pinimg.com%2F564x%2F95%2F47%2F2c%2F95472cf8a1d6b4e9c3f7a2d5b8e1c6f4.jpg"],
["900000078", "zenqq", "medium", "/avatar-proxy?url=https%3A%2F%2Fi.pinimg.com%2F564x%2F58%2F13%2F9e%2F58139ef4c7a2d8b5e1f6c3a9d4b7e2f1.jpg"],

["900000079", "crazycat", "neutral", "/avatar-proxy?url=https%3A%2F%2Fi.pinimg.com%2F564x%2F34%2F76%2Fb1%2F3476b1d9e5c2f8a4b7d1e6c3f9a2d5b8.jpg"],
["900000080", "sleepyy", "neutral", "/avatar-proxy?url=https%3A%2F%2Fi.pinimg.com%2F564x%2F81%2F25%2F4f%2F81254fd7b3e9c1a6d4f8b2e5c7a1d9f3.jpg"],
["900000081", "frosty", "neutral", "/avatar-proxy?url=https%3A%2F%2Fi.pinimg.com%2F564x%2F66%2F91%2F2a%2F66912ae5d8b4c1f7a3e9d2b6c5f1a8d4.jpg"],
["900000082", "moonlight", "neutral", "/avatar-proxy?url=https%3A%2F%2Fi.pinimg.com%2F564x%2F49%2F37%2Fc8%2F4937c8e1a5d9b2f6c4e8a1d7b3f5c9a2.jpg"],
["900000083", "shadowww", "neutral", "/avatar-proxy?url=https%3A%2F%2Fi.pinimg.com%2F564x%2F74%2F18%2Fe3%2F7418e3d9b5c2f7a1e6d4b8c3f9a2d5e7.jpg"],
["900000084", "kot_blin", "neutral", "/avatar-proxy?url=https%3A%2F%2Fi.pinimg.com%2F564x%2F29%2F64%2Ff1%2F2964f1d8c5a2e7b3d9f4a1c6e8b2d5f7.jpg"],
["900000085", "mrx_void", "neutral", "/avatar-proxy?url=https%3A%2F%2Fi.pinimg.com%2F564x%2F53%2F87%2F1b%2F53871be4d9a2c6f1e7b5d3a8c4f2e9d6.jpg"],
["900000086", "lunar_qq", "neutral", "/avatar-proxy?url=https%3A%2F%2Fi.pinimg.com%2F564x%2F77%2F42%2Fd5%2F7742d5e1b8c4f9a2d6e3b7c1f5a8d2e4.jpg"],
  
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function nextDelayMinutes(type) {
  if (type === "aggressive") return randomInt(18, 55);
  if (type === "medium") return randomInt(70, 190);
  return randomInt(180, 420);
}

async function getCurrentRewardCycle() {
  const res = await query(`
    SELECT *
    FROM reward_event_cycles
    ORDER BY id DESC
    LIMIT 1
  `);

  if (res.rowCount === 0) return null;

  const c = res.rows[0];
  const now = new Date();

  if (now >= new Date(c.start_at) && now <= new Date(c.stake_end_at)) {
    return { id: c.id, state: "STAKE_ACTIVE" };
  }

  if (now > new Date(c.stake_end_at) && now <= new Date(c.claim_end_at)) {
    return { id: c.id, state: "CLAIM_ACTIVE" };
  }

  return { id: c.id, state: null };
}

async function ensureBotColumns() {
  await query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS is_bot BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS bot_type TEXT,
    ADD COLUMN IF NOT EXISTS bot_next_action_at TIMESTAMP
  `);
}

async function ensureBotPlayers() {
  await ensureBotColumns();

  for (const [telegramId, name, type, avatar] of BOT_PLAYERS) {
    const startEnergy =
      type === "aggressive" ? randomInt(350, 700) :
        type === "medium" ? randomInt(180, 360) :
          randomInt(90, 180);

    const firstDelay = randomInt(1, 180);
    await query(
      `
      INSERT INTO users (
        telegram_id,
        name,
        avatar,
        balance,
        energy,
        max_energy,
        tap_power,
        is_bot,
        bot_type,
        bot_next_action_at,
        last_seen,
        last_energy_update
      )
      VALUES (
  $1::text,
  $2,
  $3,
  0,                -- ✅ баланс = 0
  $6,
$6,
  1,
  true,
  $4,
  NOW() + ($5 || ' minutes')::interval,
  NOW(),
  NOW()
)
      ON CONFLICT (telegram_id)
      DO UPDATE SET
        name = EXCLUDED.name,
        avatar = EXCLUDED.avatar,
        is_bot = true,
        bot_type = EXCLUDED.bot_type
      `,
      [
        telegramId,
        name,
        avatar || "",
        type,
        firstDelay,
startEnergy
      ]
    );
  }

  console.log("🤖 Bot players ensured:", BOT_PLAYERS.length);
}
async function botTapToZero(bot) {
  const currentEnergy = Number(bot.energy || 0);
  if (currentEnergy <= 0) return;

  let taps;

  if (bot.bot_type === "aggressive") {
  taps = randomInt(120, 420);
} else if (bot.bot_type === "medium") {
  taps = randomInt(60, 180);
} else {
  taps = randomInt(20, 90);
}

  taps = Math.min(currentEnergy, taps);

  let tapPower = Number(bot.tap_power || 1);
  const now = new Date();

  if (bot.tap_boost_until && now < new Date(bot.tap_boost_until)) {
    tapPower += 3;
  }

  const earned = taps * tapPower;

  await query(
    `
    UPDATE users
    SET
      balance = balance + $1,
      energy = GREATEST(energy - $2, 0),
      last_seen = NOW()
    WHERE telegram_id = $3::text
    `,
    [earned, taps, bot.telegram_id]
  );

  console.log(`🤖 ${bot.name} tapped ${taps}, earned ${earned}`);
}

async function botStakeIfOpen(bot) {
  const cycle = await getCurrentRewardCycle();
  if (!cycle || cycle.state !== "STAKE_ACTIVE") return;

  const fresh = await query(
    `
    SELECT balance
    FROM users
    WHERE telegram_id = $1::text
    `,
    [bot.telegram_id]
  );

  if (fresh.rowCount === 0) return;

  const balance = Number(fresh.rows[0].balance || 0);
  if (balance < 10000) return;

  let maxStake = 25000;

  if (bot.bot_type === "aggressive") maxStake = 90000;
  if (bot.bot_type === "medium") maxStake = 50000;

  const stakeAmount = randomInt(10000, Math.min(balance, maxStake));

  await query("BEGIN");

  try {
    await query(
      `
      UPDATE users
      SET balance = balance - $1,
          last_stake_change = NOW()
      WHERE telegram_id = $2::text
        AND balance >= $1
      `,
      [stakeAmount, bot.telegram_id]
    );

    await query(
      `
      INSERT INTO reward_event_stakes (
        cycle_id,
        telegram_id,
        stake_amount,
        last_updated
      )
      VALUES ($1, $2::text, $3, NOW())
      ON CONFLICT (cycle_id, telegram_id)
      DO UPDATE SET
        stake_amount = reward_event_stakes.stake_amount + EXCLUDED.stake_amount,
        last_updated = NOW()
      `,
      [cycle.id, bot.telegram_id, stakeAmount]
    );

    await query("COMMIT");

    console.log(`🏆 ${bot.name} staked ${stakeAmount} NXN`);
  } catch (err) {
    await query("ROLLBACK");
    throw err;
  }
}

async function runBotTick() {
  try {
    const bots = await query(`
      SELECT *
      FROM users
      WHERE is_bot = true
        AND bot_next_action_at <= NOW()
      ORDER BY bot_next_action_at ASC
      LIMIT 80
    `);

    for (const bot of bots.rows) {
      await botTapToZero(bot);
      await botStakeIfOpen(bot);

      await query(
        `
        UPDATE users
        SET bot_next_action_at = NOW() + ($1 || ' minutes')::interval
        WHERE telegram_id = $2::text
        `,
        [nextDelayMinutes(bot.bot_type), bot.telegram_id]
      );
    }
  } catch (err) {
    console.error("Bot engine error:", err);
  }
}

export async function initBotEngine() {
  await ensureBotPlayers();

  console.log("🤖 Bot engine INIT");

  setInterval(() => {
    runBotTick();
  }, 60 * 1000);
}