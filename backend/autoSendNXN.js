// backend/autoSendNXN.js

import tonPkg from "@ton/ton";
const { TonClient, WalletContractW5, internal } = tonPkg;
import { Address, beginCell, toNano } from "@ton/core";
import { getHttpEndpoint } from "@orbs-network/ton-access";
import { mnemonicToPrivateKey } from "@ton/crypto";
import { query } from "./db.js";

/**
 * CONFIG
 */
const JETTON_MASTER = Address.parse(
  "EQBY-vwahbkyTFwdYaitBC9GhZsqMsaIOfQ4iv63j1eBIMuC"
);

const JETTON_DECIMALS = 3;

/**
 * utils
 */
function jettonAmount(amount) {
  return BigInt(amount) * BigInt(10 ** JETTON_DECIMALS);
}

/**
 * MAIN AUTO SEND
 */
export async function autoSendNXN({ claimId, wallet, amount }) {
  const userWalletAddress = wallet;

  console.log(
    `🚀 AutoSend NXN | claim=${claimId} | amount=${amount} | to=${userWalletAddress}`
  );

  // 1️⃣ TON client
  const endpoint = await getHttpEndpoint({ network: "mainnet" });
  const client = new TonClient({ endpoint });

  // 2️⃣ ADMIN WALLET FROM MNEMONIC
  if (!process.env.TON_MNEMONIC) {
    throw new Error("TON_MNEMONIC is not set");
  }

  const keyPair = await mnemonicToPrivateKey(
    process.env.TON_MNEMONIC.trim().split(/\s+/)
  );

  const adminWallet = WalletContractW5.create({
    workchain: 0,
    publicKey: keyPair.publicKey,
  });

  const adminWalletContract = client.open(adminWallet);

  console.log(
    "🚨 SENDER WALLET ADDRESS:",
    adminWallet.address.toString()
  );

  // 3️⃣ ADMIN JETTON WALLET
  const jw = await client.runMethod(
    JETTON_MASTER,
    "get_wallet_address",
    [
      {
        type: "slice",
        cell: beginCell()
          .storeAddress(adminWallet.address)
          .endCell(),
      },
    ]
  );

  const adminJettonWallet = Address.parse(
    jw.stack.readAddress().toString()
  );

  // 4️⃣ JETTON TRANSFER PAYLOAD
  const payload = beginCell()
    .storeUint(0x0f8a7ea5, 32) // jetton_transfer
    .storeUint(0, 64) // query_id
    .storeCoins(jettonAmount(amount))
    .storeAddress(Address.parse(userWalletAddress)) // destination
    .storeAddress(adminWallet.address) // response destination
    .storeBit(false) // no custom payload
    .storeCoins(toNano("0.01")) // forward TON
    .storeBit(false) // no forward payload
    .endCell();

  // 5️⃣ SEND
  const seqno = await adminWalletContract.getSeqno();

  await adminWalletContract.sendTransfer({
    seqno,
    secretKey: keyPair.secretKey,
    messages: [
      internal({
        to: adminJettonWallet,
        value: toNano("0.05"),
        body: payload,
      }),
    ],
  });

  console.log("✅ Jetton transfer sent");

  // 6️⃣ UPDATE DB
  await query(
    `
    UPDATE reward_event_claims
    SET status = 'PAID',
        paid_at = NOW()
    WHERE id = $1
  `,
    [claimId]
  );

  console.log("✅ Claim marked as PAID");
}
