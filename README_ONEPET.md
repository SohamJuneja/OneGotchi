# OnePet - OneChain Hackathon Edition 🎮

> **Built for OneHack 2025** - A decentralized Tamagotchi-style NFT game with USDO payments on OneChain

## 🌟 What is OnePet?

OnePet is a blockchain-based virtual pet game where your NFT pets are living, evolving entities that require care and attention. Built specifically for OneChain's Layer-1 infrastructure, OnePet integrates with the **USDO stablecoin** for all in-game transactions.

### Key Features

- 🪙 **USDO Integration**: All payments (minting, feeding, reviving) use OneChain's USDO stablecoin
- 🔄 **Evolution System**: Pets evolve from Egg → Baby → Teen → Adult based on age and care
- 💚 **Dynamic Stats**: Hunger, happiness, and health decay over time - keep your pet alive!
- 🎮 **Interactive Gameplay**: Feed, play, and care for your pet to keep it happy
- 🎨 **AI-Generated NFT Art**: Unique artwork generated based on your pet's stats
- 💀 **Death & Revival**: Neglected pets can die but can be revived for a fee
- 🏆 **Achievement System**: Earn badges for milestones and accomplishments

## 🏗️ Architecture

### Smart Contracts

1. **OnePet.sol** - Main game contract with USDO payment integration
   - ERC-721 NFT standard
   - USDO token payments for all actions
   - Autonomous stat decay system
   - Evolution mechanics
   
2. **MockUSDO.sol** - Test USDO token for development
   - ERC-20 standard
   - Faucet function for free test tokens
   - Used on OneChain Testnet

3. **AchievementBadge.sol** - Achievement system (ERC-1155)

### Tech Stack

**Blockchain:**
- Solidity ^0.8.20
- Hardhat
- OpenZeppelin Contracts
- OneChain Testnet (Chain ID: 311752642)

**Frontend:**
- React + TypeScript
- Vite
- Wagmi + Viem
- TailwindCSS (customized for OneChain theme)
- GROQ AI for pet chat

## 🚀 Getting Started

### Prerequisites

- Node.js v16+
- MetaMask or compatible Web3 wallet
- Some test ONE tokens (for gas)

### Installation

```bash
# Clone the repository
git clone <your-repo>
cd onepet

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your PRIVATE_KEY
```

### Deployment

```bash
# Compile contracts
npx hardhat compile

# Deploy to OneChain Testnet
npx hardhat run scripts/deployOnePet.ts --network onechain

# The script will output contract addresses - save these!
```

### Frontend Setup

```bash
cd evolvagotchi-frontend

# Install dependencies
npm install

# Update contract addresses in src/contracts/
# Copy the ABI files from ../artifacts/contracts/

# Start development server
npm run dev
```

### Getting Test USDO

1. Deploy the contracts (MockUSDO included)
2. Call the `faucet()` function on MockUSDO to get 100 free test USDO
3. Or ask the contract owner to mint you some tokens

## 🎮 How to Play

### 1. Get USDO Tokens
```javascript
// Call faucet to get 100 test USDO
await mockUSDO.faucet();
```

### 2. Approve USDO Spending
```javascript
// Approve OnePet contract to spend your USDO
await mockUSDO.approve(onePetAddress, ethers.parseEther("100"));
```

### 3. Mint Your Pet (10 USDO)
```javascript
await onePet.mint("MyPetName");
```

### 4. Care for Your Pet

- **Feed** (1 USDO): Reduces hunger, increases happiness
- **Play** (Free): Increases happiness
- **Update State**: Manually trigger stat decay calculation

### 5. Evolution Stages

| Stage | Age Requirement | Conditions |
|-------|----------------|------------|
| Egg → Baby | ~1.1 hours | Automatic |
| Baby → Teen | ~4.3 hours | Happiness ≥ 60 |
| Teen → Adult | ~13 hours | Happiness ≥ 60, Health ≥ 80 |

### 6. Death & Revival

- Pets die when health reaches 0
- Revival costs 5 USDO
- Revived pets have reduced stats

## 💰 USDO Economics

| Action | Cost (USDO) |
|--------|------------|
| Mint Pet | 10 |
| Feed Pet | 1 |
| Revive Pet | 5 |
| Play | Free |

All USDO payments are collected by the contract and can be withdrawn by the owner.

## 🔧 Smart Contract Functions

### User Functions

```solidity
// Mint a new pet (requires USDO approval)
function mint(string memory _name) returns (uint256)

// Feed your pet (requires USDO approval)
function feed(uint256 tokenId)

// Play with your pet (free)
function play(uint256 tokenId)

// Update pet stats
function updateState(uint256 tokenId)

// Revive a dead pet (requires USDO approval)
function revive(uint256 tokenId)

// Get pet information
function getPetInfo(uint256 tokenId) returns (...)

// Get all pets owned by an address
function getUserPets(address user) returns (uint256[])
```

### Owner Functions

```solidity
// Withdraw collected USDO
function withdrawUSDO()

// Update prices
function updatePrices(uint256 _mintPrice, uint256 _feedPrice, uint256 _revivalPrice)
```

## 🎨 OneChain Branding

The project uses OneChain's official colors:
- **Primary Blue**: `#3b82f6`
- **Dark Blue**: `#1e40af`  
- **Gold Accent**: `#fbbf24`

## 🔗 OneChain Integration

### Network Configuration

**OneChain Testnet:**
- Chain ID: 311752642
- RPC: https://testnet-rpc.oneledger.network
- Explorer: https://testnet-explorer.oneledger.network
- Native Token: ONE

### Adding to MetaMask

```javascript
{
  chainId: "0x129682C2",
  chainName: "OneChain Testnet",
  nativeCurrency: {
    name: "ONE",
    symbol: "ONE",
    decimals: 18
  },
  rpcUrls: ["https://testnet-rpc.oneledger.network"],
  blockExplorerUrls: ["https://testnet-explorer.oneledger.network"]
}
```

## 🏆 Hackathon Features

### OneWallet Integration ✅
- Compatible with OneWallet and MetaMask
- Wagmi connector configuration included

### USDO Stablecoin Integration ✅
- All in-game transactions use USDO
- No native token required for gameplay (only gas)
- Demonstrates DeFi mechanics

### Demo & Documentation ✅
- Comprehensive README
- Deployment scripts included
- Frontend demo with full functionality

## 📹 Demo Video

[Link to demo video - max 3 minutes]

## 📦 Submission Package

```
onepet/
├── contracts/          # Smart contracts
│   ├── OnePet.sol
│   ├── MockUSDO.sol
│   └── AchievementBadge.sol
├── scripts/            # Deployment scripts
├── test/               # Contract tests
├── evolvagotchi-frontend/  # React frontend
├── deployments.json    # Deployed contract addresses
└── README.md          # This file
```

## 🧪 Testing

```bash
# Run contract tests
npx hardhat test

# Run with gas reporting
REPORT_GAS=true npx hardhat test

# Deploy to local network
npx hardhat node
npx hardhat run scripts/deployOnePet.ts --network localhost
```

## 📝 License

MIT License

## 🤝 Contributing

This project was built for OneHack 2025. Feel free to fork and improve!

## 🙏 Acknowledgments

- OneChain team for the amazing L1 infrastructure
- OneHack organizers for hosting this event
- OpenZeppelin for secure contract libraries

## 📧 Contact

[Your contact information or project links]

---

**Built with ❤️ for OneHack 2025**

*Where Builders Become Legends* 🚀
