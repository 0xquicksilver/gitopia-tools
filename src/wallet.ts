import { DirectSecp256k1HdWallet, OfflineSigner } from "@cosmjs/proto-signing";
import {
	SigningStargateClient,
	StdFee,
	calculateFee,
	GasPrice,
	coins,
} from "@cosmjs/stargate";

const denom = "utlore";
const prefix = "gitopia";
const publicRpc = "https://rpc.gitopia.com";
const localRpc = "tcp://127.0.0.1:26657";

export async function createWallet() {
	const wallet = await DirectSecp256k1HdWallet.generate(12, { prefix });
	return wallet.mnemonic;
}
export async function fromMnemonic(mnemonic: string): Promise<OfflineSigner> {
	const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
		prefix: "gitopia",
	});
	return wallet;
}

export async function getBalance(mnemonic: string) {
	const wallet = await fromMnemonic(mnemonic);
	const client = await SigningStargateClient.connectWithSigner(
		publicRpc,
		wallet
	);
	const [firstAccount] = await wallet.getAccounts();
	const balance = await client.getBalance(firstAccount.address, denom);
	return balance;
}

export async function sendTransaction(
	wallet: OfflineSigner,
	recipient: string
) {
	const client = await SigningStargateClient.connectWithSigner(
		publicRpc,
		wallet
	);
	const [firstAccount] = await wallet.getAccounts();
	const balance = await client.getBalance(firstAccount.address, denom);
	if (balance.amount <= "10000000") return;
	const amount = coins(
		Number(Number(balance.amount) - 20000).toString(),
		denom
	);
	const defaultGasPrice = GasPrice.fromString("0.01utlore");
	const defaultSendFee: StdFee = calculateFee(200000, defaultGasPrice);
	const tx = await client.sendTokens(
		firstAccount.address,
		recipient,
		amount,
		defaultSendFee,
		"Transaction"
	);
	console.log(tx.transactionHash);
}
