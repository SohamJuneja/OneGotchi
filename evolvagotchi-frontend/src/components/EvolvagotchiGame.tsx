import { useState } from 'react'
import { ConnectButton } from '@mysten/dapp-kit'
import { ArrowLeft, BookOpen, Swords } from 'lucide-react'
import { PetList } from './PetList'
import { PetDetail } from './PetDetailFull'
import { EvolutionInfo } from './EvolutionInfo'
import { FightArena } from './FightArena'
import { useOnePet } from '../hooks/useOnePet'

const MINT_COST = '0.01' // 0.01 OCT for minting

export function EvolvagotchiGame() {
  const { pets, octBalance, isConnected, actions, loading, error, isPending } = useOnePet()
  
  const [petName, setPetName] = useState('')
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null)
  const [showMintForm, setShowMintForm] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [showEventHistory, setShowEventHistory] = useState(false)
  const [showFightArena, setShowFightArena] = useState(false)

  // Get selected pet data
  const selectedPet = pets.find(p => p.id === selectedPetId)

  const handleMint = async () => {
    if (!petName.trim()) {
      alert('Please enter a pet name!')
      return
    }
    
    const balance = parseFloat(octBalance)
    if (balance < 0.01) {
      alert('Insufficient OCT! You need at least 0.01 OCT to mint. Get some from the testnet faucet!')
      return
    }

    await actions.mintPet(petName)
    setPetName('')
    setShowMintForm(false)
  }

  if (!isConnected) {
    return (
      <div className="container">
        <div className="hero">
          <h1 className="title">🐾 OneGotchi</h1>
          <p className="subtitle">Your Autonomous On-Chain Pet</p>
          <p className="description">
            Powered by OneChain Move • Evolves automatically • Lives forever on-chain
          </p>
          <ConnectButton />
          <button className="btn btn-secondary" onClick={() => setShowInfo(true)}>
            <BookOpen size={20} />
            How It Works
          </button>
        </div>

        {showInfo && (
          <div className="modal-overlay" onClick={() => setShowInfo(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowInfo(false)}>×</button>
              <EvolutionInfo />
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="container">
      <header className="header">
        <h1 className="logo">🐾 OneGotchi</h1>
        <div className="header-actions">
          <button className="btn btn-small btn-info" onClick={() => setShowInfo(true)}>
            <BookOpen size={16} />
            Guide
          </button>
          <ConnectButton />
        </div>
      </header>

      <div className="main-content">
        {showFightArena ? (
          <FightArena 
            myPets={pets} 
            onBack={() => setShowFightArena(false)} 
          />
        ) : selectedPetId === null ? (
          <>
            {/* Pet List View */}
            <div className="left-panel">
              <div className="balance-card">
                <span>💰 OCT Balance:</span>
                <strong>{parseFloat(octBalance).toFixed(4)} OCT</strong>
              </div>

              <PetList 
                pets={pets}
                onSelectPet={setSelectedPetId}
                selectedPetId={selectedPetId}
              />

              <button 
                className="btn btn-primary btn-mint" 
                onClick={() => setShowMintForm(!showMintForm)}
                style={{ marginTop: '1rem', width: '100%' }}
              >
                {showMintForm ? 'Cancel' : '+ Mint New Pet'}
              </button>

              <button 
                className="btn btn-secondary" 
                onClick={() => setShowFightArena(true)}
                style={{ marginTop: '1rem', width: '100%' }}
                disabled={pets.length === 0}
              >
                <Swords size={20} />
                ⚔️ Fight Arena
              </button>

              {showMintForm && (
                <div className="mint-form">
                  <h3>🥚 Mint Your Pet</h3>
                  <p className="mint-cost">Cost: {MINT_COST} OCT</p>
                  
                  <input
                    type="text"
                    placeholder="Enter pet name (max 20 chars)"
                    value={petName}
                    onChange={(e) => setPetName(e.target.value.slice(0, 20))}
                    className="input"
                    maxLength={20}
                  />

                  {error && (
                    <div className="error-message">❌ {error}</div>
                  )}

                  <button
                    className="btn btn-primary"
                    onClick={handleMint}
                    disabled={loading || isPending || !petName.trim()}
                  >
                    {isPending ? '⏳ Confirm in Wallet...' : loading ? '⏳ Minting...' : `✨ Mint Pet (${MINT_COST} OCT)`}
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Pet Detail View */}
            <div className="detail-panel">
              <button className="btn btn-back" onClick={() => setSelectedPetId(null)}>
                <ArrowLeft size={16} />
                Back to Pets
              </button>
              
              {selectedPet && (
                <PetDetail 
                  pet={selectedPet}
                  octBalance={octBalance}
                  onFeed={async () => await actions.feedPet(selectedPetId!)}
                  onPlay={async () => await actions.playPet(selectedPetId!)}
                  onEvolve={async () => await actions.evolvePet(selectedPetId!)}
                  isPending={isPending || loading}
                  showEventHistory={showEventHistory}
                  setShowEventHistory={setShowEventHistory}
                />
              )}
            </div>
          </>
        )}
      </div>

      {showInfo && (
        <div className="modal-overlay" onClick={() => setShowInfo(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowInfo(false)}>×</button>
            <EvolutionInfo />
          </div>
        </div>
      )}
    </div>
  )
}