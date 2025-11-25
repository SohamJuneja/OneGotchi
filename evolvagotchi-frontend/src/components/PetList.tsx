interface Pet {
  id: string
  name: string
  hunger: number
  happiness: number
  stage: number
  birthMs: number
}

interface PetListProps {
  pets: Pet[]
  onSelectPet: (petId: string) => void
  selectedPetId: string | null
}

const EVOLUTION_STAGES = ['🥚 Egg', '🐣 Baby', '🦖 Teen', '🐲 Adult']
const STAGE_COLORS = ['#e0e0e0', '#ffeb3b', '#ff9800', '#f44336']

export function PetList({ pets, onSelectPet, selectedPetId }: PetListProps) {
  if (pets.length === 0) {
    return (
      <div className="empty-pets">
        <p>You don't have any pets yet!</p>
        <p>Mint your first OneGotchi to get started 🥚</p>
      </div>
    )
  }

  return (
    <div className="pet-list">
      <h2>Your Pets ({pets.length})</h2>
      <div className="pet-grid">
        {pets.map((pet) => (
          <PetCard
            key={pet.id}
            pet={pet}
            isSelected={selectedPetId === pet.id}
            onSelect={() => onSelectPet(pet.id)}
          />
        ))}
      </div>
    </div>
  )
}

interface PetCardProps {
  pet: Pet
  isSelected: boolean
  onSelect: () => void
}

function PetCard({ pet, isSelected, onSelect }: PetCardProps) {
  const stageEmoji = EVOLUTION_STAGES[pet.stage] || '🥚 Egg'
  const stageColor = STAGE_COLORS[pet.stage] || STAGE_COLORS[0]
  
  // Calculate age in days
  const ageMs = Date.now() - pet.birthMs
  const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24))
  
  return (
    <div 
      className={`pet-card-mini ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
      style={{ borderColor: stageColor }}
    >
      <div className="pet-card-emoji">
        {stageEmoji.split(' ')[0]}
      </div>
      <div className="pet-card-info">
        <h3>{pet.name}</h3>
        <span className="pet-card-stage" style={{ background: stageColor }}>
          {stageEmoji.split(' ')[1] || 'Egg'}
        </span>
        <div className="pet-card-stats">
          <span>😊 {pet.happiness}%</span>
          <span>🍖 {100 - pet.hunger}%</span>
          <span>📅 {ageDays}d</span>
        </div>
      </div>
    </div>
  )
}