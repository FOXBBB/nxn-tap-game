import { beginCell, Address, toNano } from "@ton/core";
import { TonClient, WalletContractV4 } from "@ton/ton";
import { getHttpEndpoint } from "@orbs-network/ton-access";
import { JettonMaster } from "@ton/ton";

async function sendJetton(to, amount) {
  const endpoint = await getHttpEndpoint({ network: "mainnet" });
  const client = new TonClient({ endpoint });

  const wallet = WalletContractV4.create({
    workchain: 0,
    publicKey,
  });

  const walletContract = client.open(wallet);

  const jettonMaster = client.open(
    JettonMaster.create(Address.parse(JETTON_MASTER))
  );

  const jettonWalletAddress =
    await jettonMaster.getWalletAddress(wallet.address);

  const jettonAmount =
    BigInt(amount) * BigInt(10 ** DECIMALS);

  // 🧠 Jetton transfer body (ВАЖНО)
  const body = beginCell()
    .storeUint(0xf8a7ea5, 32)          // jetton transfer op
    .storeUint(0, 64)                 // query id
    .storeCoins(jettonAmount)         // jetton amount
    .storeAddress(Address.parse(to))  // destination
    .storeAddress(wallet.address)     // response destination
    .storeBit(0)                      // no custom payload
    .storeCoins(toNano("0.02"))       // forward TON
    .storeBit(0)                      // no forward payload
    .endCell();

  const seqno = await walletContract.getSeqno();

  await walletContract.sendTransfer({
    seqno,
    secretKey,
    messages: [
      {
        to: jettonWalletAddress,
        value: toNano("0.05"),
        body,
      },
    ],
  });

  while ((await walletContract.getSeqno()) === seqno) {
    await new Promise(r => setTimeout(r, 1500));
  }
}
