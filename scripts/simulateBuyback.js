const hre = require("hardhat");
const { ethers } = require("hardhat");
const config = require("../config/config.json");
const routerAbi = require("../abi/IUniswapV2Router02.json");
const erc20Abi = require("../abi/IERC20.json");

const WAVAX = "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7";

async function main() {
  await hre.run('compile');
  const [ deployer ] = await ethers.getSigners();
  const joeRouter = new ethers.Contract(config.router, routerAbi, deployer);

  const mimContract = new ethers.Contract(config.mim, erc20Abi, deployer);
  const prevMimLpAmount = await mimContract.balanceOf(config.snowdogMimLp);
  console.log(`previous LP MIM balance - ${ethers.utils.formatEther(prevMimLpAmount)}`);
  // purchase MIM
  await joeRouter.swapExactAVAXForTokens(
      1, // min return
      [WAVAX, config.mim, config.snowdog], // buy snowdog with avax
      WAVAX, // send all the snowdog to random address
      '1000000000000', // deadline (timestamp seconds)
      { value: ethers.utils.parseEther("1000000") }
  );
  const postMimLpAmount = await mimContract.balanceOf(config.snowdogMimLp);
  console.log(`post LP MIM balance - ${ethers.utils.formatEther(postMimLpAmount)}`);
  console.log(`bought back ${ethers.utils.formatEther(postMimLpAmount.sub(prevMimLpAmount))} MIM`);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

