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
import { addPendingEvent, applyEventEffects, clearPendingEvents, getPendingEvents, hasPendingEvents } from '../services/eventStorage'
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
const STAGE_DESCRIPTIONS = [
  'A mysterious egg waiting to hatch',
  'A playful baby full of energy',
  'A growing teen finding its way',
  'A majestic adult in its prime'
]
const FEED_COST = '0.001'
const REVIVAL_COST = '0.005'

export function PetDetail({ pet, octBalance, onFeed, onPlay, onEvolve, isPending, showEventHistory = false, setShowEventHistory, demoControls }: PetDetailProps) {
  const [message, setMessage] = useState('')
  
  const stageEmoji = EVOLUTION_STAGES[pet.stage]?.split(' ')[0] || '🥚'
  const stageName = EVOLUTION_STAGES[pet.stage]?.split(' ')[1] || 'Egg'
  const stageColor = STAGE_COLORS[pet.stage] || STAGE_COLORS[0]
  const stageDescription = STAGE_DESCRIPTIONS[pet.stage] || STAGE_DESCRIPTIONS[0]
  
  // Calculate age
  const ageMs = Date.now() - pet.birthMs
  const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24))
  const ageHours = Math.floor((ageMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  
  // Determine health status
  const getHealthStatus = () => {
    if (pet.happiness > 70 && pet.hunger < 30) return { emoji: '😊', text: 'Thriving!', color: '#4caf50' }
    if (pet.happiness > 40 && pet.hunger < 60) return { emoji: '😐', text: 'Doing okay', color: '#ff9800' }
    return { emoji: '😢', text: 'Needs care!', color: '#f44336' }
  }
  
  const healthStatus = getHealthStatus()
  
  // Calculate food level (inverse of hunger)
  const foodLevel = 100 - pet.hunger
  
  // Can evolve check
  const canEvolve = pet.stage < 3 && pet.happiness >= 70 && pet.hunger < 30
  
  const handleFeed = async () => {
    setMessage('🍖 Feeding your pet...')
    await onFeed()
    setMessage('✅ Your pet has been fed!')
    setTimeout(() => setMessage(''), 3000)
  }
  
  const handlePlay = async () => {
    setMessage('🎮 Playing with your pet...')
    await onPlay()
    setMessage('✅ Your pet had fun!')
    setTimeout(() => setMessage(''), 3000)
  }
  
  const handleEvolve = async () => {
    setMessage('✨ Evolution in progress...')
    await onEvolve()
    setMessage('🎉 Your pet evolved!')
    setTimeout(() => setMessage(''), 3000)
  }
  
  return (
    <div className="pet-detail">
      {/* Header */}
      <div className="pet-header" style={{ background: `linear-gradient(135deg, ${stageColor}22, ${stageColor}44)` }}>
        <div className="pet-avatar" style={{ fontSize: '120px' }}>
          {stageEmoji}
        </div>
        <div className="pet-info">
          <h2 className="pet-name">{pet.name}</h2>
          <div className="pet-stage-badge" style={{ backgroundColor: stageColor }}>
            {stageName}
          </div>
          <p className="pet-description">{stageDescription}</p>
          <div className="pet-age">
            📅 Age: {ageDays}d {ageHours}h
          </div>
          <div className="pet-health-status" style={{ color: healthStatus.color }}>
            {healthStatus.emoji} {healthStatus.text}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="pet-stats-grid">
        <div className="stat-card">
          <div className="stat-icon">😊</div>
          <div className="stat-info">
            <div className="stat-label">Happiness</div>
            <div className="stat-value">{pet.happiness}%</div>
            <div className="stat-bar">
              <div className="stat-fill" style={{ width: `${pet.happiness}%`, backgroundColor: '#4caf50' }}></div>
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🍖</div>
          <div className="stat-info">
            <div className="stat-label">Food</div>
            <div className="stat-value">{foodLevel}%</div>
            <div className="stat-bar">
              <div className="stat-fill" style={{ width: `${foodLevel}%`, backgroundColor: '#ff9800' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="pet-actions">
        <button
          onClick={handleFeed}
          disabled={isPending || parseFloat(octBalance) < 0.001}
          className="btn btn-primary"
        >
          <Drumstick size={20} />
          Feed (0.001 OCT)
        </button>
        
        <button
          onClick={handlePlay}
          disabled={isPending}
          className="btn btn-secondary"
        >
          <Heart size={20} />
          Play (Free)
        </button>
        
        {canEvolve && (
          <button
            onClick={handleEvolve}
            disabled={isPending}
            className="btn btn-success"
          >
            <Sparkles size={20} />
            Evolve! (Free)
          </button>
        )}
        
        {!canEvolve && pet.stage < 3 && (
          <button disabled className="btn btn-disabled">
            <RefreshCw size={20} />
            Evolution Locked
          </button>
        )}
      </div>

      {/* Message */}
      {message && (
        <div className="action-message">
          {message}
        </div>
      )}

      {/* Tips */}
      <div className="pet-tips">
        <h3>💡 Care Tips</h3>
        <ul>
          <li>Feed your pet when food drops below 50%</li>
          <li>Play regularly to keep happiness high</li>
          <li>Your pet evolves automatically when stats are good!</li>
          {canEvolve && <li className="tip-highlight">🎉 Your pet is ready to evolve!</li>}
        </ul>
      </div>

      {/* Balance Info */}
      <div className="balance-info">
        <span>Your OCT Balance:</span>
        <strong>{parseFloat(octBalance).toFixed(4)} OCT</strong>
      </div>
    </div>
  )
}
