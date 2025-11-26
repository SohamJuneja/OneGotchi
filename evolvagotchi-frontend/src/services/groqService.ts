import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true, // For demo purposes - move to backend in production
})

export interface PetContext {
  name: string
  evolutionStage: number
  happiness: number
  hunger: number
  health: number
  age: number
  interaction: 'feed' | 'play' | 'greet' | 'evolve' | 'chat'
  userMessage?: string
}

const STAGE_NAMES = ['Egg', 'Baby', 'Teen', 'Adult']

const PERSONALITY_PROMPTS = {
  0: `You are a mysterious egg, about to hatch. You communicate with soft vibrations and gentle pulses of warmth. Keep responses very short (1-2 sentences) and mystical.`,
  
  1: `You are a baby Evolvagotchi - innocent, excitable, and full of wonder. You see everything for the first time and express emotions openly with simple words. Use emojis like 🥺, 😊, 🎉. Keep responses SHORT (1-2 sentences) and childlike.`,
  
  2: `You are a teenage Evolvagotchi - curious, energetic, but sometimes moody. You're discovering your personality and can be dramatic or sarcastic when neglected, but loving when cared for. Use emojis like 😎, 😤, 💪. Keep responses 2-3 sentences.`,
  
  3: `You are a fully evolved adult Evolvagotchi - wise, loyal, and protective of your trainer. You speak with maturity and gratitude, remembering all the care you've received. Use emojis like 🐲, ✨, 💎. Keep responses 2-3 sentences but thoughtful.`,
}

function buildPrompt(context: PetContext): string {
  const { name, evolutionStage, happiness, hunger, health, interaction, userMessage } = context
  const stage = STAGE_NAMES[evolutionStage]
  const personalityBase = PERSONALITY_PROMPTS[evolutionStage as keyof typeof PERSONALITY_PROMPTS]

  // Check if a game was recently played
  const lastGame = localStorage.getItem('lastGameWon') || null
  
  let situationContext = ''
  
  // Analyze pet's current state
  if (hunger > 80) {
    situationContext = 'You are VERY HUNGRY and feel weak. '
  } else if (hunger > 50) {
    situationContext = 'You are getting hungry. '
  }

  if (happiness < 20) {
    situationContext += 'You feel very sad and neglected. '
  } else if (happiness < 50) {
    situationContext += 'You are feeling a bit down. '
  } else if (happiness > 80) {
    situationContext += 'You are very happy and energetic! '
  }

  if (health < 30) {
    situationContext += 'You feel sick and unwell. '
  }

  // Interaction-specific context
  let interactionContext = ''
  switch (interaction) {
    case 'feed':
      interactionContext = 'Your trainer just fed you. React with gratitude and describe how you feel. '
      break
    case 'play':
      if (lastGame) {
        interactionContext = `Your trainer just played a game of **${lastGame}** with you! React with joy and talk about how much fun you had playing that specific game. `
      } else {
        interactionContext = 'Your trainer just played with you. React with joy and excitement. '
      }
      break
    case 'greet':
      interactionContext = 'Your trainer just opened your profile. Greet them warmly and let them know how you are feeling. '
      break
    case 'evolve':
      interactionContext = `You just evolved from ${STAGE_NAMES[evolutionStage - 1]} to ${stage}! Express your excitement and transformation. This is a HUGE moment! `
      break
    case 'chat':
      interactionContext = `Your trainer said: "${userMessage}". Respond naturally to what they said. `
      break
  }

  const fullPrompt = `${personalityBase}

Your name is ${name}. You are currently a ${stage} stage Evolvagotchi.

Current stats:
- Happiness: ${happiness}/100
- Hunger: ${hunger}/100  
- Health: ${health}/100

${situationContext}
${interactionContext}

IMPORTANT: 
- Stay in character as a ${stage}
- Keep response SHORT and emotional
- Be authentic to your current feelings (happy, sad, hungry, etc.)
- NO explanations, just respond as the pet would
- Use 1-2 emojis maximum

Respond now:`

  return fullPrompt
}

export async function getPetResponse(context: PetContext): Promise<string> {
  try {
    const prompt = buildPrompt(context)
    
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an AI-powered virtual pet in a blockchain game. Respond naturally and emotionally based on your current state and evolution stage. Keep responses concise and in-character.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile', // Fast Groq model
      temperature: 0.9, // High creativity for personality
      max_tokens: 100,
    })

    const response = completion.choices[0]?.message?.content || 'Pet is thinking...'
    return response.trim()
  } catch (error) {
    console.error('Groq API error:', error)
    return '💭 *Pet is deep in thought...*'
  }
}

// Fallback responses if API fails
export const FALLBACK_RESPONSES = {
  feed: {
    0: '✨ *The egg glows warmly* ✨',
    1: 'Yummy yummy! 😋 Thank you!',
    2: 'Finally! I was starving! 😤',
    3: 'Your care sustains me. Thank you, trainer. 🙏',
  },
  play: {
    0: '✨ *The egg wiggles happily* ✨',
    1: 'Yay! This is so fun! 🎉',
    2: 'Now this is what I am talking about! 💪',
    3: 'It is good to bond with you, old friend. ✨',
  },
  greet: {
    0: '✨ *A presence stirs within* ✨',
    1: 'Hi hi! I missed you! 🥺',
    2: 'Oh, you are finally here! 😎',
    3: 'Welcome back, trainer. I have been waiting. 🐲',
  },
}

// ===== BATTLE COMMENTARY =====

export interface BattleContext {
  attackerName: string
  attackerStage: number
  attackerHappiness: number
  attackerHunger: number
  defenderName: string
  defenderStage: number
  defenderHappiness: number
  defenderHunger: number
  damage: number
  defenderHealthRemaining: number
  isFirstAttack?: boolean
  isFinalBlow?: boolean
}

export async function getBattleCommentary(context: BattleContext): Promise<string> {
  try {
    const {
      attackerName,
      attackerStage,
      attackerHappiness,
      attackerHunger,
      defenderName,
      defenderStage,
      damage,
      defenderHealthRemaining,
      isFirstAttack,
      isFinalBlow
    } = context

    const attackerStageNames = ['Egg', 'Baby', 'Teen', 'Adult']
    const defenderStageNames = ['Egg', 'Baby', 'Teen', 'Adult']

    let situationContext = ''
    
    if (isFirstAttack) {
      situationContext = 'This is the opening move of the battle! '
    } else if (isFinalBlow) {
      situationContext = 'This is the FINAL BLOW that wins the battle! '
    } else if (defenderHealthRemaining < 20) {
      situationContext = `${defenderName} is barely hanging on! `
    } else if (damage > 25) {
      situationContext = 'That was a CRITICAL HIT! '
    } else if (damage < 10) {
      situationContext = 'The attack barely made a dent... '
    }

    // Attacker condition effects
    if (attackerHunger > 70) {
      situationContext += `${attackerName} looks hungry and weak. `
    } else if (attackerHappiness > 80) {
      situationContext += `${attackerName} is brimming with confidence! `
    }

    const prompt = `You are a charismatic battle announcer for a pet fighting arena. Generate exciting, dramatic commentary for this attack.

Battle Action:
- Attacker: ${attackerName} (${attackerStageNames[attackerStage]} stage)
- Defender: ${defenderName} (${defenderStageNames[defenderStage]} stage)
- Damage dealt: ${damage} HP
- Defender's remaining health: ${defenderHealthRemaining} HP

Context: ${situationContext}

Generate ONE dramatic sentence of commentary (15-25 words) that describes the action. Include emojis. Make it exciting, like a sports announcer!

Examples:
- "⚡ ${attackerName} strikes with lightning speed, dealing ${damage} damage! ${defenderName} reels back! 💥"
- "🔥 A devastating blow from ${attackerName}! ${defenderName} takes ${damage} damage and stumbles! 😱"
- "💪 ${attackerName} channels all their energy into a powerful attack dealing ${damage} damage! ⚔️"

Your commentary:`

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an exciting battle announcer. Generate dramatic, concise commentary for pet battles. Keep it short and punchy!',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 1.1, // High creativity for varied commentary
      max_tokens: 60,
    })

    const response = completion.choices[0]?.message?.content || `${attackerName} attacks ${defenderName} for ${damage} damage! 💥`
    return response.trim()
  } catch (error) {
    console.error('Groq battle commentary error:', error)
    // Fallback to simple commentary
    return `💥 ${context.attackerName} strikes ${context.defenderName} for ${context.damage} damage!`
  }
}