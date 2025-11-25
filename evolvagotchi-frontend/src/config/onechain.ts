import { getFullnodeUrl } from '@mysten/sui.js/client';

export const ONECHAIN_CONFIG = {
  // Network Details
  network: 'testnet',
  rpcUrl: 'https://rpc-testnet.onelabs.cc:443',
  
  // Your Deployed IDs (OCT-based deployment)
  PACKAGE_ID: '0xb4465ce5a3efe8dc0960241b9ffebf06e9fa2d8120737199c099a3f35004f206',
  
  // System Objects - Full address format required
  CLOCK: '0x0000000000000000000000000000000000000000000000000000000000000006',
  
  // Module Names
  MODULES: {
    GAME: 'game'
  }
};
