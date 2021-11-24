require("dotenv").config();
const cron = require("node-cron");
const express = require("express");
const ethers = require("ethers");
const config = require("../config/config.json");

const providerUrl = process.env.PROVIDER_URL;
const privateKey = process.env.PRIVATE_KEY;
const minSellLiquidity = process.env.MIN_SELL_LIQUIDITY;
const gasPrice = process.env.GAS_PRICE;
const snowdogSeller = process.env.SNOWDOG_SELLER;
const recipient = process.env.RECIPIENT;
if (!providerUrl) throw new Error("Missing env var PROVIDER_URL");
if (!privateKey) throw new Error("Missing env var PRIVATE_KEY");
if (!minSellLiquidity) throw new Error("Missing env var MIN_SELL_LIQUIDITY");
if (!gasPrice) throw new Error("Missing env var GAS_PRICE");
if (!snowdogSeller) throw new Error("Missing env var SNOWDOG_SELLER");
if (!recipient) throw new Error("Missing env var RECIPIENT");

const provider = new ethers.providers.JsonRpcProvider(providerUrl);
const wallet = new ethers.Wallet(privateKey, provider);

const erc20Abi = require("../abi/IERC20.json");
const snowdogSellerAbi = require("../abi/SnowdogSeller.json");
  
const app = express(); // Initializing app

let isSelling = false;
  
// Creating a cron job which runs on every 5 second
cron.schedule("*/5 * * * * *", async function() {
    await checkIfBuybackOccured();
});

async function checkIfBuybackOccured() {
    if (isSelling) return;
    console.log("Checking for buyback");
    const mimContract = new ethers.Contract(config.mim, erc20Abi, provider);
    const snowdogMimLpBalance = await mimContract.balanceOf(config.snowdogMimLp);
    const formattedBalance = ethers.utils.formatEther(snowdogMimLpBalance);
    console.log(`snowdogMimLp balance: ${formattedBalance}`);
    if (snowdogMimLpBalance.gt(ethers.utils.parseEther(minSellLiquidity))) {
        console.log(`snowdog-mim-lp balance above $${minSellLiquidity} (${formattedBalance}) triggering sell`);
        isSelling = true;
        const success = await sellSnowdog();
        if (success) {
            const recipientMimBalance = await mimContract.balanceOf(recipient);
            console.log(`Snowbank sold for ${ethers.utils.formatEther(recipientMimBalance)} MIM`);
            process.exit(); 
        } else {
            console.log("TX Failed!");
            process.exit(1); 
        }
    }
}

async function sellSnowdog() {
    const snowdogSeller = new ethers.Contract(snowdogSeller, snowdogSellerAbi, wallet);
    try {
        const nonce = await provider.getTransactionCount(wallet.address);
        console.log(`nonce ${nonce}`);
        const tx = await snowdogSeller.populateTransaction.sellSnowdog(
            ethers.utils.parseEther(minSellLiquidity),
        );
        console.log(`tx data ${JSON.stringify(tx, null, 2)}`);;
        tx.gasPrice = ethers.utils.parseUnits(gasPrice, "gwei");
        tx.nonce = nonce;
        let txHash;
        for (let i = 0; i < 100; i++) {
            try {
                console.log(`spamming for ${i}'th time'`);
                txHash = (await wallet.sendTransaction(tx)).hash;
            } catch(e) {
                console.log(`error broadcasting for the ${i}'th time'`);
                console.log(e.message);
            }
        }
        console.log(`Sent sell snowdog tx! - ${txHash}`);
        await provider.waitForTransaction(txHash, 3);
        console.log("TX confirmed with 3 blocks");
        return true;
    } catch(e) {
        console.error("Received error selling snowdog");
        console.error(e.message);
        return false;
    }
}
  
app.listen(process.env.PORT || 5000, async function() {
    console.log(`watcher app listening at http://localhost:${process.env.PORT || 5000}`);
    const snowdogContract = new ethers.Contract(config.snowdog, erc20Abi, provider);
    const snowdogSellerBalance = await snowdogContract.balanceOf(snowdogSeller);
    const formattedBalance = ethers.utils.formatUnits(snowdogSellerBalance, 9); // 9 decimals

    console.log(`watching snowdog seller at ${snowdogSeller} with balance ${formattedBalance}`);
    console.log(`provider url: ${providerUrl}`);
    console.log(`min sell liquidity: ${minSellLiquidity}`);
    console.log(`gas price: ${gasPrice}`);
    console.log(`snowdog seller: ${snowdogSeller}`);
    console.log(`recipient: ${recipient}`);

    if (snowdogSellerBalance.toString() === '0') {
        console.log('No snowdog balance, exiting');
        process.exit();
    }
});
