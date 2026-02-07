import { TonClient, WalletContractV4, internal } from "@ton/ton";
import { Address, beginCell, toNano } from "@ton/core";
import { getHttpEndpoint } from "@orbs-network/ton-access";
import { mnemonicToPrivateKey } from "@ton/crypto";
const endpoint = await getHttpEndpoint({ network: "mainnet" });
const client = new TonClient({ endpoint });

const keyPair = await mnemonicToPrivateKey(
  process.env.TON_MNEMONIC.split(" ")
);

const wallet = WalletContractV4.create({
  workchain: 0,
  publicKey: keyPair.publicKey,
});

const walletContract = client.open(wallet);

console.log("🚨 SENDER WALLET ADDRESS:", wallet.address.toString());
await walletContract.sendTransfer({
  seqno: await walletContract.getSeqno(),
  secretKey: keyPair.secretKey,
  messages: [
    internal({
      to: senderJettonWallet,
      value: toNano("0.05"),
      body: payload,
    }),
  ],
});
