const hre = require("hardhat");
const config = require("../config/config.json");
const fs = require("fs");

async function main() {
  await hre.run('compile');
  const [ deployer ] = await hre.ethers.getSigners();

  // We get the contract to deploy
  const SnowdogSeller = await hre.ethers.getContractFactory("SnowdogSeller", deployer);
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
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
