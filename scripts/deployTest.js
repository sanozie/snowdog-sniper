const hre = require("hardhat");
const { ethers } = require("hardhat");
const config = require("../config/config.json");
const fs = require("fs");

const routerAbi = require("../abi/IUniswapV2Router02.json");

const WAVAX = "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7";

async function main() {
  await hre.run('compile');
  const [ deployer ] = await ethers.getSigners();

  // We get the contract to deploy
  const SnowdogSeller = await ethers.getContractFactory("SnowdogSeller");
  const snowdogSeller = await SnowdogSeller.deploy(
    config.snowdog,
    config.mim,
    config.snowdogMimLp,
    config.router,
    config.recipient,
  );
  await snowdogSeller.deployed();

  console.log("SnowdogSeller deployed to:", snowdogSeller.address);
  config.snowdogSeller = snowdogSeller.address;
  fs.writeFileSync("./config/config.json", JSON.stringify(config, null, 4), "utf-8");
  const joeRouter = new ethers.Contract(config.router, routerAbi, deployer);
  await joeRouter.swapExactAVAXForTokens(
      1, // min return
      [WAVAX, config.mim, config.snowdog], // buy snowdog with avax
      snowdogSeller.address, // send all the snowdog to random address
      '1000000000000', // deadline (timestamp seconds)
      { value: ethers.utils.parseEther("10") }
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
