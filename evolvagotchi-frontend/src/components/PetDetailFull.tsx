import { Heart, Drumstick, Sparkles, RefreshCw, Zap, BookOpen, Gamepad2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { PetChat } from './PetChat'
import { EventNotification } from './EventNotification'
import EventHistory from './EventHistory'
import { NFTArtGenerator } from './NFTArtGenerator'
import { PetTimeline } from './PetTimeline'
import { HealthAdvisor } from './HealthAdvisor'
import { AchievementGallery } from './AchievementGallery'
import { AchievementToast } from './AchievementToast'
import { GameSelectionModal } from './GameSelectionModal'
import { MemoryGame } from './MemoryGame'
import { TicTacToe } from './TicTacToe'
import { RockPaperScissors } from './RockPaperScissors'
import { getPetResponse } from '../services/groqService'
import { triggerRandomEvent, shouldTriggerEvent, getEventChance } from '../services/eventService'
import type { GameEvent } from '../services/eventService'
import { addPendingEvent, applyEventEffects, clearPendingEvents, hasPendingEvents } from '../services/eventStorage'
import { logEvolution, logFeed, logPlay, logRandomEvent } from '../services/petHistory'
import { useAchievements } from '../hooks/useAchievements'

interface Pet {
  id: string
  name: string
  hunger: number
  happiness: number
  stage: number
  birthMs: number
  health?: number
  isDead?: boolean
}

interface PetDetailProps {
  pet: Pet
  octBalance: string
  onFeed: () => Promise<void>
  onPlay: () => Promise<void>
  onEvolve: () => Promise<void>
  isPending: boolean
  showEventHistory?: boolean
  setShowEventHistory?: (show: boolean) => void
  demoControls?: React.ReactNode
}

const EVOLUTION_STAGES = ['🥚 Egg', '🐣 Baby', '🦖 Teen', '🐲 Adult']
const STAGE_COLORS = ['#e0e0e0', '#ffeb3b', '#ff9800', '#f44336']
const FEED_COST = '0.001'
const REVIVAL_COST = '0.005'

export function PetDetail({ pet, octBalance, onFeed, onPlay, onEvolve, isPending, showEventHistory = false, setShowEventHistory, demoControls }: PetDetailProps) {
  // Extract just the last 8 characters of the ID for display (full ID is too long)
  const displayId = pet.id.slice(-8)
  const tokenId = parseInt(pet.id.slice(-8), 16) // Use hex conversion for unique but manageable number
  const achievements = useAchievements(tokenId, undefined)
  
  const [txStatus, setTxStatus] = useState('')
  const [petReaction, setPetReaction] = useState('')
  const [showReaction, setShowReaction] = useState(false)
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null)
  const [lastEventTime, setLastEventTime] = useState<number | null>(null)
  const [interactionCount, setInteractionCount] = useState(0)
  const [isGeneratingEvent, setIsGeneratingEvent] = useState(false)
  const [showPendingBanner, setShowPendingBanner] = useState(true)
  const [previousStage, setPreviousStage] = useState<number | null>(null)
  const [showEvolutionEffect, setShowEvolutionEffect] = useState(false)
  const [showTimeline, setShowTimeline] = useState(false)
  const [activeGame, setActiveGame] = useState<'selection' | 'memory' | 'tictactoe' | 'rps' | null>(null)

  const stats = {
    name: pet.name,
    age: Math.floor((Date.now() - pet.birthMs) / 1000),
    evolutionStage: pet.stage,
    happiness: pet.happiness,
    hunger: pet.hunger,
    health: pet.health || 100,
    isDead: pet.isDead || false
  }

  const hasPending = hasPendingEvents(tokenId)

  // Apply event effects to stats if there are pending events
  const statsWithEvents = hasPending ? {
    ...stats,
    ...applyEventEffects(
      { happiness: stats.happiness, hunger: stats.hunger, health: stats.health },
      tokenId
    ),
  } : stats

  const checkForRandomEvent = async () => {
    if (isGeneratingEvent) return
    
    if (!shouldTriggerEvent(lastEventTime)) return
    
    const chance = getEventChance(interactionCount)
    if (Math.random() > chance) return
    
    setIsGeneratingEvent(true)
    
    const event = await triggerRandomEvent({
      name: stats.name,
      evolutionStage: stats.evolutionStage,
      happiness: stats.happiness,
      hunger: stats.hunger,
      health: stats.health,
      age: stats.age,
    })
    
    addPendingEvent(tokenId, event)
    
    setCurrentEvent(event)
    setLastEventTime(Date.now())
    setIsGeneratingEvent(false)
  }

  const handleCloseEvent = () => {
    setCurrentEvent(null)
  }

  const handleTriggerEvent = async () => {
    if (isGeneratingEvent) return
    
    setIsGeneratingEvent(true)
    
    const event = await triggerRandomEvent({
      name: stats.name,
      evolutionStage: stats.evolutionStage,
      happiness: stats.happiness,
      hunger: stats.hunger,
      health: stats.health,
      age: stats.age,
    })
    
    addPendingEvent(tokenId, event)
    
    logRandomEvent(tokenId, stats.name, event.title, event.description, {
      happiness: stats.happiness,
      hunger: stats.hunger,
      health: stats.health,
    })
    
    setCurrentEvent(event)
    setLastEventTime(Date.now())
    setIsGeneratingEvent(false)
  }

  const handleFeedWithAI = async () => {
    try {
      await onFeed()
      
      achievements.recordFeed()
      
      logFeed(tokenId, stats.name, {
        happiness: stats.happiness,
        hunger: stats.hunger,
        health: stats.health,
      })
      
      const reaction = await getPetResponse({
        name: stats.name,
        evolutionStage: stats.evolutionStage,
        happiness: stats.happiness,
        hunger: stats.hunger,
        health: stats.health,
        age: stats.age,
        interaction: 'feed',
      })
      setPetReaction(reaction)
      setShowReaction(true)
      setTimeout(() => setShowReaction(false), 5000)
      
      setInteractionCount(prev => prev + 1)
      checkForRandomEvent()
    } catch (error) {
      console.error('Feed error:', error)
    }
  }

  const handlePlayWithAI = async () => {
    try {
      await onPlay()
      
      achievements.recordPlay()
      
      logPlay(tokenId, stats.name, {
        happiness: stats.happiness,
        hunger: stats.hunger,
        health: stats.health,
      })
      
      const reaction = await getPetResponse({
        name: stats.name,
        evolutionStage: stats.evolutionStage,
        happiness: stats.happiness,
        hunger: stats.hunger,
        health: stats.health,
        age: stats.age,
        interaction: 'play',
      })
      setPetReaction(reaction)
      setShowReaction(true)
      setTimeout(() => setShowReaction(false), 5000)
      
      setInteractionCount(prev => prev + 1)
      checkForRandomEvent()
    } catch (error) {
      console.error('Play error:', error)
    }
  }

  const handleGameWin = (gameName: string) => {
    localStorage.setItem('lastGameWon', gameName)
    setActiveGame(null)
    setTimeout(() => {
      handlePlayWithAI()
    }, 100)
  }

  const handleSyncEvents = () => {
    clearPendingEvents(tokenId)
    setTxStatus('✅ Events synced!')
    setTimeout(() => setTxStatus(''), 3000)
  }

  // First pet achievement
  useEffect(() => {
    achievements.recordFirstPet()
  }, [])

  // Evolution detection
  useEffect(() => {
    if (previousStage !== null && stats.evolutionStage > previousStage) {
      setShowEvolutionEffect(true)
      setTimeout(() => setShowEvolutionEffect(false), 3000)
      
      logEvolution(tokenId, stats.name, previousStage, stats.evolutionStage, EVOLUTION_STAGES[stats.evolutionStage])
      
      achievements.recordEvolution(stats.evolutionStage)
    }
    
    setPreviousStage(stats.evolutionStage)
  }, [stats.evolutionStage, previousStage])

  // Perfect stats detection
  useEffect(() => {
    if (stats.happiness === 100 && stats.hunger === 0 && stats.health === 100) {
      achievements.recordPerfectStats()
    }
  }, [stats.happiness, stats.hunger, stats.health])

  // Auto-hide pending banner
  useEffect(() => {
    if (hasPending && showPendingBanner) {
      const timer = setTimeout(() => {
        setShowPendingBanner(false)
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [hasPending, showPendingBanner])

  useEffect(() => {
    if (hasPending) {
      setShowPendingBanner(true)
    }
  }, [hasPending])

  const ageInMinutes = Math.floor(stats.age / 60)
  const ageInHours = Math.floor(ageInMinutes / 60)
  const displayAge = ageInHours > 0 
    ? `${ageInHours}h ${ageInMinutes % 60}m` 
    : `${ageInMinutes}m ${stats.age % 60}s`

  return (
    <div className="pet-detail">
      {hasPending && showPendingBanner && (
        <div className="sync-banner">
          <span>📊 You have pending events! Stats shown include event effects.</span>
          <div className="sync-banner-actions">
            <button className="btn btn-small" onClick={() => setShowEventHistory && setShowEventHistory(!showEventHistory)}>
              {showEventHistory ? 'Hide' : 'View'} Events
            </button>
            <button className="btn btn-small btn-close" onClick={() => setShowPendingBanner(false)}>
              ×
            </button>
          </div>
        </div>
      )}

      {txStatus && (
        <div className="notification">
          {txStatus}
        </div>
      )}

      {showReaction && petReaction && (
        <div className="pet-reaction">
          <div className="reaction-bubble">
            {petReaction}
          </div>
        </div>
      )}

      {currentEvent && (
        <EventNotification event={currentEvent} onClose={handleCloseEvent} />
      )}

      {achievements.newAchievements.map((achievementId, index) => (
        <AchievementToast
          key={`${achievementId}-${index}-${Date.now()}`}
          achievementId={achievementId}
          onClose={() => {}}
        />
      ))}

      {showEvolutionEffect && (
        <div className="evolution-effect">
          <div className="evolution-content">
            <Sparkles size={64} className="evolution-icon" />
            <h2>Evolution!</h2>
            <p>{stats.name} evolved to {EVOLUTION_STAGES[stats.evolutionStage]}!</p>
          </div>
        </div>
      )}

      {showEventHistory && (
        <div className="event-history-modal">
          <EventHistory 
            tokenId={tokenId} 
            onSync={handleSyncEvents}
            isSyncing={false}
            onClose={() => setShowEventHistory && setShowEventHistory(false)}
          />
        </div>
      )}

      {showTimeline && (
        <PetTimeline
          tokenId={tokenId}
          petName={stats.name}
          onClose={() => setShowTimeline(false)}
        />
      )}

      <div className="pet-and-chat-grid">
        <div className="pet-display">
          <div className="pet-card" style={{ borderColor: STAGE_COLORS[stats.evolutionStage] }}>
            <div className="pet-header">
              <h2 className="pet-name">{stats.name}</h2>
              <span className="pet-stage" style={{ background: STAGE_COLORS[stats.evolutionStage] }}>
                {EVOLUTION_STAGES[stats.evolutionStage]}
              </span>
            </div>

            <div className="pet-visual" data-stage={stats.isDead ? 'dead' : stats.evolutionStage}>
              <div className="stage-background"></div>
              <div className="stage-particles">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="particle"></div>
                ))}
              </div>
              <div className="pet-emoji">
                {stats.isDead ? '👻' : EVOLUTION_STAGES[stats.evolutionStage].split(' ')[0]}
              </div>
              {stats.isDead && (
                <div className="death-overlay">
                  <div className="death-content">
                    <h3>💀 Your Pet Has Died</h3>
                    <p>Your {stats.name} has passed away...</p>
                    <p className="revival-prompt">Pay {REVIVAL_COST} OCT to bring them back to life!</p>
                  </div>
                </div>
              )}
            </div>

            <div className="pet-stats">
              <div className="stat">
                <div className="stat-header">
                  <Heart size={16} color="#e91e63" />
                  <span>Health</span>
                  <span className="stat-value">{statsWithEvents.health}</span>
                </div>
                <div className="stat-bar">
                  <div className="stat-fill health" style={{ width: `${statsWithEvents.health}%` }} />
                </div>
              </div>

              <div className="stat">
                <div className="stat-header">
                  <Sparkles size={16} color="#ffc107" />
                  <span>Happiness</span>
                  <span className="stat-value">{statsWithEvents.happiness}</span>
                </div>
                <div className="stat-bar">
                  <div className="stat-fill happiness" style={{ width: `${statsWithEvents.happiness}%` }} />
                </div>
              </div>

              <div className="stat">
                <div className="stat-header">
                  <Drumstick size={16} color="#ff5722" />
                  <span>Hunger</span>
                  <span className="stat-value">{statsWithEvents.hunger}</span>
                </div>
                <div className="stat-bar">
                  <div className="stat-fill hunger" style={{ width: `${statsWithEvents.hunger}%` }} />
                </div>
              </div>
            </div>

            <div className="pet-info-grid">
              <div className="info-item">
                <span className="info-label">Age</span>
                <span className="info-value">{displayAge}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Token ID</span>
                <span className="info-value">#{displayId}</span>
              </div>
            </div>

          <AchievementGallery petTokenId={tokenId} compact={true} />
        </div>          <div className="actions">
            {stats.isDead ? (
              <button
                className="btn btn-action btn-revive"
                disabled={isPending}
                style={{ width: '100%', background: '#4caf50' }}
              >
                💚 Revive Pet ({REVIVAL_COST} OCT)
              </button>
            ) : (
              <>
                <button
                  className="btn btn-action btn-feed"
                  onClick={handleFeedWithAI}
                  disabled={isPending || parseFloat(octBalance) < parseFloat(FEED_COST)}
                >
                  <Drumstick size={20} />
                  Feed ({FEED_COST} OCT)
                </button>

                <button
                  className="btn btn-action btn-play"
                  onClick={() => setActiveGame('selection')}
                  disabled={isPending}
                >
                  <Gamepad2 size={20} />
                  Play Game (Free)
                </button>

                <button
                  className="btn btn-action btn-update"
                  onClick={async () => {
                    await onEvolve()
                    setInteractionCount(prev => prev + 1)
                  }}
                  disabled={isPending}
                >
                  <RefreshCw size={20} />
                  {hasPending ? 'Sync & Update' : 'Update Stats'}
                </button>

                <button
                  className="btn btn-action btn-event"
                  onClick={handleTriggerEvent}
                  disabled={isGeneratingEvent}
                >
                  <Zap size={20} />
                  {isGeneratingEvent ? 'Generating...' : 'Trigger Event'}
                </button>

                <button
                  className="btn btn-action btn-timeline"
                  onClick={() => setShowTimeline(true)}
                >
                  <BookOpen size={20} />
                  View Timeline
                </button>
              </>
            )}
          </div>

          <NFTArtGenerator
            tokenId={tokenId}
            petName={stats.name}
            evolutionStage={stats.evolutionStage}
            happiness={statsWithEvents.happiness}
            hunger={statsWithEvents.hunger}
            health={statsWithEvents.health}
          />
        </div>

        <div className="chat-container">
          <PetChat
            petName={stats.name}
            evolutionStage={stats.evolutionStage}
            happiness={statsWithEvents.happiness}
            hunger={statsWithEvents.hunger}
            health={statsWithEvents.health}
            age={stats.age}
          />
          
          <HealthAdvisor 
            stats={{
              health: statsWithEvents.health,
              happiness: statsWithEvents.happiness,
              hunger: statsWithEvents.hunger,
              age: stats.age,
              evolutionStage: stats.evolutionStage,
              isDead: stats.isDead,
            }}
            onAction={(action) => {
              if (action.includes('Feed')) {
                handleFeedWithAI()
              } else if (action.includes('Play')) {
                setActiveGame('selection')
              } else if (action.includes('Update') || action.includes('evolve')) {
                onEvolve()
              }
            }}
          />
        </div>
      </div>

      {demoControls}

      <div className="info-section">
        <h3>🤖 AI Agent Features</h3>
        <ul className="feature-list">
          <li>✅ Stats decay automatically over time</li>
          <li>✅ Pet evolves automatically when conditions are met</li>
          <li>✅ Health decreases if hunger gets too high</li>
          <li>✅ AI Health Advisor provides proactive guidance</li>
          <li>✅ Random events triggered by AI</li>
          <li>✅ Optimized for OneChain's high-speed blockchain!</li>
        </ul>
      </div>

      {activeGame === 'selection' && (
        <GameSelectionModal
          onGameSelect={setActiveGame}
          onClose={() => setActiveGame(null)}
        />
      )}

      {activeGame === 'memory' && (
        <MemoryGame
          onGameWin={(gameName) => handleGameWin(gameName)}
          onClose={() => setActiveGame(null)}
        />
      )}

      {activeGame === 'tictactoe' && (
        <TicTacToe
          onGameWin={(gameName) => handleGameWin(gameName)}
          onClose={() => setActiveGame(null)}
        />
      )}

      {activeGame === 'rps' && (
        <RockPaperScissors
          onGameWin={(gameName) => handleGameWin(gameName)}
          onClose={() => setActiveGame(null)}
        />
      )}
    </div>
  )
}
