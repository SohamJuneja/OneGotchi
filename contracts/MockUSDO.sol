// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockUSDO
 * @dev Mock USDO token for testing OnePet on OneChain Testnet
 * @dev This allows developers to get free USDO for testing purposes
 */
contract MockUSDO is ERC20 {
    constructor() ERC20("Mock USDO", "mUSDO") {
        // Mint 1 million tokens to deployer for initial distribution
        _mint(msg.sender, 1000000 * 10**18);
    }
    
    /**
     * @dev Faucet function - anyone can claim 100 free USDO for testing
     */
    function faucet() external {
        _mint(msg.sender, 100 * 10**18); // Give 100 free USDO
    }
    
    /**
     * @dev Mint function for deployer to create more tokens if needed
     */
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
