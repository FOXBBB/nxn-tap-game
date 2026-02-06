// autoSendNXN.js
import { TonClient, WalletContractV4, internal } from "@ton/ton";
import { Address, Cell, beginCell, toNano } from "@ton/core";
import { getHttpEndpoint } from "@orbs-network/ton-access";
import crypto from "crypto";

/**
 * CONFIG
 */
const JETTON_MASTER = Address.parse(
  "EQBY-vwahbkyTFwdYaitBC9GhZsqMsaIOfQ4iv63j1eBIMuC"
);

const JETTON_DECIMALS = 3;

/**
 * Utils
 */
function jettonAmount(amount) {
  return BigInt(amount) * BigInt(10 ** JETTON_DECIMALS);
}

/**
 * Main auto-send
 */
export async function autoSendNXN({
  db,
  claimId,
  userTonAddress,
  amount,
}) {
  // 1. TON client
  const endpoint = await getHttpEndpoint({
    network: "mainnet",
    apiKey: process.env.TON_API_KEY,
  });

  const client = new TonClient({ endpoint });

  // 2. Wallet (sender)
  const keyPair = crypto.createHash("sha256")
    .update(Buffer.from(process.env.PRIVATE_KEY_HEX, "hex"))
    .digest();

  const wallet = WalletContractV4.create({
    workchain: 0,
    publicKey: keyPair,
  });

  const walletContract = client.open(wallet);

  // 3. Jetton wallet of sender
  const jettonWalletAddress = await client.runMethod(
    JETTON_MASTER,
    "get_wallet_address",
    [{ type: "slice", cell: beginCell().storeAddress(wallet.address).endCell() }]
  );

  const senderJettonWallet = Address.parse(
    jettonWalletAddress.stack.readAddress().toString()
  );

  // 4. Jetton transfer payload
  const payload = beginCell()
    .storeUint(0x0f8a7ea5, 32)           // jetton_transfer
    .storeUint(0, 64)                    // query_id
    .storeCoins(jettonAmount(amount))   // amount
    .storeAddress(Address.parse(userTonAddress)) // destination
    .storeAddress(wallet.address)        // response_destination
    .storeBit(false)                     // no custom payload
    .storeCoins(toNano("0.01"))          // forward TON
    .storeBit(false)                     // no forward payload
    .endCell();

  // 5. Send transfer
  await walletContract.sendTransfer({
    secretKey: keyPair,
    seqno: await walletContract.getSeqno(),
    messages: [
      internal({
        to: senderJettonWallet,
        value: toNano("0.05"),
        body: payload,
      }),
    ],
  });

  // 6. Update DB
  await db.query(
    `UPDATE reward_event_claims
     SET status = 'PAID',
         paid_at = NOW()
     WHERE id = $1`,
    [claimId]
  );

  console.log(`✅ NXN sent: ${amount} → ${userTonAddress}`);
}
return "TON_TX_SENT"; // временно, потом заменим на реальный hash
