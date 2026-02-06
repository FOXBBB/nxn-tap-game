import { mnemonicNew, mnemonicToPrivateKey } from "@ton/crypto";
import { WalletContractV4 } from "@ton/ton";

(async () => {
  const mnemonic = await mnemonicNew(24);
  const keyPair = await mnemonicToPrivateKey(mnemonic);

  const wallet = WalletContractV4.create({
    publicKey: keyPair.publicKey,
    workchain: 0
  });

  console.log("MNEMONIC (SAVE IT SAFE):");
  console.log(mnemonic.join(" "));

  console.log("\nWALLET ADDRESS:");
  console.log(wallet.address.toString());

  console.log("\nPRIVATE KEY (HEX):");
  console.log(Buffer.from(keyPair.secretKey).toString("hex"));
})();
