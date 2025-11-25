// Script to update contract addresses after deployment
// Run: node scripts/updateFrontendContracts.js

const fs = require('fs');
const path = require('path');

// Read deployment addresses
const deploymentsPath = './deployments.json';
if (!fs.existsSync(deploymentsPath)) {
  console.error('❌ deployments.json not found! Deploy contracts first.');
  process.exit(1);
}

const deployments = JSON.parse(fs.readFileSync(deploymentsPath, 'utf8'));

console.log('📦 Deployment Info:');
console.log('Network:', deployments.network);
console.log('MockUSDO:', deployments.MockUSDO);
console.log('OnePet:', deployments.OnePet);

// Copy ABIs to frontend
const artifactsPath = './artifacts/contracts';
const frontendContractsPath = './evolvagotchi-frontend/src/contracts';

// Ensure frontend contracts directory exists
if (!fs.existsSync(frontendContractsPath)) {
  fs.mkdirSync(frontendContractsPath, { recursive: true });
}

console.log('\n📋 Copying contract ABIs...');

// Copy OnePet ABI
const onePetArtifact = JSON.parse(
  fs.readFileSync(path.join(artifactsPath, 'OnePet.sol/OnePet.json'), 'utf8')
);
const onePetContract = {
  address: deployments.OnePet,
  abi: onePetArtifact.abi
};
fs.writeFileSync(
  path.join(frontendContractsPath, 'OnePet.json'),
  JSON.stringify(onePetContract, null, 2)
);
console.log('✅ OnePet.json created');

// Copy MockUSDO ABI
const mockUSDOArtifact = JSON.parse(
  fs.readFileSync(path.join(artifactsPath, 'MockUSDO.sol/MockUSDO.json'), 'utf8')
);
const mockUSDOContract = {
  address: deployments.MockUSDO,
  abi: mockUSDOArtifact.abi
};
fs.writeFileSync(
  path.join(frontendContractsPath, 'MockUSDO.json'),
  JSON.stringify(mockUSDOContract, null, 2)
);
console.log('✅ MockUSDO.json created');

// Copy AchievementBadge ABI if exists
const achievementPath = path.join(artifactsPath, 'AchievementBadge.sol/AchievementBadge.json');
if (fs.existsSync(achievementPath)) {
  const achievementArtifact = JSON.parse(fs.readFileSync(achievementPath, 'utf8'));
  // Note: You'll need to deploy AchievementBadge separately and add its address
  const achievementContract = {
    address: deployments.AchievementBadge || '0x0000000000000000000000000000000000000000',
    abi: achievementArtifact.abi
  };
  fs.writeFileSync(
    path.join(frontendContractsPath, 'AchievementBadge.json'),
    JSON.stringify(achievementContract, null, 2)
  );
  console.log('✅ AchievementBadge.json created');
}

// Create .env file for frontend
const frontendEnvPath = './evolvagotchi-frontend/.env';
const envContent = `# Contract Addresses (Auto-generated)
VITE_ONEPET_ADDRESS=${deployments.OnePet}
VITE_USDO_ADDRESS=${deployments.MockUSDO}
VITE_ONECHAIN_RPC=https://testnet-rpc.oneledger.network
VITE_CHAIN_ID=311752642

# Optional: Add these if you use them
# VITE_GROQ_API_KEY=your_groq_api_key
# VITE_PINATA_API_KEY=your_pinata_key
# VITE_PINATA_SECRET=your_pinata_secret
`;

fs.writeFileSync(frontendEnvPath, envContent);
console.log('✅ Frontend .env created');

console.log('\n✨ Frontend setup complete!');
console.log('\n📝 Next steps:');
console.log('1. cd evolvagotchi-frontend');
console.log('2. npm install');
console.log('3. Implement USDO hooks (see FRONTEND_USDO_GUIDE.md)');
console.log('4. npm run dev');
console.log('\n🎯 Contract addresses are ready to use!');
