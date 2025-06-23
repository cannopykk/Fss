// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract FamilySmartSaver {
    struct Goal {
        string name;
        uint256 targetAmount;
        uint256 savedAmount;
        uint256 deadline;
        address creator;
        bool isAchieved;
        bool isActive;
        uint256 createdAt;
    }
    
    struct Contribution {
        address contributor;
        uint256 amount;
        uint256 timestamp;
    }
    
    mapping(uint256 => Goal) public goals;
    mapping(uint256 => Contribution[]) public goalContributions;
    mapping(address => uint256[]) public userGoals;
    
    uint256 public goalCounter;
    uint256 public constant ACHIEVEMENT_THRESHOLD = 80; // 80% to achieve goal
    
    event GoalCreated(uint256 indexed goalId, address indexed creator, string name, uint256 targetAmount, uint256 deadline);
    event ContributionMade(uint256 indexed goalId, address indexed contributor, uint256 amount);
    event GoalAchieved(uint256 indexed goalId, uint256 totalSaved);
    event FundsWithdrawn(uint256 indexed goalId, address indexed creator, uint256 amount);
    
    modifier onlyGoalCreator(uint256 goalId) {
        require(goals[goalId].creator == msg.sender, "Only goal creator can perform this action");
        _;
    }
    
    modifier goalExists(uint256 goalId) {
        require(goalId < goalCounter, "Goal does not exist");
        _;
    }
    
    modifier goalActive(uint256 goalId) {
        require(goals[goalId].isActive, "Goal is not active");
        _;
    }
    
    function createGoal(
        string memory _name,
        uint256 _targetAmount,
        uint256 _durationInDays
    ) external returns (uint256) {
        require(bytes(_name).length > 0, "Goal name cannot be empty");
        require(_targetAmount > 0, "Target amount must be greater than 0");
        require(_durationInDays > 0, "Duration must be greater than 0");
        
        uint256 goalId = goalCounter++;
        uint256 deadline = block.timestamp + (_durationInDays * 1 days);
        
        goals[goalId] = Goal({
            name: _name,
            targetAmount: _targetAmount,
            savedAmount: 0,
            deadline: deadline,
            creator: msg.sender,
            isAchieved: false,
            isActive: true,
            createdAt: block.timestamp
        });
        
        userGoals[msg.sender].push(goalId);
        
        emit GoalCreated(goalId, msg.sender, _name, _targetAmount, deadline);
        
        return goalId;
    }
    
    function contribute(uint256 goalId) external payable goalExists(goalId) goalActive(goalId) {
        require(msg.value > 0, "Contribution must be greater than 0");
        require(block.timestamp <= goals[goalId].deadline, "Goal deadline has passed");
        
        Goal storage goal = goals[goalId];
        goal.savedAmount += msg.value;
        
        goalContributions[goalId].push(Contribution({
            contributor: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp
        }));
        
        emit ContributionMade(goalId, msg.sender, msg.value);
        
        // Check if goal is achieved (80% of target)
        uint256 achievementAmount = (goal.targetAmount * ACHIEVEMENT_THRESHOLD) / 100;
        if (goal.savedAmount >= achievementAmount && !goal.isAchieved) {
            goal.isAchieved = true;
            emit GoalAchieved(goalId, goal.savedAmount);
        }
    }
    
    function withdraw(uint256 goalId) external goalExists(goalId) onlyGoalCreator(goalId) {
        Goal storage goal = goals[goalId];
        require(goal.savedAmount > 0, "No funds to withdraw");
        require(goal.isAchieved || block.timestamp > goal.deadline, "Goal not achieved or deadline not reached");
        
        uint256 amount = goal.savedAmount;
        goal.savedAmount = 0;
        goal.isActive = false;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Withdrawal failed");
        
        emit FundsWithdrawn(goalId, msg.sender, amount);
    }
    
    function getGoal(uint256 goalId) external view goalExists(goalId) returns (
        string memory name,
        uint256 targetAmount,
        uint256 savedAmount,
        uint256 deadline,
        address creator,
        bool isAchieved,
        bool isActive,
        uint256 createdAt
    ) {
        Goal memory goal = goals[goalId];
        return (
            goal.name,
            goal.targetAmount,
            goal.savedAmount,
            goal.deadline,
            goal.creator,
            goal.isAchieved,
            goal.isActive,
            goal.createdAt
        );
    }
    
    function getUserGoals(address user) external view returns (uint256[] memory) {
        return userGoals[user];
    }
    
    function getGoalContributions(uint256 goalId) external view goalExists(goalId) returns (Contribution[] memory) {
        return goalContributions[goalId];
    }
    
    function getGoalProgress(uint256 goalId) external view goalExists(goalId) returns (uint256 percentage) {
        Goal memory goal = goals[goalId];
        if (goal.targetAmount == 0) return 0;
        return (goal.savedAmount * 100) / goal.targetAmount;
    }
    
    function getAllActiveGoals() external view returns (uint256[] memory) {
        uint256[] memory activeGoals = new uint256[](goalCounter);
        uint256 activeCount = 0;
        
        for (uint256 i = 0; i < goalCounter; i++) {
            if (goals[i].isActive && block.timestamp <= goals[i].deadline) {
                activeGoals[activeCount] = i;
                activeCount++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](activeCount);
        for (uint256 i = 0; i < activeCount; i++) {
            result[i] = activeGoals[i];
        }
        
        return result;
    }
    
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    // Emergency function - only for contract owner (optional)
    address public owner;
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    function emergencyWithdraw() external onlyOwner {
        (bool success, ) = payable(owner).call{value: address(this).balance}("");
        require(success, "Emergency withdrawal failed");
    }
}