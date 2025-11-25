# 🚀 Quick Start Guide - OnePet

**Get your OnePet game running in 15 minutes!**

---

## Prerequisites Checklist

- [ ] Node.js v16+ installed
- [ ] MetaMask browser extension installed
- [ ] Git installed (optional, for version control)

---

## Step 1: Setup (2 minutes)

### 1.1 Install Dependencies
```bash
npm install
```

### 1.2 Create Environment File
```bash
# Windows PowerShell
Copy-Item .env.example .env

# Then edit .env and add your private key
# Get it from MetaMask: Account Details > Export Private Key
```

**⚠️ Important**: Never commit your `.env` file to Git!

---

## Step 2: Get Testnet Tokens (3 minutes)

### 2.1 Add OneChain Testnet to MetaMask

Click "Add Network" in MetaMask and enter:

```
Network Name: OneChain Testnet
RPC URL: https://testnet-rpc.oneledger.network
Chain ID: 311752642
Currency Symbol: ONE
Block Explorer: https://testnet-explorer.oneledger.network
```

Or import this network config:
```javascript
{
  "chainId": "0x129682C2",
  "chainName": "OneChain Testnet",
  "nativeCurrency": {
    "name": "ONE",
    "symbol": "ONE",
    "decimals": 18
  },
  "rpcUrls": ["https://testnet-rpc.oneledger.network"],
  "blockExplorerUrls": ["https://testnet-explorer.oneledger.network"]
}
```

### 2.2 Get Test ONE Tokens
- Visit OneChain faucet (check OneChain docs/Telegram)
- You need ~0.1 ONE for gas fees
- These are free testnet tokens

---

## Step 3: Deploy Contracts (5 minutes)

### 3.1 Compile
```bash
npm run compile
```

Expected output:
```
✔ Compiled 5 Solidity files successfully
```

### 3.2 Deploy to OneChain
```bash
npm run deploy
```

Expected output:
```
🚀 Deploying OnePet contracts to OneChain...
📝 Deploying MockUSDO...
✅ MockUSDO deployed to: 0x...
📝 Deploying OnePet...
✅ OnePet deployed to: 0x...
🎉 Deployment complete!
```

**Save these addresses!** They're also saved in `deployments.json`

### 3.3 Update Frontend with Addresses
```bash
npm run update-frontend
```

This automatically:
- Copies contract ABIs to frontend
- Creates `.env` file with addresses
- Prepares everything for development

---

## Step 4: Test Contracts (2 minutes)

### 4.1 Open Hardhat Console
```bash
npx hardhat console --network onechain
```

### 4.2 Quick Test
```javascript
// Get contract instances
const addresses = require('./deployments.json');
const USDO = await ethers.getContractAt('MockUSDO', addresses.MockUSDO);
const OnePet = await ethers.getContractAt('OnePet', addresses.OnePet);

// Get free USDO
await USDO.faucet();
console.log('USDO Balance:', ethers.formatEther(await USDO.balanceOf(await ethers.provider.getSigner(0).getAddress())));

// Approve spending
await USDO.approve(addresses.OnePet, ethers.parseEther('100'));

// Mint a pet
const tx = await OnePet.mint('TestPet');
await tx.wait();
console.log('Pet minted! 🎉');

// Exit
.exit
```

---

## Step 5: Run Frontend (3 minutes)

### 5.1 Install Frontend Dependencies
```bash
cd evolvagotchi-frontend
npm install
```

### 5.2 Start Development Server
```bash
npm run dev
```

Expected output:
```
  VITE v5.x.x  ready in X ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 5.3 Open in Browser
- Visit: http://localhost:5173
- Connect your MetaMask wallet
- Make sure you're on OneChain Testnet

---

## Step 6: Test Gameplay (Quick Version)

1. **Get USDO**
   - Click "Get Free USDO" button
   - Confirm transaction in MetaMask
   - Wait for 100 USDO to appear

2. **Mint Your First Pet**
   - Enter pet name
   - Click "Mint Pet"
   - Approve USDO spending (first time only)
   - Confirm mint transaction
   - Wait for your NFT pet! 🥚

3. **Interact with Pet**
   - Click "Feed" (costs 1 USDO)
   - Click "Play" (free!)
   - Watch stats change
   - Wait for evolution

---

## Troubleshooting

### "Insufficient funds for gas"
→ Get more test ONE tokens from faucet

### "USDO payment failed"
→ Make sure you approved USDO spending first

### "Network mismatch"
→ Switch to OneChain Testnet in MetaMask

### "Cannot find module"
→ Run `npm install` again

### Frontend not loading contracts
→ Run `npm run update-frontend` again

---

## Full Workflow Commands

```bash
# Complete setup in one go:
npm install
cp .env.example .env
# Add your PRIVATE_KEY to .env
npm run compile
npm run deploy
npm run update-frontend
cd evolvagotchi-frontend
npm install
npm run dev
```

---

## What's Next?

### For Development
1. Read `FRONTEND_USDO_GUIDE.md` for implementing USDO hooks
2. Customize UI colors and branding
3. Add more features from achievement system
4. Implement AI chat with GROQ

### For Hackathon Submission
1. Test all functionality thoroughly
2. Record 3-minute demo video
3. Take screenshots
4. Fill out submission form
5. Submit before deadline!

### Resources
- **Full docs**: `README_ONEPET.md`
- **USDO integration**: `FRONTEND_USDO_GUIDE.md`
- **Deployment guide**: `DEPLOYMENT_CHECKLIST.md`
- **Submission info**: `HACKATHON_SUBMISSION.md`

---

## Quick Reference

### Contract Addresses
Check `deployments.json` after deployment

### Network Info
- **Chain ID**: 311752642
- **RPC**: https://testnet-rpc.oneledger.network
- **Explorer**: https://testnet-explorer.oneledger.network

### Prices (USDO)
- Mint: 10 USDO
- Feed: 1 USDO
- Revive: 5 USDO
- Play: Free

### Important Commands
```bash
npm run compile          # Compile contracts
npm run deploy           # Deploy to OneChain
npm run update-frontend  # Setup frontend
npm run test            # Run tests
npm run deploy:local    # Deploy to local hardhat
```

---

## Need Help?

1. Check the documentation files in the root directory
2. Join OneChain Telegram: https://t.me/hello_onechain
3. Review Hardhat docs: https://hardhat.org
4. Check OpenZeppelin: https://docs.openzeppelin.com

---

**You're all set! Happy building! 🎮**

Built for OneHack 2025 - Where Builders Become Legends 🚀
