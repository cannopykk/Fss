# Family Smart Saver - External Deployment Guide

## Overview
This is a complete Web5Layer blockchain-based family savings platform with Arabic RTL interface. The application allows families to create shared savings goals, contribute WEB5 tokens, and earn rewards when goals are achieved.

## Prerequisites
- Node.js 18.0.0 or higher
- npm or yarn package manager
- MetaMask wallet with Web5Layer network configured
- WEB5 tokens for transactions

## Web5Layer Network Configuration
Configure MetaMask with these settings:
- **Network Name**: Web5Layer
- **RPC URL**: https://rpc.web5layer.xyz
- **Chain ID**: 8984
- **Currency Symbol**: WEB5
- **Block Explorer**: https://explorer.web5layer.xyz

## Installation Steps

### 1. Extract and Install Dependencies
```bash
# Extract the ZIP file
unzip family-smart-saver.zip
cd family-smart-saver

# Install dependencies
npm install
```

### 2. Deploy Smart Contract
1. Open [Remix IDE](https://remix.ethereum.org)
2. Create new file `FamilySmartSaver.sol`
3. Copy contract code from the project root
4. Compile with Solidity 0.8.19+
5. Deploy to Web5Layer network using MetaMask
6. Copy the deployed contract address

### 3. Configure Contract Address
Edit `client/src/lib/constants.ts`:
```typescript
export const DEFAULT_CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
```

### 4. Run Development Server
```bash
# Start both frontend and backend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### 5. Production Build
```bash
# Build for production
npm run build

# Start production server
npm start
```

## Project Structure
```
family-smart-saver/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities and Web3 integration
│   │   ├── pages/          # Application pages
│   │   └── index.css       # Global styles with RTL support
├── server/                 # Express.js backend
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   └── storage.ts         # Data storage layer
├── shared/                # Shared types and schemas
├── FamilySmartSaver.sol   # Smart contract
└── package.json           # Dependencies
```

## Key Features
- **Arabic RTL Interface**: Complete right-to-left layout
- **Web5Layer Integration**: Native WEB5 token support
- **MetaMask Connection**: Seamless wallet integration
- **Smart Contract**: Secure on-chain savings goals
- **Family Collaboration**: Multiple contributors per goal
- **Achievement System**: 80% completion threshold
- **Real-time Updates**: Live progress tracking

## Smart Contract Functions
- `createGoal()` - Create new savings goal
- `contribute()` - Add WEB5 tokens to goals
- `withdraw()` - Withdraw achieved goal funds
- `getGoal()` - View goal details
- `getUserGoals()` - List user's goals

## API Endpoints
- `GET /api/goals` - Fetch all goals
- `POST /api/goals` - Create new goal
- `POST /api/contributions` - Add contribution
- `GET /api/contributions/:goalId` - Get goal contributions

## Environment Variables
Create `.env` file if needed:
```
NODE_ENV=development
PORT=5000
```

## Troubleshooting

### Common Issues
1. **MetaMask not connecting**: Ensure Web5Layer network is added
2. **Contract not found**: Verify contract address in constants.ts
3. **Transaction failing**: Check WEB5 token balance
4. **Port conflicts**: Change ports in vite.config.ts and server files

### Web3 Integration
- Automatic network detection
- Seamless MetaMask integration
- Real-time transaction status
- Error handling for failed transactions

## Security Notes
- Contract includes emergency withdrawal function
- Only goal creators can withdraw funds
- All transactions are recorded on-chain
- 80% achievement threshold prevents early withdrawal

## Support
- Ensure you have sufficient WEB5 tokens for gas fees
- Test with small amounts before large transactions
- Check Web5Layer network status if experiencing issues

## License
MIT License - Feel free to modify and distribute as needed.