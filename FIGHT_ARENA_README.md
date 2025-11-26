# ⚔️ Fight Arena Feature - Quick Start

## What You Got

A **fully functional Fight Arena** prototype where players can:
- Enter opponent wallet addresses
- Select opponent's pets to battle
- Engage in turn-based combat with dialogue
- See real-time stats and health bars
- Winner gets notified (Battle Medal mentioned)

## Files Created

### Smart Contracts (Move)
- `onegotchi-move/one_pet/sources/battle_arena.move` - Battle logic
- `onegotchi-move/one_pet/sources/game.move` - Updated with getters

### Frontend (React)
- `evolvagotchi-frontend/src/components/FightArena.tsx` - Complete battle UI
- `evolvagotchi-frontend/src/components/EvolvagotchiGame.tsx` - Added Fight button

### Documentation
- `FIGHT_ARENA_GUIDE.md` - Detailed guide
- `deploy-fight-arena.bat` - Windows deployment script
- `deploy-fight-arena.sh` - Linux/Mac deployment script

## Quick Deploy (3 Steps)

### 1. Build & Deploy Move Contract

```bash
cd onegotchi-move/one_pet
one move build
one client publish --gas-budget 100000000
```

**→ Copy the Package ID!**

### 2. Update Frontend Config

Edit `evolvagotchi-frontend/src/config/onechain.ts`:

```typescript
PACKAGE_ID: '0xYOUR_NEW_PACKAGE_ID'  // ← Paste here
```

### 3. Run Frontend

```bash
cd evolvagotchi-frontend
npm run dev
```

## How Players Use It

1. Click **"⚔️ Fight Arena"** button
2. Enter opponent's wallet address (0x...)
3. See their pets, choose one to fight
4. Select your pet
5. Click **"START BATTLE!"**
6. Take turns attacking
7. Winner gets victory screen! 🏆

## Battle Mechanics

- **Initial Health**: 100 HP each
- **Attack Power**: Based on hunger, happiness, and stage
- **Defense**: Based on happiness and stage
- **Damage**: 5-30 HP per turn
- **Winner**: Last pet standing

## What's Working (Prototype)

✅ Pet selection system
✅ Opponent pet discovery
✅ Turn-based combat
✅ Battle dialogue system
✅ Health tracking & display
✅ Victory/defeat screens
✅ Smooth animations
✅ Mobile responsive

## Known Limitations

⚠️ **Client-side simulation** - Battle happens in browser, not on-chain (for speed)
⚠️ **No actual Medal NFT** - Just mentioned in UI (need on-chain minting)
⚠️ **No battle history** - Results not stored

## Make It Production-Ready

To make this a full on-chain system:

1. Store Battle state on blockchain
2. Require both players to sign
3. Implement commit-reveal for fairness
4. Actually mint Battle Medal NFTs
5. Store battle history on-chain

But for the **hackathon demo**, this prototype is perfect! It shows:
- Full battle mechanics
- Real pet stat integration  
- Polished UI/UX
- Working opponent discovery
- Complete user flow

## Need Help?

See `FIGHT_ARENA_GUIDE.md` for:
- Detailed deployment steps
- Troubleshooting guide
- Battle formula explanations
- Future enhancement ideas

---

**This is ready to demo! Just deploy and play.** 🎮
