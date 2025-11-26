# 🧪 Testing the Fight Arena - Complete Guide

## Option 1: Self-Battle (Easiest!)

You can battle your own pets against each other:

### Steps:
1. **Mint 2 pets** with different names
2. **Click Fight Arena**
3. **Enter YOUR OWN wallet address** as opponent
4. **You'll see both your pets!**
5. Select one from each side and battle

This works because the opponent discovery just looks up pets by address - it can be your own!

## Option 2: Use Test Wallet Addresses

Here are some OneChain testnet addresses you can try (they might have pets):

```
0x4b68a26bf44586a5767283c222719beb0f5895d0ebbf543ed58dfc8bf94ea236
(This is your deployer address - might have pets!)
```

## 🎯 Quick Start Test (5 minutes)

### Step 1: Mint Your First Pet
1. Open http://localhost:5173/
2. Connect wallet
3. Click "+ Mint New Pet"
4. Name it "Fluffy" (costs 0.01 OCT)
5. Wait for transaction

### Step 2: Mint Second Pet
1. Click "+ Mint New Pet" again
2. Name it "Shadow" (costs another 0.01 OCT)
3. Wait for transaction

### Step 3: Feed & Play (Optional but recommended)
- Click on each pet
- Feed them (lower hunger = more damage)
- Play with them (higher happiness = better stats)

### Step 4: Start Battle!
1. Go back to pet list
2. Click **"⚔️ Fight Arena"**
3. In the opponent address field, **paste YOUR OWN address**
   - Click your wallet to copy it, or
   - Use: `0x4b68a26bf44586a5767283c222719beb0f5895d0ebbf543ed58dfc8bf94ea236`
4. Click "🔍 Find Pets"
5. You'll see both your pets!

### Step 5: Battle!
1. Select "Fluffy" as YOUR pet (left side)
2. Select "Shadow" as OPPONENT (right side)
3. Click **"⚔️   START BATTLE!"**
4. Watch the AI-powered commentary! 🤖
5. Click "ATTACK!" each turn
6. Watch health bars decrease
7. See who wins!

## 🎮 Testing Different Scenarios

### Test 1: Well-Fed vs Hungry
- Feed one pet (lower hunger)
- Don't feed the other
- Battle them - fed pet should win!

### Test 2: Happy vs Sad
- Play with one pet (high happiness)
- Ignore the other (low happiness)
- Battle them - happy pet has better stats!

### Test 3: Evolved vs Baby
- Wait for one pet to evolve (or trigger evolve)
- Battle evolved vs baby
- Evolved pet gets stage bonuses!

## 💰 Need OCT for Testing?

If you don't have enough OCT (you need ~0.02-0.03 for 2 pets):

1. **OneChain Faucet**: Check OneChain Discord/docs for testnet faucet
2. **Your deployer wallet**: The wallet you used to deploy already has OCT
3. **Create second wallet**: 
   - Add another account in your wallet
   - Send OCT from your main account

## 🤖 Watch for Groq AI Commentary!

Each attack will generate unique dialogue like:
- "⚡ Fluffy strikes with lightning speed, dealing 18 damage! Shadow reels back! 💥"
- "🔥 A devastating blow from Shadow! Fluffy takes 22 damage and stumbles! 😱"
- "💪 Fluffy channels all their energy into a powerful attack dealing 15 damage! ⚔️"

## 📊 Battle Mechanics to Test

### Attack Power Formula:
```
Attack = 20 + (100-hunger)/2 + happiness/4 + stage*5

Example:
- Hunger: 20, Happiness: 80, Stage: 1
- Attack = 20 + 40 + 20 + 5 = 85
```

### Defense Formula:
```
Defense = 10 + happiness/5 + stage*3

Example:
- Happiness: 80, Stage: 1
- Defense = 10 + 16 + 3 = 29
```

### Damage:
```
Damage = max(5, Attack - Defense)
```

## 🎬 Demo Flow

Perfect flow for showing off:

1. **Show 2 pets** with different stats
2. **Enter your address** to find opponent
3. **Select pets** from each side
4. **Start battle** - show the interface
5. **First attack** - highlight AI commentary
6. **Watch health bars** decrease
7. **Battle log** fills with Groq-generated story
8. **Victory screen** appears
9. **Medal notification** shows

## 🐛 Troubleshooting

**"This address has no pets"**
- You're using your own address and haven't minted yet
- Solution: Mint 2 pets first!

**Can't select both pets**
- Make sure you have at least 2 pets minted
- Click one on the left (YOUR PET)
- Click one on the right (OPPONENT)

**No OCT for minting**
- Check OneChain faucet
- Your deployer address should have OCT from deployment

**Groq commentary not showing**
- Check if VITE_GROQ_API_KEY is set in .env
- Fallback: Simple messages will show instead

## 🎯 What to Highlight in Demo

1. ✅ **Self-battle capability** - Use your own address
2. ✅ **AI commentary** - Every attack is unique
3. ✅ **Stats matter** - Fed/happy pets are stronger
4. ✅ **Evolution bonus** - Stages affect damage
5. ✅ **Smooth UX** - Animations and transitions
6. ✅ **Complete flow** - From pet list to victory

## 📝 Pro Tips

- **Mint pets with different stats** for more interesting battles
- **Feed/play before battle** to see stat differences in action
- **Read the AI commentary** - it's context-aware and hilarious
- **Try multiple battles** - Groq generates different dialogue each time
- **Screenshot the victory** - shows medal and battle log

---

**TL;DR:** 
1. Mint 2 pets
2. Enter YOUR OWN wallet address as opponent
3. Battle your pets against each other!

No need for other wallets! 🎮⚔️
