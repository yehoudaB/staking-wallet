import { ethers } from "hardhat";

async function main() {


  const StakingContract = await ethers.getContractFactory("StakingContract");
  const stakingContract = await StakingContract. deploy();

  await stakingContract.deployed();

  console.log(
    `stakingContract contract deployed to ${stakingContract.address}`
  );
  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
