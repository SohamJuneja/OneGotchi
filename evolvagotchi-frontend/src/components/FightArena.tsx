import { useState, useEffect } from 'react'
import { oneClient } from '../services/OneChainService'
import { ONECHAIN_CONFIG } from '../config/onechain'
import './FightArena.css'

interface Pet {
  id: string
  name: string
  hunger: number
  happiness: number
  stage: number
  birthMs: number
  owner?: string
}

interface BattleLog {
  round: number
  message: string
  pet1Health: number
  pet2Health: number
}

export function FightArena({ myPets, onBack }: { myPets: Pet[], onBack: () => void }) {
  const [opponentAddress, setOpponentAddress] = useState('')
  const [opponentPets, setOpponentPets] = useState<Pet[]>([])
  const [selectedMyPet, setSelectedMyPet] = useState<Pet | null>(null)
  const [selectedOpponentPet, setSelectedOpponentPet] = useState<Pet | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Battle state
  const [battleActive, setBattleActive] = useState(false)
  const [battleLog, setBattleLog] = useState<BattleLog[]>([])
  const [myPetHealth, setMyPetHealth] = useState(100)
  const [opponentPetHealth, setOpponentPetHealth] = useState(100)
  const [currentTurn, setCurrentTurn] = useState<'mine' | 'opponent'>('mine')
  const [battleFinished, setBattleFinished] = useState(false)
  const [winner, setWinner] = useState<'mine' | 'opponent' | null>(null)

  const loadOpponentPets = async () => {
    if (!opponentAddress) {
      setError("Please enter a valid opponent address")
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const objects = await oneClient.getOwnedObjects({
        owner: opponentAddress,
        filter: { StructType: `${ONECHAIN_CONFIG.PACKAGE_ID}::game::Pet` },
        options: { showContent: true }
      })

      const pets = objects.data.map((obj: any) => {
        const fields = obj.data.content.fields
        return {
          id: obj.data.objectId,
          name: fields.name,
          hunger: parseInt(fields.hunger),
          happiness: parseInt(fields.happiness),
          stage: fields.stage,
          birthMs: parseInt(fields.birth_ms),
          owner: opponentAddress
        }
      })
      
      if (pets.length === 0) {
        setError("This address has no pets!")
      } else {
        setOpponentPets(pets)
      }
    } catch (err: any) {
      console.error(err)
      setError("Failed to load opponent's pets. Check the address.")
    } finally {
      setLoading(false)
    }
  }

  const calculateAttackPower = (pet: Pet): number => {
    // Attack = Base(20) + (100-hunger)/2 + happiness/4 + stage*5
    const base = 20
    const hungerBonus = Math.floor((100 - pet.hunger) / 2)
    const happyBonus = Math.floor(pet.happiness / 4)
    const stageBonus = pet.stage * 5
    return base + hungerBonus + happyBonus + stageBonus
  }

  const calculateDefensePower = (pet: Pet): number => {
    // Defense = Base(10) + happiness/5 + stage*3
    const base = 10
    const happyBonus = Math.floor(pet.happiness / 5)
    const stageBonus = pet.stage * 3
    return base + happyBonus + stageBonus
  }

  const calculateDamage = (attacker: Pet, defender: Pet): number => {
    const attackPower = calculateAttackPower(attacker)
    const defensePower = calculateDefensePower(defender)
    const rawDamage = attackPower - defensePower
    
    // Minimum 5 damage, but cap based on attacker's stage for balance
    const minDamage = 5
    const maxDamageByStage = [20, 30, 50, 80] // Egg, Baby, Teen, Adult max damage
    const maxDamage = maxDamageByStage[attacker.stage] || 20
    
    const damage = Math.max(minDamage, Math.min(rawDamage, maxDamage))
    
    console.log('💥 Damage Calculation:', {
      attacker: attacker.name,
      attackPower,
      defender: defender.name,
      defensePower,
      rawDamage,
      maxDamage,
      finalDamage: damage
    })
    
    return damage
  }

  const startBattle = () => {
    if (!selectedMyPet || !selectedOpponentPet) {
      setError("Select both pets to fight!")
      return
    }
    
    setBattleActive(true)
    setBattleLog([{
      round: 0,
      message: `⚔️ Battle Start! ${selectedMyPet.name} vs ${selectedOpponentPet.name}!`,
      pet1Health: 100,
      pet2Health: 100
    }])
    setMyPetHealth(100)
    setOpponentPetHealth(100)
    setCurrentTurn('mine')
    setBattleFinished(false)
    setWinner(null)
  }

  const executeTurn = async () => {
    if (!selectedMyPet || !selectedOpponentPet || battleFinished) return
    
    const attacker = currentTurn === 'mine' ? selectedMyPet : selectedOpponentPet
    const defender = currentTurn === 'mine' ? selectedOpponentPet : selectedMyPet
    
    const damage = calculateDamage(attacker, defender)
    const attackPower = calculateAttackPower(attacker)
    const defensePower = calculateDefensePower(defender)
    
    // Debug logging
    console.log('🎯 BATTLE TURN:', {
      attacker: attacker.name,
      attackerStage: attacker.stage,
      attackerHunger: attacker.hunger,
      attackerHappiness: attacker.happiness,
      attackPower,
      defender: defender.name,
      defenderStage: defender.stage,
      defensePower,
      damage
    })
    
    let newMyHealth = myPetHealth
    let newOpponentHealth = opponentPetHealth
    
    if (currentTurn === 'mine') {
      newOpponentHealth = Math.max(0, opponentPetHealth - damage)
      setOpponentPetHealth(newOpponentHealth)
    } else {
      newMyHealth = Math.max(0, myPetHealth - damage)
      setMyPetHealth(newMyHealth)
    }
    
    const round = battleLog.length
    const isFinalBlow = newMyHealth <= 0 || newOpponentHealth <= 0
    
    // Create battle message with ACTUAL damage
    let battleMessage = `⚔️ ${attacker.name} attacks ${defender.name}!\n`
    battleMessage += `💥 ${attackPower} ATK - ${defensePower} DEF = ${damage} damage dealt!`
    
    if (isFinalBlow) {
      battleMessage += `\n🏆 KNOCKOUT! ${defender.name} is defeated!`
    }
    
    setBattleLog([...battleLog, {
      round,
      message: battleMessage,
      pet1Health: newMyHealth,
      pet2Health: newOpponentHealth
    }])
    
    // Check for winner
    if (newMyHealth <= 0) {
      setBattleFinished(true)
      setWinner('opponent')
      setTimeout(() => {
        setBattleLog(prev => [...prev, {
          round: round + 1,
          message: `💀 ${selectedMyPet.name} has been defeated! ${selectedOpponentPet.name} wins! 🏆`,
          pet1Health: 0,
          pet2Health: newOpponentHealth
        }])
      }, 500)
    } else if (newOpponentHealth <= 0) {
      setBattleFinished(true)
      setWinner('mine')
      setTimeout(() => {
        setBattleLog(prev => [...prev, {
          round: round + 1,
          message: `🎉 Victory! ${selectedMyPet.name} defeated ${selectedOpponentPet.name}! 🥇`,
          pet1Health: newMyHealth,
          pet2Health: 0
        }])
      }, 500)
    } else {
      setCurrentTurn(currentTurn === 'mine' ? 'opponent' : 'mine')
    }
  }

  // Auto-execute opponent turn
  useEffect(() => {
    if (battleActive && currentTurn === 'opponent' && !battleFinished) {
      const timer = setTimeout(() => {
        executeTurn()
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [currentTurn, battleActive, battleFinished])

  const getPetStageEmoji = (stage: number) => {
    return ['🥚', '🐣', '🐥', '🦅'][stage] || '🐣'
  }

  if (battleActive) {
    return (
      <div className="fight-arena">
        <button className="btn btn-back" onClick={() => {
          setBattleActive(false)
          setSelectedMyPet(null)
          setSelectedOpponentPet(null)
          setBattleLog([])
        }}>
          ← Back to Selection
        </button>

        <div className="battle-arena">
          <div className="battle-header">
            <h2 className="battle-title">⚔️ BATTLE ARENA ⚔️</h2>
            <div className="turn-indicator">
              {battleFinished ? (
                winner === 'mine' ? '🏆 VICTORY!' : '💀 DEFEATED'
              ) : currentTurn === 'mine' ? (
                '⚡ Your Turn - Click Attack!'
              ) : (
                '⏳ Opponent Attacking...'
              )}
            </div>
          </div>

          <div className="battle-field">
            {/* My Pet */}
            <div className={`fighter ${currentTurn === 'mine' && !battleFinished ? 'attacking' : ''} ${currentTurn === 'opponent' && !battleFinished ? 'defending' : ''}`}>
              <div className="fighter-avatar">{getPetStageEmoji(selectedMyPet!.stage)}</div>
              <div className="fighter-name">{selectedMyPet!.name}</div>
              
              <div className="health-bar-container">
                <div className="health-label">
                  <span>❤️ Health</span>
                  <span className="health-number">{myPetHealth}/100</span>
                </div>
                <div className="health-bar">
                  <div 
                    className={`health-fill ${myPetHealth < 30 ? 'critical' : myPetHealth < 50 ? 'low' : ''}`}
                    style={{ width: `${myPetHealth}%` }}
                  />
                </div>
              </div>

              <div className="current-stats">
                <div className="stat-item">
                  <div className="stat-icon">⚔️</div>
                  <div className="stat-value-small" style={{ color: '#ef4444' }}>{calculateAttackPower(selectedMyPet!)}</div>
                  <div className="stat-label-small">Attack</div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon">🛡️</div>
                  <div className="stat-value-small" style={{ color: '#3b82f6' }}>{calculateDefensePower(selectedMyPet!)}</div>
                  <div className="stat-label-small">Defense</div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon">😊</div>
                  <div className="stat-value-small">{selectedMyPet!.happiness}</div>
                  <div className="stat-label-small">Happy</div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon">🍖</div>
                  <div className="stat-value-small">{100 - selectedMyPet!.hunger}</div>
                  <div className="stat-label-small">Fed</div>
                </div>
              </div>
            </div>

            <div className="vs-divider">
              <div className="vs-circle">VS</div>
            </div>

            {/* Opponent Pet */}
            <div className={`fighter ${currentTurn === 'opponent' && !battleFinished ? 'attacking' : ''} ${currentTurn === 'mine' && !battleFinished ? 'defending' : ''}`}>
              <div className="fighter-avatar">{getPetStageEmoji(selectedOpponentPet!.stage)}</div>
              <div className="fighter-name">{selectedOpponentPet!.name}</div>
              
              <div className="health-bar-container">
                <div className="health-label">
                  <span>❤️ Health</span>
                  <span className="health-number">{opponentPetHealth}/100</span>
                </div>
                <div className="health-bar">
                  <div 
                    className={`health-fill ${opponentPetHealth < 30 ? 'critical' : opponentPetHealth < 50 ? 'low' : ''}`}
                    style={{ width: `${opponentPetHealth}%` }}
                  />
                </div>
              </div>

              <div className="current-stats">
                <div className="stat-item">
                  <div className="stat-icon">⚔️</div>
                  <div className="stat-value-small" style={{ color: '#ef4444' }}>{calculateAttackPower(selectedOpponentPet!)}</div>
                  <div className="stat-label-small">Attack</div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon">🛡️</div>
                  <div className="stat-value-small" style={{ color: '#3b82f6' }}>{calculateDefensePower(selectedOpponentPet!)}</div>
                  <div className="stat-label-small">Defense</div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon">😊</div>
                  <div className="stat-value-small">{selectedOpponentPet!.happiness}</div>
                  <div className="stat-label-small">Happy</div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon">🍖</div>
                  <div className="stat-value-small">{100 - selectedOpponentPet!.hunger}</div>
                  <div className="stat-label-small">Fed</div>
                </div>
              </div>
            </div>
          </div>

          {/* Battle Log */}
          <div className="battle-log">
            <h3>⚔️ BATTLE COMMENTARY</h3>
            {battleLog.map((log, i) => (
              <div key={i} className="log-entry">
                <div className="log-round">
                  ⚡ Round {log.round}
                </div>
                <div className="log-message">{log.message}</div>
                <div className="log-health">
                  <span>{selectedMyPet!.name}: {log.pet1Health} HP</span>
                  <span>{selectedOpponentPet!.name}: {log.pet2Health} HP</span>
                </div>
              </div>
            ))}
          </div>

          {/* Action Button */}
          {!battleFinished && currentTurn === 'mine' && (
            <button className="btn-battle" onClick={executeTurn}>
              ⚔️ ATTACK!
            </button>
          )}

          {battleFinished && (
            <div className="battle-results">
              <div className="results-icon">
                {winner === 'mine' ? '🏆' : '💀'}
              </div>
              {winner === 'mine' && (
                <>
                  <div className="results-title">VICTORY!</div>
                  <div className="results-message">
                    {selectedMyPet!.name} has proven superior in battle!
                  </div>
                  <div className="results-message" style={{ color: '#fbbf24', fontSize: '20px', marginTop: '16px' }}>
                    🏅 You earned a Battle Medal NFT!
                  </div>
                </>
              )}
              {winner === 'opponent' && (
                <>
                  <div className="results-title">DEFEATED</div>
                  <div className="results-message">
                    Better luck next time! Train your pet and try again.
                  </div>
                </>
              )}
              <button className="btn-new-battle" onClick={() => {
                setBattleActive(false)
                setSelectedMyPet(null)
                setSelectedOpponentPet(null)
                setBattleLog([])
              }}>
                ⚔️ NEW BATTLE
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="fight-arena">
      <button className="btn btn-back" onClick={onBack}>
        ← Back to Game
      </button>

      <div className="arena-header">
        <h1 className="arena-title">⚔️ FIGHT ARENA ⚔️</h1>
        <p className="arena-subtitle">Challenge other pets to epic battles!</p>
        <div style={{ fontSize: '11px', color: '#999', marginTop: '8px' }}>
          v2.0 - Balanced Damage System ✅
        </div>
      </div>

      {/* Opponent Finder */}
      <div className="opponent-finder">
        <h3>🔍 Find Your Opponent</h3>
        <div className="address-input-group">
          <input
            type="text"
            placeholder="Enter opponent's wallet address (0x...)"
            value={opponentAddress}
            onChange={(e) => setOpponentAddress(e.target.value)}
            className="address-input"
          />
          <button 
            className="btn-find" 
            onClick={loadOpponentPets}
            disabled={loading || !opponentAddress}
          >
            {loading ? '⏳' : '🔍'} {loading ? 'Searching...' : 'Find Pets'}
          </button>
        </div>
        {error && <div className="error-box">⚠️ {error}</div>}
      </div>

      {/* Pet Selection */}
      {(myPets.length > 0 || opponentPets.length > 0) && (
        <div className="pet-selection">
          {/* My Pets */}
          <div className="selection-panel my-pets">
            <h3>👤 YOUR PET</h3>
            <div className="pet-cards-grid">
              {myPets.map(pet => (
                <div
                  key={pet.id}
                  className={`pet-battle-card ${selectedMyPet?.id === pet.id ? 'selected' : ''}`}
                  onClick={() => setSelectedMyPet(pet)}
                >
                  <div className="pet-card-emoji">{getPetStageEmoji(pet.stage)}</div>
                  <div className="pet-card-name">{pet.name}</div>
                  <div className="pet-card-stats">
                    <div className="stat-row">
                      <span className="stat-label">😊 Happy</span>
                      <span className="stat-number">{pet.happiness}</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">🍖 Fed</span>
                      <span className="stat-number">{100 - pet.hunger}</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">⚔️ Attack</span>
                      <span className="stat-number">{calculateAttackPower(pet)}</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">🛡️ Defense</span>
                      <span className="stat-number">{calculateDefensePower(pet)}</span>
                    </div>
                  </div>
                  <div className={`stage-badge stage-${pet.stage}`}>
                    {['EGG', 'BABY', 'TEEN', 'ADULT'][pet.stage] || 'UNKNOWN'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* VS Divider */}
          <div className="vs-divider">
            <div className="vs-circle">VS</div>
            {selectedMyPet && selectedOpponentPet && (
              <button className="btn-battle" onClick={startBattle}>
                ⚔️ START BATTLE
              </button>
            )}
          </div>

          {/* Opponent Pets */}
          <div className="selection-panel opponent-pets">
            <h3>👥 OPPONENT PET</h3>
            {opponentPets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔍</div>
                <p>Search for an opponent first</p>
              </div>
            ) : (
              <div className="pet-cards-grid">
                {opponentPets.map(pet => (
                  <div
                    key={pet.id}
                    className={`pet-battle-card opponent ${selectedOpponentPet?.id === pet.id ? 'selected' : ''}`}
                    onClick={() => setSelectedOpponentPet(pet)}
                  >
                    <div className="pet-card-emoji">{getPetStageEmoji(pet.stage)}</div>
                    <div className="pet-card-name">{pet.name}</div>
                    <div className="pet-card-stats">
                      <div className="stat-row">
                        <span className="stat-label">😊 Happy</span>
                        <span className="stat-number">{pet.happiness}</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-label">🍖 Fed</span>
                        <span className="stat-number">{100 - pet.hunger}</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-label">⭐ Power</span>
                        <span className="stat-number">{Math.floor(20 + (100 - pet.hunger) / 2 + pet.happiness / 4 + pet.stage * 5)}</span>
                      </div>
                    </div>
                    <div className={`stage-badge stage-${pet.stage}`}>
                      {['EGG', 'BABY', 'TEEN', 'ADULT'][pet.stage] || 'UNKNOWN'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
