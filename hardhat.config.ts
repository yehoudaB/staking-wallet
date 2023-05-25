import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";



  
  let API_URL = process.env["API_URL"] ? process.env["API_URL"] : "";
  let PRIVATE_KEY = process.env["PRIVATE_KEY"] ? process.env["PRIVATE_KEY"] : "";

const config: HardhatUserConfig = {
  solidity: "0.8.18",
  paths: {
    sources: "./contracts", 
    artifacts: "./src/artifacts",
  },
  defaultNetwork: "hardhat",
  networks : {
    hardhat: {
      chainId: 1337
    },
   /*  goerli: {
      url: "https://goerli.infura.io/v3/3f0f0b4b4b5c4b6b8b7a6a5a4a3a2a1a",
     // accounts: [`0x${process.env.PRIVATE_KEY}`]
    },
    sepolia: {
      chainId: 11155111,
      url: `https://eth-sepolia.g.alchemy.com/v2/${API_URL}`, // this is my alchemy api key for sepolia network
      accounts: [`0x${PRIVATE_KEY}`]// this is my seploia account private key
     
    }, */
  },
};

export default config;

