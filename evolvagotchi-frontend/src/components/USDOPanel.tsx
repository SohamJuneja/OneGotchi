import { useState } from 'react';
import { Coins, Sparkles } from 'lucide-react';
import { useUSDO, PRICES } from '../hooks/useUSDO';
import { formatEther } from 'viem';

export function USDOPanel() {
  const { balanceFormatted, claimFaucet, isConfirming } = useUSDO();
  const [isClaiming, setIsClaiming] = useState(false);

  const handleClaim = async () => {
    setIsClaiming(true);
    try {
      await claimFaucet();
      // Success handled by hook's auto-refetch
    } catch (error: any) {
      console.error('Faucet claim failed:', error);
      if (error.message?.includes('rejected')) {
        alert('Transaction was rejected');
      } else {
        alert('Failed to claim USDO. Please try again.');
      }
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="usdo-panel">
      <div className="usdo-header">
        <Coins size={24} />
        <h3>USDO Wallet</h3>
      </div>
      
      <div className="usdo-balance">
        <div className="balance-label">Your Balance</div>
        <div className="balance-amount">
          <Sparkles size={20} className="balance-icon" />
          {parseFloat(balanceFormatted).toFixed(2)} USDO
        </div>
      </div>

      <button 
        onClick={handleClaim} 
        disabled={isClaiming || isConfirming}
        className="btn btn-primary usdo-faucet-btn"
      >
        {isClaiming || isConfirming ? '⏳ Claiming...' : '🎁 Get 100 Free USDO'}
      </button>

      <div className="usdo-info">
        <h4>💡 USDO is required for:</h4>
        <ul>
          <li>🐣 Minting pets: {formatEther(PRICES.MINT)} USDO</li>
          <li>🍖 Feeding pets: {formatEther(PRICES.FEED)} USDO</li>
          <li>💚 Reviving pets: {formatEther(PRICES.REVIVAL)} USDO</li>
        </ul>
        <p className="usdo-note">
          ℹ️ First time? You'll need to approve USDO spending before each action type.
        </p>
      </div>
    </div>
  );
}
