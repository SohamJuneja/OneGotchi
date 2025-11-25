import { useState, useEffect, useCallback } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { OneChainService } from '../services/OneChainService';
import { SuiClient } from '@mysten/sui.js/client';
import { ONECHAIN_CONFIG } from '../config/onechain';

// Initialize Client for reading data
const client = new SuiClient({ url: ONECHAIN_CONFIG.rpcUrl });

export const useOnePet = () => {
  const account = useCurrentAccount();
  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction();
  
  const [pets, setPets] = useState<any[]>([]);
  const [octBalance, setOctBalance] = useState<string>("0");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Log wallet connection status
  useEffect(() => {
    console.log('Wallet connected:', !!account);
    console.log('Account address:', account?.address);
    console.log('Transaction pending:', isPending);
  }, [account, isPending]);

  // --- 1. DATA FETCHING ---
  const refreshData = useCallback(async () => {
    if (!account) return;
    
    setLoading(true);
    try {
      // Fetch Pets and Balance in parallel
      const [fetchedPets, balance] = await Promise.all([
        OneChainService.getPets(account.address),
        OneChainService.getOCTBalance(account.address)
      ]);
      
      setPets(fetchedPets);
      
      // Convert 9-decimal OCT to human readable string
      const humanBalance = (parseInt(balance) / 1_000_000_000).toFixed(3);
      setOctBalance(humanBalance);
      
      setError(null);
    } catch (err: any) {
      console.error("Error fetching data:", err);
      // Don't show error to user if it's just "no pets found"
    } finally {
      setLoading(false);
    }
  }, [account]);

  // Auto-refresh when account changes
  useEffect(() => {
    refreshData();
    
    // Optional: Poll every 5 seconds for updates
    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  }, [refreshData]);

  // --- 2. TRANSACTION HANDLER ---
  const executeTx = async (txBuilder: () => Promise<any> | any, successMessage: string) => {
    if (!account) {
      setError("Wallet not connected!");
      return;
    }

    if (isPending) {
      console.log("Transaction already pending, please wait...");
      return;
    }

    setError(null);

    try {
      // A. Build the Transaction Block (using our Service)
      console.log("Building transaction...");
      const tx = await txBuilder();
      console.log("Transaction built:", tx);
      console.log("Transaction JSON:", JSON.stringify(tx, null, 2));

      // B. Send to Wallet
      console.log("Sending to wallet for signature...");
      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            console.log(successMessage, result);
            setError(null);
            // C. Wait a moment for indexing, then refresh
            setTimeout(refreshData, 1000); 
          },
          onError: (err) => {
            console.error("Transaction failed:", err);
            console.error("Error details:", JSON.stringify(err, null, 2));
            setError(`Transaction failed: ${err.message || 'Unknown error'}`);
          }
        }
      );
    } catch (err: any) {
      console.error("Build failed:", err);
      console.error("Build error details:", err.stack);
      setError(err.message || "Failed to build transaction");
    }
  };

  // --- 3. ACTIONS (Connect these to your Buttons) ---

  const mintPet = (name: string) => {
    executeTx(
      () => OneChainService.mintPet(name, account!.address),
      "Pet Minted!"
    );
  };

  const feedPet = (petId: string) => {
    executeTx(
      () => OneChainService.feedPet(petId, account!.address),
      "Pet Fed!"
    );
  };

  const playPet = (petId: string) => {
    executeTx(
      () => OneChainService.play(petId, account!.address),
      "Played with Pet!"
    );
  };

  const evolvePet = (petId: string) => {
    executeTx(
      () => OneChainService.evolve(petId, account!.address),
      "Evolution Triggered!"
    );
  };

  return {
    pets,
    octBalance,
    loading,
    error,
    isConnected: !!account,
    isPending,
    refreshData,
    actions: {
      mintPet,
      feedPet,
      playPet,
      evolvePet
    }
  };
};
