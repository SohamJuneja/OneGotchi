# Fight Arena Feature - Deployment Guide

## 📋 What's Been Added

### 1. **Smart Contract** (Move)
- `battle_arena.move` - Complete battle system with:
  - Turn-based combat mechanics
  - Health tracking (100 HP each pet)
  - Attack/Defense calculations based on pet stats
  - Battle Medal NFT rewards for winners
  - Battle log for storytelling

### 2. **Frontend** (React)
- `FightArena.tsx` - Complete battle UI with:
  - Wallet address input to find opponents
  - Pet selection (your pet vs opponent's pet)
  - Interactive battle system with dialogues
  - Real-time health bars and turn indicators
  - Battle log display
  - Victory screen with medal notification

### 3. **Integration**
- Added "Fight Arena" button to main game
- Connected to existing pet system
- Uses existing OneChain infrastructure

## 🚀 How to Deploy

### Step 1: Build and Deploy Move Contract

```bash
cd onegotchi-move/one_pet

# Build the Move package
one move build

# Deploy to OneChain testnet
one client publish --gas-budget 100000000
```

**Important:** Save the Package ID from the deployment output!

### Step 2: Update Frontend Config

Edit `evolvagotchi-frontend/src/config/onechain.ts`:

```typescript
export const ONECHAIN_CONFIG = {
  network: 'testnet',
  rpcUrl: 'https://rpc-testnet.onelabs.cc:443',
  
  // UPDATE THIS WITH YOUR NEW PACKAGE ID
  PACKAGE_ID: '0xYOUR_NEW_PACKAGE_ID_HERE',
  
  CLOCK: '0x0000000000000000000000000000000000000000000000000000000000000006',
  
  MODULES: {
    GAME: 'game',
    BATTLE: 'battle_arena'  // New module
  }
};
```

### Step 3: Test the Frontend

```bash
cd evolvagotchi-frontend

# Install dependencies if needed
npm install

# Start dev server
npm run dev
```

## 🎮 How to Use (For Users)

1. **Connect Wallet** - Must have OneChain wallet connected
2. **Mint/Select Pet** - Need at least one pet
3. **Click "Fight Arena"** button
4. **Enter opponent's wallet address** (0x...)
5. **Select opponent's pet** from their collection
6. **Start Battle!**
7. **Take turns attacking** - Your turn → click "ATTACK!"
8. **Watch the battle unfold** with dialogue and stats
9. **Winner gets a Battle Medal NFT!**

## 🎯 Battle Mechanics

### Attack Formula
```
Attack Power = 20 + (100 - hunger)/2 + happiness/4 + stage*5
Defense Power = 10 + happiness/5 + stage*3
Damage = max(5, Attack - Defense)
```

### Strategy
- **Feed your pet** before battle (lower hunger = higher attack)
- **Keep happiness high** for both offense and defense
- **Evolve your pet** for stage bonuses
- **Choose opponents wisely** based on their stats

## 📝 Known Limitations (Prototype Version)

This is a **frontend-simulated prototype** for demo purposes:

1. **Client-side battle** - Calculations happen in browser, not on-chain
2. **No blockchain verification** - Results aren't recorded on-chain yet
3. **Medal NFT** - Mentioned in UI but not actually minted
4. **No anti-cheat** - Since it's client-side

## 🔧 Future Enhancements (Full Version)

To make this production-ready:

1. **On-chain battle state** - Store Battle object on blockchain
2. **Multi-signature** - Both players must confirm battle
3. **Commit-reveal scheme** - Prevent front-running attacks
4. **Actual Medal minting** - Award real NFTs via battle_arena.move
5. **Battle history** - Store past battles on-chain
6. **Tournaments** - Multi-player bracket system

## 🎨 UI Features

- **Real-time health bars** with smooth animations
- **Turn indicator** showing whose turn it is
- **Battle dialogue** with random variations
- **Pet stats display** during battle
- **Victory/defeat screens**
- **Responsive design** works on mobile

## 🐛 Troubleshooting

**"This address has no pets"**
- Make sure the address has minted pets in your game
- Check the address format (must start with 0x)

**"Select both pets to fight"**
- Click on your pet first
- Then select opponent's pet
- Both must be highlighted

**Build errors in Move**
- Run `one move clean` and rebuild
- Check OneChain framework version compatibility

## 📞 Support

For issues:
1. Check browser console for errors
2. Verify wallet connection
3. Ensure sufficient OCT for gas
4. Confirm package ID is correct

---

**Built for OneChain Hackathon** 🏆
