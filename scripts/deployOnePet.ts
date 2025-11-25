import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying OnePet contracts to OneChain...");
  
  // Deploy MockUSDO first
  console.log("\n📝 Deploying MockUSDO...");
  const MockUSDO = await ethers.getContractFactory("MockUSDO");
  const mockUSDO = await MockUSDO.deploy();
  await mockUSDO.waitForDeployment();
  const usdoAddress = await mockUSDO.getAddress();
  
  console.log("✅ MockUSDO deployed to:", usdoAddress);
  
  // Deploy OnePet with MockUSDO address
  console.log("\n📝 Deploying OnePet...");
  const OnePet = await ethers.getContractFactory("OnePet");
  const onePet = await OnePet.deploy(usdoAddress);
  await onePet.waitForDeployment();
  const onePetAddress = await onePet.getAddress();
  
  console.log("✅ OnePet deployed to:", onePetAddress);
  
  console.log("\n🎉 Deployment complete!");
  console.log("\n📋 Contract Addresses:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("MockUSDO:  ", usdoAddress);
  console.log("OnePet:    ", onePetAddress);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  
  console.log("\n💡 Next Steps:");
  console.log("1. Update frontend contract addresses in src/contracts/");
  console.log("2. Call mockUSDO.faucet() to get test USDO");
  console.log("3. Approve USDO spending: mockUSDO.approve(onePetAddress, amount)");
  console.log("4. Mint your first OnePet!");
  
  // Save addresses to a file for easy reference
  const fs = require('fs');
  const addresses = {
    network: "OneChain Testnet",
    chainId: 311752642,
    MockUSDO: usdoAddress,
    OnePet: onePetAddress,
    deployedAt: new Date().toISOString()
  };
  
  fs.writeFileSync(
    './deployments.json',
    JSON.stringify(addresses, null, 2)
  );
  
  console.log("\n📄 Addresses saved to deployments.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
