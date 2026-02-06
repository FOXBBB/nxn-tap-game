// autoSendNXN.js
import { TonClient, WalletContractV4, internal } from "@ton/ton";
import { Address, beginCell, toNano } from "@ton/core";
import { getHttpEndpoint } from "@orbs-network/ton-access";
import nacl from "tweetnacl";

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
 * MAIN
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

  // 2. Wallet keypair (Ed25519)
  const seed = Buffer.from(process.env.PRIVATE_KEY_HEX, "hex");
  const keyPair = nacl.sign.keyPair.fromSeed(seed);

  const wallet = WalletContractV4.create({
    workchain: 0,
    publicKey: keyPair.publicKey,
  });
  const walletContract = client.open(wallet);

  // 3. Sender jetton wallet
  const jettonWalletResult = await client.runMethod(
    JETTON_MASTER,
    "get_wallet_address",
    [{ type: "slice", cell: beginCell().storeAddress(wallet.address).endCell() }]
  );
  const senderJettonWallet = jettonWalletResult.stack.readAddress();

  // 4. Payload
  const payload = beginCell()
    .storeUint(0x0f8a7ea5, 32)
    .storeUint(0, 64)
    .storeCoins(jettonAmount(amount))
    .storeAddress(Address.parse(userTonAddress))
    .storeAddress(wallet.address)
    .storeBit(false)
    .storeCoins(toNano("0.01"))
    .storeBit(false)
    .endCell();

  // 5. Send
  const seqno = await walletContract.getSeqno();

  await walletContract.sendTransfer({
    seqno,
    secretKey: keyPair.secretKey,
    messages: [
      internal({
        to: senderJettonWallet,
        value: toNano("0.05"),
        body: payload,
      }),
    ],
  });

  // 6. Mark PAID ONLY after send
  await db.query(
    `UPDATE reward_event_claims
     SET status = 'PAID',
         paid_at = NOW()
     WHERE id = $1 AND status = 'PENDING'`,
    [claimId]
  );

  return "SENT";
}
