import {
	createWallet,
	fromMnemonic,
	getBalance,
	sendTransaction,
} from "./wallet";
import puppeteer, { ElementHandle } from "puppeteer";
let password = "fuckformekjhgf";

const main = async () => {
	const browser = await puppeteer.launch({
		headless: false,
		timeout: 999999,
		args: [
			// "--no-sandbox",
			// "--proxy-server=socks5://127.0.0.1:9050",
			// Use proxy for localhost URLs
			// "--proxy-bypass-list=<-loopback>",
		],
	});

	await gitopia(browser);
};

const gitopia = async (browser: any) => {
	const page = await browser.newPage();
	await page.goto("https://api.ipify.org/");
	const original_ip = await page.evaluate(() => {
		return document.querySelector("body")?.children[0].innerHTML;
	});
	console.log("Original IP: " + original_ip);
	await page.goto("https://gitopia.com/login", {
		waitUntil: "networkidle2",
	});

	const selector = ".flex .flex-col .gap-2";
	await page.waitForSelector(selector);
	await page.evaluate((resultSelector: any) => {
		const btns = [
			...document
				.querySelector(resultSelector)
				.querySelectorAll("button"),
		];
		btns.forEach((item) => {
			if (item.children[1].textContent === "Recover exisiting wallet") {
				item.click();
			}
		});
	}, selector);
	const mnemonic = await createWallet();
	await page.type('[name="mnemonic"]', mnemonic);
	await page.evaluate(() => {
		const btns = [...document.querySelectorAll("button")];

		btns.forEach((item) => {
			if (item.textContent === "Recover") item.click();
		});
	});
	await page.waitForSelector('[name="wallet_password"]');
	await page.type('[name="wallet_password"]', password);
	await page.type('[name="wallet_confirm_password"]', password);
	await page.evaluate(() => {
		const btns = [...document.querySelectorAll("button")];

		btns.forEach((item) => {
			if (item.textContent === "Recover") item.click();
		});
	});

	await page.waitForSelector(
		'[class="sm:flex bg-box-grad-tl bg-base-200 px-4 py-8 justify-between items-center rounded-md mb-8"]'
	);
	await page.evaluate(() => {
		const btns = [...document.querySelectorAll("button")];

		btns.forEach((item) => {
			if (item.textContent === "Get TLORE") item.click();
		});
	});
	setTimeout(async () => {
		const balance = await getBalance(mnemonic);
		console.log(balance);
	}, 10 * 1000);
};

main();
