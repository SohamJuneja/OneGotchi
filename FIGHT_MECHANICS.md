# 🎮 Fight Arena Mechanics

## ⚔️ Battle System Overview

The Fight Arena features a **fully stat-dependent battle system** where pet stats directly impact combat performance!

---

## 📊 Stats Impact on Battle

### **Attack Power Formula:**
```
Attack = 20 + (100 - hunger) / 2 + happiness / 4 + stage * 5
```

**Breakdown:**
- **Base Attack**: 20 (everyone starts here)
- **Hunger Impact**: Lower hunger = More attack power (well-fed pets fight better!)
  - 0 hunger (full) = +50 attack
  - 50 hunger = +25 attack
  - 100 hunger (starving) = 0 bonus
- **Happiness Bonus**: Higher happiness = More attack
  - 100 happiness = +25 attack
  - 50 happiness = +12.5 attack
- **Stage Bonus**: Higher evolution = More power
  - Stage 0 (Egg) = +0
  - Stage 1 (Baby) = +5
  - Stage 2 (Teen) = +10
  - Stage 3 (Adult) = +15

**Example Attack Values:**
- Well-fed (0 hunger), Happy (100), Adult (stage 3): **110 attack**
- Hungry (80 hunger), Sad (20), Baby (stage 1): **40 attack**

---

### **Defense Power Formula:**
```
Defense = 10 + happiness / 5 + stage * 3
```

**Breakdown:**
- **Base Defense**: 10
- **Happiness Shield**: Higher happiness = Better defense
  - 100 happiness = +20 defense
  - 50 happiness = +10 defense
- **Stage Armor**: Higher evolution = Tougher defense
  - Stage 0 = +0
  - Stage 1 = +3
  - Stage 2 = +6
  - Stage 3 = +9

**Example Defense Values:**
- Happy (100), Adult (stage 3): **39 defense**
- Sad (20), Egg (stage 0): **14 defense**

---

### **Damage Calculation:**
```
Damage = max(5, Attack - Defense)
Damage is capped at 30 per hit
```

**This means:**
- Minimum damage per hit: **5 HP**
- Maximum damage per hit: **30 HP**
- Actual damage depends on attacker's power vs defender's defense

---

## 🏆 Battle Advantages

### **Happy Pet Wins Over Sad Pet**
- Happy pet (100): Gets +25 attack AND +20 defense
- Sad pet (20): Gets only +5 attack and +4 defense
- **Result**: Happy pet deals more damage AND takes less damage!

### **Well-Fed Pet Wins Over Hungry Pet**
- Well-fed (0 hunger): +50 attack bonus
- Hungry (100 hunger): +0 attack bonus
- **Result**: Well-fed pet hits 50% harder!

### **Adult Pet Wins Over Baby Pet**
- Adult (stage 3): +15 attack and +9 defense
- Baby (stage 1): +5 attack and +3 defense
- **Result**: Adult pet significantly stronger in all aspects!

---

## 🎯 Strategy Tips

1. **Feed Your Pet Before Battle** 🍖
   - Lower hunger = higher attack power
   - Aim for 0-20 hunger for maximum damage

2. **Keep Your Pet Happy** 😊
   - Happiness boosts BOTH attack and defense
   - Play with your pet regularly for better battle performance

3. **Evolve Your Pet** ⭐
   - Higher stages get significant combat bonuses
   - Adult pets are battle champions!

4. **Scout Your Opponent** 🔍
   - Check opponent's happiness, hunger, and stage
   - Calculate their attack power before committing to battle

---

## 🎪 Battle UI Features

### **Real-Time Stats Display**
- Current Happiness: Affects attack & defense
- Fed Level (100 - hunger): Shows how well-fed the pet is
- Power Score: Calculated attack power visible before battle

### **Health Bars**
- Dynamic color changes:
  - **Green** (100-50 HP): Healthy
  - **Orange** (50-30 HP): Low health (pulsing animation)
  - **Red** (<30 HP): Critical (fast pulsing animation)

### **Battle Commentary**
- AI-powered Groq commentary describes each attack
- Unique dialogue based on:
  - Pet personalities
  - Attack damage
  - Health status
  - Stage differences

### **Animations**
- **Attacking pet**: Lunge forward animation
- **Defending pet**: Flinch animation
- **Health bars**: Smooth decrease with glow effects
- **Victory**: Celebration animation with confetti

---

## 💎 Battle Rewards

**Winner Receives:**
- 🏅 **Battle Medal NFT** (displayed in UI)
- 🎉 Victory screen with celebration
- 📊 Full battle log for review

**Note**: Current prototype shows medal reward in UI. Full on-chain medal minting can be implemented in future updates.

---

## 🔥 Example Battle Scenarios

### Scenario 1: Champion vs Neglected
- **Champion**: Happy (100), Fed (0 hunger), Adult (stage 3)
  - Attack: 20 + 50 + 25 + 15 = **110**
  - Defense: 10 + 20 + 9 = **39**
- **Neglected**: Sad (10), Hungry (90), Egg (stage 0)
  - Attack: 20 + 5 + 2.5 + 0 = **27.5**
  - Defense: 10 + 2 + 0 = **12**
- **Damage per hit**: Champion deals 71 (capped at 30), Neglected deals 0 (minimum 5)
- **Result**: Champion wins in ~4 rounds!

### Scenario 2: Evenly Matched
- **Pet A**: Happy (80), Fed (20 hunger), Teen (stage 2)
  - Attack: 20 + 40 + 20 + 10 = **90**
  - Defense: 10 + 16 + 6 = **32**
- **Pet B**: Happy (75), Fed (30 hunger), Teen (stage 2)
  - Attack: 20 + 35 + 18.75 + 10 = **83.75**
  - Defense: 10 + 15 + 6 = **31**
- **Damage**: A deals 26, B deals 22
- **Result**: Close battle! A wins in ~5 rounds

---

## 🚀 Future Enhancements

- [ ] On-chain battle execution with commit-reveal
- [ ] Two-signature confirmation system
- [ ] Actual Medal NFT minting on blockchain
- [ ] Battle history stored on-chain
- [ ] Leaderboards and rankings
- [ ] Tournament system
- [ ] Special abilities based on stage
- [ ] Items/power-ups for battles

---

**Built with ❤️ for Evolvagotchi**
*Stats matter! Care for your pet to dominate the arena!*
