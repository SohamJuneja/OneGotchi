# 🐲 OneGotchi - AI-Powered Virtual Pets on OneChain

![OneChain](https://img.shields.io/badge/Blockchain-OneChain-blue)
![Move](https://img.shields.io/badge/Smart_Contracts-Move-orange)
![React](https://img.shields.io/badge/Frontend-React%2BTypeScript-61DAFB)
![AI](https://img.shields.io/badge/AI-GROQ-purple)

> **Raise, evolve, and bond with your AI-powered virtual pet living on OneChain blockchain**

---

## 🌟 What is OneGotchi?

**OneGotchi** is a next-generation blockchain-based virtual pet game that combines:
- 🤖 **AI-powered personalities** - Your pet thinks, talks, and responds uniquely using GROQ AI
- ⛓️ **Autonomous blockchain logic** - Stats decay in real-time based on block time
- 🎨 **Dynamic NFT evolution** - Pets evolve from Egg → Baby → Teen → Adult
- 🎲 **Random events** - Unpredictable occurrences affect your pet's journey
- 🏆 **Achievement system** - Unlock 10 achievements with rarity tiers
- 🎮 **Mini-games** - Play Memory, TicTacToe, and RockPaperScissors

Built specifically for **OneChain** - The high-performance Layer-1 blockchain.

---

## ✨ Key Features

### 🎮 Core Gameplay
- **Mint Your Pet** - Start with an egg NFT (0.01 OCT)
- **Feed & Play** - Keep hunger low (0.001 OCT per feed)
- **Evolution System** - Watch your pet grow through 4 stages
- **Death & Revival** - Pay 0.005 OCT to revive neglected pets
- **Autonomous Stats** - Hunger increases automatically (~78 seconds per point)

### 🤖 AI Integration
- **GROQ-powered Chat** - Have real conversations with your pet
- **Dynamic Personalities** - Each evolution stage has unique traits (Egg is mysterious, Baby is innocent, Teen is moody, Adult is wise)
- **Context-aware Responses** - Pet reacts based on hunger, happiness, health, and recent actions
- **Health Advisor** - AI predicts dangers and suggests optimal actions with urgency levels

### 🎨 Advanced Features
- **Achievement System** - 10 unlockable achievements (Common to Legendary rarity)
- **Pet Timeline** - Complete history with milestones and stat changes
- **NFT Art Generator** - Capture pet cards and save to IPFS via Pinata
- **Event System** - Random events with stat effects (found treat, got sick, etc.)
- **Event History** - Track pending changes before syncing to blockchain
- **Mini-Games** - Boost happiness by playing interactive games

---

## 🛠️ Tech Stack

### Blockchain Layer
- **OneChain** - Layer-1 blockchain with Move VM
- **Move** - Secure smart contract language
- **OCT Token** - Native token for all in-game payments

### Frontend
- **React + TypeScript** - Modern, type-safe UI
- **Sui dApp Kit** - Wallet connection and blockchain interaction
- **Vite** - Lightning-fast build tool
- **Custom Styling** - OneChain blue (#3b82f6) and gold (#fbbf24) theme

### AI & Services
- **GROQ AI** - Fast LLaMA 3.3 70B model for pet chat and events
- **Pinata IPFS** - Decentralized NFT art storage
- **LocalStorage** - Achievement and event persistence

---

## 📦 Project Structure

```
OneGotchi/
├── onegotchi-move/          # Move smart contracts
│   └── one_pet/
│       ├── sources/         # OnePet.move contract
│       └── Move.toml        # Dependencies
├── evolvagotchi-frontend/   # React frontend
│   ├── src/
│   │   ├── components/      # UI components (PetDetailFull, PetChat, etc.)
│   │   ├── hooks/          # Custom React hooks (useOnePet, useAchievements)
│   │   ├── services/       # AI, IPFS, events, health advisor
│   │   └── config/         # Configuration
│   └── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- Sui CLI installed
- OneChain-compatible wallet
- OCT tokens for transactions

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/SohamJuneja/OneGotchi.git
cd OneGotchi
```

2. **Install frontend dependencies**
```bash
cd evolvagotchi-frontend
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
```

Edit `.env` and add your API keys:
```env
VITE_GROQ_API_KEY=your_groq_api_key_here
VITE_PINATA_JWT=your_pinata_jwt_here
```

Get API keys:
- GROQ: https://console.groq.com
- Pinata: https://app.pinata.cloud

4. **Start development server**
```bash
npm run dev
```

Visit `http://localhost:5173` to play!

---

## 🎮 How to Play

### 1. Connect Wallet
- Click "Connect Wallet" button
- Approve connection in your Sui-compatible wallet
- Ensure you're on OneChain network

### 2. Mint Your Pet
- Click "Mint New Pet"
- Enter a unique name (2-20 characters)
- Pay **0.01 OCT** to mint
- Your egg NFT is created!

### 3. Care for Your Pet
- **Feed** - Pay 0.001 OCT to reduce hunger by 20 points
- **Play** - Free action to increase happiness by 15 points
- **Chat** - Talk to your AI-powered pet
- **Update Stats** - Sync latest blockchain state

### 4. Watch It Evolve
- **Egg (Stage 0)** - Mysterious, communicates with vibrations (~1 hour)
- **Baby (Stage 1)** - Innocent and playful, needs love (~4 hours total)
- **Teen (Stage 2)** - Energetic and dramatic, discovering personality (~13 hours total)
- **Adult (Stage 3)** - Wise and loyal, your lifelong companion

### 5. Avoid Death
- Keep hunger below 80 to prevent health loss
- When hunger > 80, health decreases by (hunger - 80) / 5 per update
- If health reaches 0, your pet dies
- Pay **0.005 OCT** to revive with 50% stats restored

---

## 🎯 Game Mechanics

### Stats System
- **Happiness** (0-100) - Increases with play (+15), decreases slowly over time
- **Hunger** (0-100) - Increases automatically (~1 point per 78 seconds)
- **Health** (0-100) - Decreases when hunger > 80

### Evolution Requirements
| Stage | Min Age (blocks) | Happiness | Health | Approx Time |
|-------|-----------------|-----------|--------|-------------|
| Baby  | 25,000         | Any       | Any    | ~1.1 hours  |
| Teen  | 100,000        | ≥60       | Any    | ~4.3 hours  |
| Adult | 300,000        | ≥60       | ≥80    | ~13 hours   |

### Costs (OCT)
- **Mint Pet**: 0.01 OCT
- **Feed Pet**: 0.001 OCT per feed
- **Play**: Free
- **Revive**: 0.005 OCT

---

## 🏆 Achievement System

Unlock 10 unique achievements as you play:

| Achievement | Description | Rarity | Icon |
|-------------|-------------|--------|------|
| First Steps | Mint your first pet | Common | 🥚 |
| Caretaker | Feed for the first time | Common | 🍖 |
| Playmate | Play for the first time | Common | 🎮 |
| Evolution Master | Reach Adult stage | Rare | ✨ |
| Streak Master | Feed 10 times in a row | Uncommon | 🔥 |
| Active Player | Play 10 games | Uncommon | 🎯 |
| Perfect Care | Achieve 100/100/0 stats | Epic | 💎 |
| Resurrection | Revive a dead pet | Rare | 👻 |
| Legendary Trainer | Own 5 Adult pets | Legendary | 🐲 |
| Event Champion | Experience 50 events | Epic | 🎲 |

---

## 🤖 AI Features

### Pet Chat
- Real-time conversations powered by GROQ
- Pet personality evolves with each stage
- Responds to feeding, playing, and current stats
- Remembers last game played

### Health Advisor
- **Critical warnings** - Death imminent, feed immediately
- **Warnings** - High hunger will damage health soon
- **Info** - Evolution ready, hunger rising, etc.
- **Good** - All stats healthy
- Auto-refreshes every 30 seconds

### Random Events
- **Positive** - Found treat (+10 happiness), made friend (+5 happiness)
- **Negative** - Got sick (-10 health), feeling lonely (-10 happiness)
- **Neutral** - Watched clouds, played with toy
- Trigger randomly during interactions

---

## 🎮 Mini-Games

### Memory Game
- Flip cards to find matching pairs
- 8 cards (4 pairs)
- Improves pet happiness on win

### TicTacToe
- Classic 3x3 grid game
- Play against AI
- Strategic gameplay

### Rock Paper Scissors
- Best of 3 rounds
- Quick and fun
- Instant results

All games boost happiness by 15 points when won!

---

## 🔧 Development

### Build Move Contracts
```bash
cd onegotchi-move/one_pet
sui move build
```

### Deploy to OneChain
```bash
sui client publish --gas-budget 100000000
```

### Run Tests
```bash
cd onegotchi-move/one_pet
sui move test
```

### Build Frontend
```bash
cd evolvagotchi-frontend
npm run build
```

---

## 🌐 OneChain Network Info

| Parameter | Value |
|-----------|-------|
| **Network** | OneChain Testnet |
| **Type** | Move VM (Sui-based) |
| **Currency** | OCT |

---

## 📱 Frontend Components

### Main Components
- **EvolvagotchiGame** - Main game container and routing
- **PetDetailFull** - Complete pet interaction UI with all features
- **PetList** - Display all owned pets

### Feature Components
- **PetChat** - AI-powered chat interface with GROQ
- **HealthAdvisor** - Proactive health monitoring with predictions
- **EventHistory** - Track pending blockchain events
- **EventNotification** - Display random events with animations
- **AchievementGallery** - View all achievements (earned + locked)
- **AchievementToast** - Real-time achievement unlock notifications
- **PetTimeline** - Complete pet history with milestones
- **NFTArtGenerator** - Capture pet cards and save to IPFS

### Game Components
- **GameSelectionModal** - Choose which mini-game to play
- **MemoryGame** - Card matching game
- **TicTacToe** - Classic strategy game
- **RockPaperScissors** - Quick reflex game

---

## 🔐 Security

- All smart contracts written in Move for memory safety
- No private keys stored in frontend
- API keys in environment variables only
- IPFS for decentralized NFT storage

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repo
2. Create a feature branch
3. Commit your changes
4. Push and open a PR

---

## 📄 License

MIT License

---

## 🙏 Acknowledgments

- **OneChain** - High-performance Layer-1 blockchain
- **Sui/Move** - Secure smart contract framework
- **GROQ** - Fast AI inference
- **Pinata** - IPFS infrastructure

---

## 📞 Contact

- **Developer**: [@SohamJuneja](https://github.com/SohamJuneja)
- **Project**: [OneGotchi](https://github.com/SohamJuneja/OneGotchi)

---

**Made with ❤️ for OneChain**
