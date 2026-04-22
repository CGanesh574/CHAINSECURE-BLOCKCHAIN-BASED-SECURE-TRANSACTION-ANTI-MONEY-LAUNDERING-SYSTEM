// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title SecureTransaction
 * @dev Smart contract for tracking secure ETH transactions
 * @notice This contract emits events for all ETH transfers for immutable record-keeping
 */
contract SecureTransaction {
    
    // Event emitted when ETH is transferred
    event TransactionRecorded(
        address indexed from,
        address indexed to,
        uint256 amount,
        uint256 timestamp,
        string transactionType
    );
    
    // Event emitted when contract receives ETH
    event Received(address indexed sender, uint256 amount);
    
    // Owner of the contract
    address public owner;
    
    // Total number of transactions processed
    uint256 public totalTransactions;
    
    // Mapping to track user transaction count
    mapping(address => uint256) public userTransactionCount;
    
    /**
     * @dev Constructor sets the contract deployer as owner
     */
    constructor() {
        owner = msg.sender;
        totalTransactions = 0;
    }
    
    /**
     * @dev Modifier to check if caller is owner
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    /**
     * @dev Records a transaction event
     * @param _to Recipient address
     * @param _amount Amount of ETH transferred (in wei)
     * @notice This function is called to log transactions on the blockchain
     */
    function recordTransaction(address _to, uint256 _amount) external payable {
        require(_to != address(0), "Invalid recipient address");
        require(_amount > 0, "Amount must be greater than zero");
        require(msg.value == _amount, "Sent value must match amount");
        
        // Transfer ETH to recipient
        (bool success, ) = payable(_to).call{value: _amount}("");
        require(success, "ETH transfer failed");
        
        // Emit transaction event
        emit TransactionRecorded(
            msg.sender,
            _to,
            _amount,
            block.timestamp,
            "SEND"
        );
        
        // Update counters
        totalTransactions++;
        userTransactionCount[msg.sender]++;
        userTransactionCount[_to]++;
    }
    
    /**
     * @dev Fallback function to receive ETH
     */
    receive() external payable {
        emit Received(msg.sender, msg.value);
    }
    
    /**
     * @dev Get total transactions count
     * @return Total number of transactions
     */
    function getTotalTransactions() external view returns (uint256) {
        return totalTransactions;
    }
    
    /**
     * @dev Get user's transaction count
     * @param _user User address
     * @return Number of transactions for the user
     */
    function getUserTransactionCount(address _user) external view returns (uint256) {
        return userTransactionCount[_user];
    }
    
    /**
     * @dev Get contract balance
     * @return Contract's ETH balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
