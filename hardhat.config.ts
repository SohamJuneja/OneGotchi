import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // OneChain Testnet configuration
    onechain: {
      url: "https://testnet-rpc.oneledger.network",
      chainId: 311752642,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 1000000000, // 1 gwei
    },
    // Local Hardhat network for testing
    hardhat: {
      chainId: 31337,
    },
  },
  etherscan: {
    apiKey: {
      onechain: "abc", // Placeholder - OneChain may not need verification yet
    },
    customChains: [
      {
        network: "onechain",
        chainId: 311752642,
        urls: {
          apiURL: "https://testnet-explorer.oneledger.network/api",
          browserURL: "https://testnet-explorer.oneledger.network"
        }
      }
    ]
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS ? true : false,
    currency: "USD",
  },
};

export default config;