# 🚀 OneGotchi - Vercel Deployment Guide

## Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/SohamJuneja/OneGotchi)

---

## Prerequisites

- GitHub account
- Vercel account (free)
- GROQ API key (get from https://console.groq.com)
- Pinata JWT token (optional, for NFT art - get from https://app.pinata.cloud)

---

## Method 1: Deploy via Vercel Dashboard (Easiest)

### Step 1: Import Project

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your GitHub account and repository: `SohamJuneja/OneGotchi`
4. Click "Import"

### Step 2: Configure Project

**Root Directory:** `evolvagotchi-frontend`

**Framework Preset:** Vite

**Build Command:** `npm run build`

**Output Directory:** `dist`

**Install Command:** `npm install`

### Step 3: Add Environment Variables

In the "Environment Variables" section, add:

```
VITE_GROQ_API_KEY=your_groq_api_key_here
VITE_PINATA_JWT=your_pinata_jwt_here (optional)
```

### Step 4: Deploy

Click "Deploy" and wait ~2 minutes!

Your app will be live at: `https://your-project-name.vercel.app`

---

## Method 2: Deploy via Vercel CLI

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Navigate to Frontend

```bash
cd evolvagotchi-frontend
```

### Step 4: Create .env.production

```bash
# Create production environment file
cat > .env.production << EOL
VITE_GROQ_API_KEY=your_groq_api_key_here
VITE_PINATA_JWT=your_pinata_jwt_here
EOL
```

### Step 5: Deploy

```bash
# Deploy to production
vercel --prod
```

---

## Method 3: Auto-Deploy from GitHub (Recommended)

### Step 1: Connect Repository

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Vercel will automatically detect it's a Vite project

### Step 2: Configure Build Settings

Vercel will auto-detect these settings:

- **Root Directory:** `evolvagotchi-frontend`
- **Framework:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

### Step 3: Add Secrets

Go to **Settings > Environment Variables** and add:

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_GROQ_API_KEY` | Your GROQ API key | Production, Preview |
| `VITE_PINATA_JWT` | Your Pinata JWT (optional) | Production, Preview |

### Step 4: Enable Auto-Deploy

Vercel will automatically deploy on every push to `main` branch! 🎉

---

## Get API Keys

### GROQ API Key (Required)

1. Visit https://console.groq.com
2. Sign up / Log in
3. Navigate to "API Keys"
4. Create new API key
5. Copy and save securely

**Why needed:** Powers AI pet chat, health predictions, and random events

### Pinata JWT (Optional)

1. Visit https://app.pinata.cloud
2. Sign up / Log in
3. Go to "API Keys"
4. Create new key with permissions:
   - `pinFileToIPFS`
   - `pinJSONToIPFS`
5. Copy JWT token

**Why needed:** Enables NFT art generation and IPFS storage

---

## Post-Deployment

### Verify Deployment

1. Visit your Vercel URL
2. Click "Connect Wallet" 
3. Try minting a pet (requires OneChain testnet + OCT tokens)

### Custom Domain (Optional)

1. Go to **Settings > Domains**
2. Add your custom domain
3. Follow DNS configuration steps

### Enable Analytics

1. Go to **Analytics** tab
2. Enable Web Analytics (free)
3. View real-time traffic data

---

## Troubleshooting

### Build Fails

**Error:** `Module not found`
- **Solution:** Ensure `vercel.json` has correct `rootDirectory`

**Error:** `Environment variable not set`
- **Solution:** Add `VITE_GROQ_API_KEY` in Vercel dashboard

### App Loads but Pets Don't Show

- **Cause:** Not connected to OneChain wallet
- **Solution:** Install Sui wallet extension and connect

### AI Chat Doesn't Work

- **Cause:** Missing or invalid GROQ API key
- **Solution:** Check environment variables in Vercel dashboard

### NFT Art Generator Fails

- **Cause:** Missing Pinata JWT
- **Solution:** Add `VITE_PINATA_JWT` or download PNG instead

---

## Environment Variables Reference

| Variable | Required | Description | Where to Get |
|----------|----------|-------------|--------------|
| `VITE_GROQ_API_KEY` | ✅ Yes | AI chat & events | https://console.groq.com |
| `VITE_PINATA_JWT` | ❌ Optional | NFT IPFS storage | https://app.pinata.cloud |

---

## Performance Optimization

### Edge Functions (Automatic)

Vercel automatically deploys your app to Edge locations for:
- ⚡ Fast global access
- 🌍 Low latency worldwide
- 📈 Auto-scaling

### Caching

Vercel caches static assets (JS, CSS, images) automatically.

### Bundle Size

Current build size: ~500KB (optimized)

---

## Continuous Deployment

Every `git push` to `main` triggers:

1. ✅ Build on Vercel
2. ✅ Run tests (if configured)
3. ✅ Deploy to production
4. ✅ Automatic preview URLs for PRs

---

## Monitoring

### View Logs

```bash
vercel logs your-deployment-url
```

### Check Build Status

Go to: https://vercel.com/[your-username]/[project-name]/deployments

---

## Support

- **Vercel Docs:** https://vercel.com/docs
- **OneGotchi Issues:** https://github.com/SohamJuneja/OneGotchi/issues

---

**Deployed with ❤️ on Vercel**
