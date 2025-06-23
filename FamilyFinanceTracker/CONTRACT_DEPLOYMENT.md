# Family Smart Saver Contract Deployment Guide

## Contract Overview
The `FamilySmartSaver.sol` contract enables family members to create savings goals, contribute WEB5 tokens, and withdraw funds when goals are achieved (80% threshold).

## Key Features
- Create savings goals with target amounts and deadlines
- Family members can contribute WEB5 tokens to any goal
- Automatic achievement detection at 80% of target
- Secure withdrawal system for goal creators
- Complete contribution tracking and history

## Deployment Steps for Web5Layer Network

### Option 1: Using Remix IDE (Recommended)
1. Open [Remix IDE](https://remix.ethereum.org)
2. Create a new file called `FamilySmartSaver.sol`
3. Copy the contract code from the project root
4. Compile with Solidity version 0.8.19+
5. Go to Deploy & Run tab
6. Set Environment to "Injected Web3" (MetaMask)
7. Ensure MetaMask is connected to Web5Layer network:
   - Network Name: Web5Layer
   - RPC URL: https://rpc.web5layer.xyz
   - Chain ID: 8984
   - Currency Symbol: WEB5
8. Deploy the contract
9. Copy the deployed contract address

### Option 2: Using Hardhat (Advanced)
```bash
# Install Hardhat
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Initialize Hardhat project
npx hardhat init

# Add Web5Layer network to hardhat.config.js
```

### Web5Layer Network Configuration
- **Network Name**: Web5Layer
- **RPC URL**: https://rpc.web5layer.xyz
- **Chain ID**: 8984
- **Currency Symbol**: WEB5
- **Block Explorer**: https://explorer.web5layer.xyz (if available)

## After Deployment

1. **Save the Contract Address**: You'll receive a contract address after deployment
2. **Update Application**: Replace the default address in `client/src/lib/constants.ts`
3. **Test Functions**: Try creating a goal with small amounts first
4. **Verify Contract**: Use the block explorer to verify deployment

## Contract Functions

### Main Functions
- `createGoal(name, targetAmount, durationInDays)` - Create new savings goal
- `contribute(goalId)` - Contribute WEB5 to a goal (payable)
- `withdraw(goalId)` - Withdraw funds when goal achieved
- `getGoal(goalId)` - Get goal details
- `getUserGoals(address)` - Get all goals for an address
- `getAllActiveGoals()` - Get all active goals

### View Functions
- `getGoalContributions(goalId)` - Get contribution history
- `getGoalProgress(goalId)` - Get completion percentage
- `getContractBalance()` - Get total contract balance

## Gas Estimates (Approximate)
- Deploy Contract: ~2,000,000 gas
- Create Goal: ~200,000 gas
- Contribute: ~100,000 gas
- Withdraw: ~80,000 gas

## Security Features
- Only goal creators can withdraw their goal funds
- Goals must reach 80% to be withdrawable before deadline
- All contributions are tracked with timestamps
- Emergency withdraw function for contract owner

## Next Steps
After deploying, update your application with the new contract address and test the integration with small amounts of WEB5 tokens.