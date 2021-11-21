// Importing required libraries
require("dotenv").config();
const cron = require("node-cron");
const express = require("express");
const ethers = require("ethers");

const providerUrl = "https://api.avax.network/ext/bc/C/rpc";
const privateKey = process.env.PRIVATE_KEY;
const provider = new ethers.providers.JsonRpcProvider(providerUrl);
const wallet = new ethers.wallet(privateKey, provider);
  
const app = express(); // Initializing app
  
// Creating a cron job which runs on every 10 second
cron.schedule("*/5 * * * * *", function() {
    console.log("running a task every 10 second");
});

async function checkIfBuybackOccured() {
}
  
app.listen(3000);