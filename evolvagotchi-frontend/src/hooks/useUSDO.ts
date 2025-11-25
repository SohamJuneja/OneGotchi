import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther, type Address } from 'viem';
import { useState, useEffect } from 'react';

// Import contract ABIs
import MockUSDOABI from '../contracts/MockUSDO.json';
import OnePetABI from '../contracts/OnePet.json';

// Contract addresses - these will be updated after deployment
const USDO_ADDRESS = (MockUSDOABI as any).address as Address;
const ONEPET_ADDRESS = (OnePetABI as any).address as Address;

// Prices from contract (in USDO with 18 decimals)
export const PRICES = {
  MINT: parseEther('10'),    // 10 USDO
  FEED: parseEther('1'),     // 1 USDO
  REVIVAL: parseEther('5'),  // 5 USDO
};

export function useUSDO() {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [lastTxHash, setLastTxHash] = useState<`0x${string}` | undefined>();

  // Read USDO balance
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: USDO_ADDRESS,
    abi: MockUSDOABI.abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Read USDO allowance for OnePet contract
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: USDO_ADDRESS,
    abi: MockUSDOABI.abi,
    functionName: 'allowance',
    args: address ? [address, ONEPET_ADDRESS] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: lastTxHash,
  });

  // Auto-refetch after confirmation
  useEffect(() => {
    if (isConfirmed) {
      refetchBalance();
      refetchAllowance();
      setLastTxHash(undefined);
    }
  }, [isConfirmed, refetchBalance, refetchAllowance]);

  // Get free USDO from faucet
  const claimFaucet = async () => {
    try {
      const hash = await writeContractAsync({
        address: USDO_ADDRESS,
        abi: MockUSDOABI.abi,
        functionName: 'faucet',
      });
      setLastTxHash(hash);
      return hash;
    } catch (error) {
      console.error('Faucet claim failed:', error);
      throw error;
    }
  };

  // Approve USDO spending
  const approve = async (amount: bigint) => {
    try {
      const hash = await writeContractAsync({
        address: USDO_ADDRESS,
        abi: MockUSDOABI.abi,
        functionName: 'approve',
        args: [ONEPET_ADDRESS, amount],
      });
      setLastTxHash(hash);
      return hash;
    } catch (error) {
      console.error('Approval failed:', error);
      throw error;
    }
  };

  // Check if user has enough USDO balance
  const hasEnoughBalance = (requiredAmount: bigint): boolean => {
    if (!balance) return false;
    return (balance as bigint) >= requiredAmount;
  };

  // Check if user has enough allowance
  const hasEnoughAllowance = (requiredAmount: bigint): boolean => {
    if (!allowance) return false;
    return (allowance as bigint) >= requiredAmount;
  };

  // Helper to get approval status for a specific action
  const needsApproval = (requiredAmount: bigint): boolean => {
    return !hasEnoughAllowance(requiredAmount);
  };

  return {
    // Raw values
    balance: balance as bigint | undefined,
    allowance: allowance as bigint | undefined,
    
    // Formatted values
    balanceFormatted: balance ? formatEther(balance as bigint) : '0',
    allowanceFormatted: allowance ? formatEther(allowance as bigint) : '0',
    
    // Actions
    claimFaucet,
    approve,
    refetchBalance,
    refetchAllowance,
    
    // Checks
    hasEnoughBalance,
    hasEnoughAllowance,
    needsApproval,
    
    // Transaction status
    isConfirming,
    isConfirmed,
    
    // Contract addresses
    USDO_ADDRESS,
    ONEPET_ADDRESS,
  };
}
