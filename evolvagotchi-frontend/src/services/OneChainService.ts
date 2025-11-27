import { SuiClient } from '@mysten/sui.js/client';
import { Transaction } from '@mysten/sui/transactions';
import { bcs } from '@mysten/sui/bcs';
import { ONECHAIN_CONFIG } from '../config/onechain';

// Use proxy in both development and production to avoid CORS issues
const rpcUrl = import.meta.env.DEV 
  ? '/onechain-rpc' 
  : '/api/onechain-rpc';

// Initialize Client
export const oneClient = new SuiClient({ url: rpcUrl });

export const OneChainService = {
  
  // --- READ FUNCTIONS ---

  // Get all pets owned by the user
  getPets: async (address: string) => {
    const objects = await oneClient.getOwnedObjects({
      owner: address,
      filter: { StructType: `${ONECHAIN_CONFIG.PACKAGE_ID}::game::Pet` },
      options: { showContent: true }
    });

    return objects.data.map((obj: any) => {
      const fields = obj.data.content.fields;
      return {
        id: obj.data.objectId,
        name: fields.name,
        hunger: parseInt(fields.hunger),
        happiness: parseInt(fields.happiness),
        stage: fields.stage,
        birthMs: parseInt(fields.birth_ms)
      };
    });
  },

  // Get OCT Balance
  getOCTBalance: async (address: string) => {
    const balance = await oneClient.getBalance({
      owner: address,
      coinType: '0x2::oct::OCT'
    });
    return balance.totalBalance;
  },

  // --- WRITE FUNCTIONS (Transactions) ---

  // 1. Mint a Pet (Costs 0.01 OCT)
  mintPet: async (name: string, userAddress: string) => {
    console.log("Building mintPet transaction...");
    console.log("Name:", name);
    console.log("User:", userAddress);
    console.log("Package:", ONECHAIN_CONFIG.PACKAGE_ID);
    console.log("Clock:", ONECHAIN_CONFIG.CLOCK);
    
    const tx = new Transaction();
    
    // Set sender first
    tx.setSender(userAddress);
    
    // Get gas price from network
    try {
      const gasPrice = await oneClient.getReferenceGasPrice();
      console.log("Gas price:", gasPrice);
      tx.setGasPrice(Number(gasPrice));
    } catch (error) {
      console.warn("Could not fetch gas price, using default");
    }
    
    // Set gas budget (0.1 OCT)
    tx.setGasBudget(100_000_000);
    
    const price = 10_000_000; // 0.01 OCT in MIST
    
    // Split coins from gas
    const [paymentCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(price)]);
    
    // Encode string as vector<u8> using BCS
    const nameBytes = bcs.string().serialize(name).toBytes();
    console.log("Name BCS bytes:", nameBytes);
    
    // Call mint function
    tx.moveCall({
      target: `${ONECHAIN_CONFIG.PACKAGE_ID}::game::mint_pet`,
      arguments: [
        tx.pure(nameBytes),  // Pass BCS-encoded bytes
        paymentCoin,
        tx.object(ONECHAIN_CONFIG.CLOCK)
      ]
    });
    
    console.log("Transaction built successfully");
    return tx;
  },

  // 2. Feed Pet (Costs 0.001 OCT)
  feedPet: async (petId: string, userAddress: string) => {
    console.log("Building feedPet transaction...");
    
    const tx = new Transaction();
    tx.setSender(userAddress);
    
    try {
      const gasPrice = await oneClient.getReferenceGasPrice();
      tx.setGasPrice(Number(gasPrice));
    } catch (error) {
      console.warn("Could not fetch gas price");
    }
    
    tx.setGasBudget(50_000_000);
    
    const price = 1_000_000; // 0.001 OCT
    const [paymentCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(price)]);

    tx.moveCall({
      target: `${ONECHAIN_CONFIG.PACKAGE_ID}::game::feed`,
      arguments: [
        tx.object(petId),
        paymentCoin,
        tx.object(ONECHAIN_CONFIG.CLOCK)
      ]
    });

    return tx;
  },

  // 3. Play (Free)
  play: async (petId: string, userAddress: string) => {
    console.log("Building play transaction...");
    
    const tx = new Transaction();
    tx.setSender(userAddress);
    
    try {
      const gasPrice = await oneClient.getReferenceGasPrice();
      tx.setGasPrice(Number(gasPrice));
    } catch (error) {
      console.warn("Could not fetch gas price");
    }
    
    tx.setGasBudget(30_000_000);
    
    tx.moveCall({
      target: `${ONECHAIN_CONFIG.PACKAGE_ID}::game::play`,
      arguments: [
        tx.object(petId),
        tx.object(ONECHAIN_CONFIG.CLOCK)
      ]
    });
    
    return tx;
  },
  
  // 4. Evolve (Free)
  evolve: async (petId: string, userAddress: string) => {
    console.log("Building evolve transaction...");
    
    const tx = new Transaction();
    tx.setSender(userAddress);
    
    try {
      const gasPrice = await oneClient.getReferenceGasPrice();
      tx.setGasPrice(Number(gasPrice));
    } catch (error) {
      console.warn("Could not fetch gas price");
    }
    
    tx.setGasBudget(30_000_000);
    
    tx.moveCall({
      target: `${ONECHAIN_CONFIG.PACKAGE_ID}::game::evolve`,
      arguments: [
        tx.object(petId),
        tx.object(ONECHAIN_CONFIG.CLOCK)
      ]
    });
    
    return tx;
  }
};
