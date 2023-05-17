import { ethers } from "hardhat";

async function main() {


  const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
  const multiSigWallet = await MultiSigWallet. deploy(['0x3e122A3dB43d225DD5BFFD929AD4176ce69117E0', 
  '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  '0xC5e0B6E472dDE70eCEfFa4c568Bd52f2A7a1632A']
  , 2);

  await multiSigWallet.deployed();

  console.log(
    `MultiSigWalletV2 contract deployed to ${multiSigWallet.address}`
  );
  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
