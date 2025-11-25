// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title OnePet
 * @dev A Tamagotchi-style NFT game optimized for OneChain
 * @dev Features USDO token payments for minting and feeding
 * @dev Each OnePet is an autonomous NFT with AI-driven stat decay
 */
contract OnePet is ERC721, ERC721URIStorage, Ownable {
    
    IERC20 public usdoToken; // OneChain's Stablecoin
    
    enum EvolutionStage { Egg, Baby, Teen, Adult }
    
    struct Pet {
        string name;
        uint256 birthDate;
        uint256 lastUpdatedBlock;
        EvolutionStage evolutionStage;
        uint8 happiness;
        uint8 hunger;
        uint8 health;
        bool isDead;
        uint256 deathTimestamp;
    }
    
    uint256 private _nextTokenId;
    mapping(uint256 => Pet) public pets;
    
    // PRICES IN USDO (assuming 18 decimals)
    uint256 public MINT_PRICE = 10 * 10**18;  // 10 USDO
    uint256 public FEED_PRICE = 1 * 10**18;   // 1 USDO
    uint256 public REVIVAL_PRICE = 5 * 10**18; // 5 USDO
    
    // BALANCED FOR ONECHAIN BLOCK RATE
    uint256 public constant BLOCKS_PER_HUNGER_POINT = 500;      
    uint256 public constant BLOCKS_PER_HAPPINESS_DECAY = 1000;  
    
    // Evolution requirements
    uint256 public constant EGG_TO_BABY_BLOCKS = 25000;         
    uint256 public constant BABY_TO_TEEN_BLOCKS = 100000;       
    uint256 public constant TEEN_TO_ADULT_BLOCKS = 300000;      
    uint8 public constant EVOLUTION_HAPPINESS_THRESHOLD = 60;
    
    event PetMinted(uint256 indexed tokenId, address indexed owner, string name);
    event PetFed(uint256 indexed tokenId, uint8 newHunger, uint8 newHappiness);
    event PetPlayed(uint256 indexed tokenId, uint8 newHappiness);
    event PetEvolved(uint256 indexed tokenId, EvolutionStage newStage);
    event StateUpdated(uint256 indexed tokenId, uint8 hunger, uint8 happiness, uint8 health);
    event PetDied(uint256 indexed tokenId, uint256 timestamp);
    event PetRevived(uint256 indexed tokenId, uint256 timestamp);
    event USDOPayment(address indexed from, uint256 amount, string action);
    
    constructor(address _usdoAddress) ERC721("OnePet", "OPET") Ownable(msg.sender) {
        require(_usdoAddress != address(0), "Invalid USDO address");
        usdoToken = IERC20(_usdoAddress);
    }
    
    /**
     * @dev Mint a new pet NFT - requires USDO payment
     * @param _name Name for your new pet
     */
    function mint(string memory _name) public returns (uint256) {
        require(bytes(_name).length > 0 && bytes(_name).length <= 20, "Invalid name length");
        
        // PAYMENT LOGIC: Transfer USDO from user to contract
        bool success = usdoToken.transferFrom(msg.sender, address(this), MINT_PRICE);
        require(success, "USDO payment failed. Did you approve USDO spending?");
        
        emit USDOPayment(msg.sender, MINT_PRICE, "mint");
        
        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        
        pets[tokenId] = Pet({
            name: _name,
            birthDate: block.number,
            lastUpdatedBlock: block.number,
            evolutionStage: EvolutionStage.Egg,
            happiness: 100,
            hunger: 0,
            health: 100,
            isDead: false,
            deathTimestamp: 0
        });
        
        _setTokenURI(tokenId, "ipfs://QmEggMetadata");
        
        emit PetMinted(tokenId, msg.sender, _name);
        return tokenId;
    }
    
    function updateState(uint256 tokenId) public {
        require(_ownerOf(tokenId) != address(0), "Pet does not exist");
        
        Pet storage pet = pets[tokenId];
        
        // Don't update stats if pet is dead
        if (pet.isDead) return;
        
        uint256 blocksPassed = block.number - pet.lastUpdatedBlock;
        
        if (blocksPassed == 0) return;
        
        // Stat decay calculations
        uint256 hungerIncrease = blocksPassed / BLOCKS_PER_HUNGER_POINT;
        uint256 happinessDecrease = blocksPassed / BLOCKS_PER_HAPPINESS_DECAY;
        
        if (hungerIncrease > 0) {
            pet.hunger = uint8(_min(uint256(pet.hunger) + hungerIncrease, 100));
        }
        
        if (happinessDecrease > 0) {
            if (happinessDecrease >= pet.happiness) {
                pet.happiness = 0;
            } else {
                pet.happiness -= uint8(happinessDecrease);
            }
        }
        
        // Health logic
        if (pet.hunger > 80 && pet.health > 0) {
            uint256 healthDecrease = (pet.hunger - 80) / 5;
            if (healthDecrease >= pet.health) {
                pet.health = 0;
            } else {
                pet.health -= uint8(healthDecrease);
            }
        }
        
        if (pet.hunger < 30 && pet.happiness > 70 && pet.health < 100) {
            pet.health = uint8(_min(uint256(pet.health) + 1, 100));
        }
        
        pet.lastUpdatedBlock = block.number;
        
        // Check for death
        _checkDeath(tokenId);
        
        emit StateUpdated(tokenId, pet.hunger, pet.happiness, pet.health);
        
        _checkAndEvolve(tokenId);
    }
    
    /**
     * @dev Feed your pet - requires USDO payment
     * @param tokenId The pet to feed
     */
    function feed(uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "Not your pet");
        
        Pet storage pet = pets[tokenId];
        require(!pet.isDead, "Cannot feed a dead pet");
        
        // PAYMENT LOGIC: Transfer USDO to feed
        bool success = usdoToken.transferFrom(msg.sender, address(this), FEED_PRICE);
        require(success, "USDO payment failed. Did you approve USDO spending?");
        
        emit USDOPayment(msg.sender, FEED_PRICE, "feed");
        
        updateState(tokenId);
        
        pet.hunger = pet.hunger > 40 ? pet.hunger - 40 : 0;
        pet.happiness = uint8(_min(uint256(pet.happiness) + 15, 100));
        
        emit PetFed(tokenId, pet.hunger, pet.happiness);
        
        _checkAndEvolve(tokenId);
    }
    
    function play(uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "Not your pet");
        
        Pet storage pet = pets[tokenId];
        require(!pet.isDead, "Cannot play with a dead pet");
        
        updateState(tokenId);
        
        pet.happiness = uint8(_min(uint256(pet.happiness) + 25, 100));
        
        emit PetPlayed(tokenId, pet.happiness);
        
        _checkAndEvolve(tokenId);
    }
    
    /**
     * @dev Check if pet should die (health reaches 0)
     */
    function _checkDeath(uint256 tokenId) internal {
        Pet storage pet = pets[tokenId];
        if (pet.health == 0 && !pet.isDead) {
            pet.isDead = true;
            pet.deathTimestamp = block.timestamp;
            emit PetDied(tokenId, block.timestamp);
        }
    }
    
    /**
     * @dev Revive a dead pet - requires USDO payment
     * @param tokenId The pet to revive
     */
    function revive(uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "Not your pet");
        
        Pet storage pet = pets[tokenId];
        require(pet.isDead, "Pet is not dead");
        
        // PAYMENT LOGIC: Transfer USDO to revive
        bool success = usdoToken.transferFrom(msg.sender, address(this), REVIVAL_PRICE);
        require(success, "USDO payment failed. Did you approve USDO spending?");
        
        emit USDOPayment(msg.sender, REVIVAL_PRICE, "revive");
        
        // Revive with partial stats
        pet.isDead = false;
        pet.health = 50;
        pet.happiness = 30;
        pet.hunger = 50;
        pet.deathTimestamp = 0;
        pet.lastUpdatedBlock = block.number;
        
        emit PetRevived(tokenId, block.timestamp);
        emit StateUpdated(tokenId, pet.hunger, pet.happiness, pet.health);
    }
    
    function _checkAndEvolve(uint256 tokenId) internal {
        Pet storage pet = pets[tokenId];
        uint256 age = block.number - pet.birthDate;
        
        if (pet.evolutionStage == EvolutionStage.Egg && age >= EGG_TO_BABY_BLOCKS) {
            pet.evolutionStage = EvolutionStage.Baby;
            _setTokenURI(tokenId, "ipfs://QmBabyMetadata");
            emit PetEvolved(tokenId, EvolutionStage.Baby);
        }
        else if (pet.evolutionStage == EvolutionStage.Baby && 
                 age >= BABY_TO_TEEN_BLOCKS && 
                 pet.happiness >= EVOLUTION_HAPPINESS_THRESHOLD) {
            pet.evolutionStage = EvolutionStage.Teen;
            _setTokenURI(tokenId, "ipfs://QmTeenMetadata");
            emit PetEvolved(tokenId, EvolutionStage.Teen);
        }
        else if (pet.evolutionStage == EvolutionStage.Teen && 
                 age >= TEEN_TO_ADULT_BLOCKS && 
                 pet.happiness >= EVOLUTION_HAPPINESS_THRESHOLD &&
                 pet.health >= 80) {
            pet.evolutionStage = EvolutionStage.Adult;
            _setTokenURI(tokenId, "ipfs://QmAdultMetadata");
            emit PetEvolved(tokenId, EvolutionStage.Adult);
        }
    }
    
    function getPetInfo(uint256 tokenId) public view returns (
        string memory name,
        uint256 birthDate,
        uint256 age,
        EvolutionStage evolutionStage,
        uint8 happiness,
        uint8 hunger,
        uint8 health,
        uint256 blocksSinceUpdate,
        bool isDead,
        uint256 deathTimestamp
    ) {
        require(_ownerOf(tokenId) != address(0), "Pet does not exist");
        Pet memory pet = pets[tokenId];
        
        return (
            pet.name,
            pet.birthDate,
            block.number - pet.birthDate,
            pet.evolutionStage,
            pet.happiness,
            pet.hunger,
            pet.health,
            block.number - pet.lastUpdatedBlock,
            pet.isDead,
            pet.deathTimestamp
        );
    }
    
    function getUserPets(address user) public view returns (uint256[] memory) {
        uint256 balance = balanceOf(user);
        uint256[] memory tokenIds = new uint256[](balance);
        uint256 counter = 0;
        
        for (uint256 i = 0; i < _nextTokenId; i++) {
            if (_ownerOf(i) == user) {
                tokenIds[counter] = i;
                counter++;
            }
        }
        
        return tokenIds;
    }
    
    function batchUpdateState(uint256[] calldata tokenIds) external {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            if (_ownerOf(tokenIds[i]) != address(0)) {
                updateState(tokenIds[i]);
            }
        }
    }
    
    /**
     * @dev Apply accumulated event effects from frontend
     * @param tokenId The pet to update
     * @param happinessDelta Change in happiness (-100 to +100)
     * @param hungerDelta Change in hunger (-100 to +100)
     * @param healthDelta Change in health (-100 to +100)
     */
    function applyEventEffects(
        uint256 tokenId,
        int8 happinessDelta,
        int8 hungerDelta,
        int8 healthDelta
    ) public {
        require(ownerOf(tokenId) == msg.sender, "Not your pet");
        
        Pet storage pet = pets[tokenId];
        require(!pet.isDead, "Cannot apply effects to a dead pet");
        
        // Update state first to get latest stats
        updateState(tokenId);
        
        pet = pets[tokenId];
        
        // Apply happiness delta
        if (happinessDelta != 0) {
            int16 newHappiness = int16(uint16(pet.happiness)) + int16(happinessDelta);
            pet.happiness = uint8(uint16(_clampInt(newHappiness, 0, 100)));
        }
        
        // Apply hunger delta
        if (hungerDelta != 0) {
            int16 newHunger = int16(uint16(pet.hunger)) + int16(hungerDelta);
            pet.hunger = uint8(uint16(_clampInt(newHunger, 0, 100)));
        }
        
        // Apply health delta
        if (healthDelta != 0) {
            int16 newHealth = int16(uint16(pet.health)) + int16(healthDelta);
            pet.health = uint8(uint16(_clampInt(newHealth, 0, 100)));
        }
        
        // Check for death after applying effects
        _checkDeath(tokenId);
        
        emit StateUpdated(tokenId, pet.hunger, pet.happiness, pet.health);
        
        // Check if pet can evolve with new stats
        _checkAndEvolve(tokenId);
    }
    
    /**
     * @dev Update the token URI to point to new NFT metadata on IPFS
     * @param tokenId The pet token ID
     * @param newTokenURI The new IPFS URI (e.g., ipfs://QmHash...)
     */
    function updateTokenURI(uint256 tokenId, string memory newTokenURI) public {
        require(ownerOf(tokenId) == msg.sender, "Not your pet");
        _setTokenURI(tokenId, newTokenURI);
    }
    
    /**
     * @dev Clamp an int16 value between min and max
     */
    function _clampInt(int16 value, int16 min, int16 max) internal pure returns (int16) {
        if (value < min) return min;
        if (value > max) return max;
        return value;
    }
    
    /**
     * @dev Withdraw function for the Game Dev to collect USDO revenue
     */
    function withdrawUSDO() external onlyOwner {
        uint256 balance = usdoToken.balanceOf(address(this));
        require(balance > 0, "No USDO to withdraw");
        usdoToken.transfer(msg.sender, balance);
    }
    
    /**
     * @dev Update USDO prices (only owner)
     */
    function updatePrices(uint256 _mintPrice, uint256 _feedPrice, uint256 _revivalPrice) external onlyOwner {
        MINT_PRICE = _mintPrice;
        FEED_PRICE = _feedPrice;
        REVIVAL_PRICE = _revivalPrice;
    }
    
    function _min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
