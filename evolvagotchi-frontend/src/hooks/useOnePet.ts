import { useState, useEffect, useCallback, useRef } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { OneChainService } from '../services/OneChainService';

export const useOnePet = () => {
  const account = useCurrentAccount();
  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction();
  
  const [pets, setPets] = useState<any[]>([]);
  const [octBalance, setOctBalance] = useState<string>("0");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localPending, setLocalPending] = useState(false);
  const timeoutRef = useRef<number | null>(null);

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

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // --- 2. TRANSACTION HANDLER ---
  const executeTx = async (txBuilder: () => Promise<any> | any, successMessage: string) => {
    if (!account) {
      setError("Wallet not connected!");
      return;
    }

    if (isPending || localPending) {
      console.log("Transaction already pending, please wait...");
      return;
    }

    setError(null);
    setLocalPending(true);

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set timeout to reset pending state after 30 seconds
    timeoutRef.current = setTimeout(() => {
      console.log("Transaction timeout - resetting state");
      setLocalPending(false);
      setError("Transaction timeout. Please try again.");
    }, 30000);

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
            setLocalPending(false);
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
            // C. Wait a moment for indexing, then refresh
            setTimeout(refreshData, 1000); 
          },
          onError: (err) => {
            console.error("Transaction failed:", err);
            console.error("Error details:", JSON.stringify(err, null, 2));
            setError(`Transaction failed: ${err.message || 'Unknown error'}`);
            setLocalPending(false);
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
          }
        }
      );
    } catch (err: any) {
      console.error("Build failed:", err);
      console.error("Build error details:", err.stack);
      setError(err.message || "Failed to build transaction");
      setLocalPending(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
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
    isPending: isPending || localPending,
    refreshData,
    actions: {
      mintPet,
      feedPet,
      playPet,
      evolvePet
    }
  };
};
