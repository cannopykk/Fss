# Family Smart Saver - Blockchain Savings Platform

A blockchain-based family savings platform where family members can create shared savings goals, contribute funds, and earn NFT rewards upon achievement.

## Features

- 🎯 Create and manage savings goals
- 💰 Contribute to family goals using Ethereum
- 🏆 Earn NFT rewards when goals are achieved
- 📊 Real-time dashboard with progress tracking
- 🌐 Arabic RTL interface
- 🔐 MetaMask wallet integration

## Prerequisites

Before running this application, make sure you have:

- Node.js (v18 or higher)
- npm or yarn
- MetaMask browser extension
- Git

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd family-smart-saver
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=5000
```

### 4. Start the Development Server

```bash
npm run dev
```

This will start both the backend server and frontend development server.

### 5. Access the Application

Open your browser and navigate to:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

## Blockchain Setup (Optional)

To use the full blockchain functionality:

### 1. Install Hardhat (for local blockchain)

```bash
npm install --global hardhat
```

### 2. Set up Local Blockchain

In a separate terminal, run:

```bash
# Start local Hardhat network
npx hardhat node
```

### 3. Deploy Smart Contract

In another terminal:

```bash
# Deploy the contract to local network
npx hardhat run scripts/deploy.js --network localhost
```

### 4. Configure MetaMask

1. Open MetaMask
2. Add a new network with these settings:
   - Network Name: Localhost 8545
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 31337
   - Currency Symbol: ETH

## Project Structure

```
family-smart-saver/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility libraries
│   │   ├── pages/          # Application pages
│   │   └── ...
│   └── index.html
├── server/                 # Backend Express server
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Data storage layer
│   └── vite.ts            # Vite integration
├── shared/                # Shared types and schemas
│   └── schema.ts          # Database schema definitions
├── contracts/             # Smart contracts (optional)
│   └── FamilySaver.sol    # Main contract
└── package.json
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run compile` - Compile smart contracts
- `npm run deploy` - Deploy smart contracts

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Wouter (routing)
- **Backend**: Node.js, Express, TypeScript
- **Blockchain**: Ethereum, Hardhat, ethers.js
- **Database**: In-memory storage (can be extended to PostgreSQL)
- **UI Components**: shadcn/ui, Radix UI

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License