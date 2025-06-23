# Family Smart Saver - Local Setup Instructions

## Quick Start Guide

Follow these steps to run the Family Smart Saver application on your local machine:

### Prerequisites
- Node.js (version 18 or higher)
- npm or yarn package manager
- MetaMask browser extension

### Step 1: Download Project Files

Download all the project files to your local machine. The main files you need are:

```
family-smart-saver/
├── client/                 # Frontend React app
├── server/                 # Backend Express server  
├── shared/                 # Shared schemas
├── package.json           # Dependencies
├── vite.config.ts         # Vite configuration
├── tailwind.config.ts     # Tailwind configuration
├── tsconfig.json          # TypeScript configuration
└── server-standalone.ts   # Standalone server file
```

### Step 2: Install Dependencies

Open terminal in the project root directory and run:

```bash
npm install
```

### Step 3: Set Up Environment

Create a `.env` file in the root directory:

```bash
NODE_ENV=development
PORT=5000
```

### Step 4: Start the Application

**Option A: Using the existing setup (recommended)**
```bash
npm run dev
```

**Option B: Using standalone configuration**
```bash
# Terminal 1 - Start backend server
npx tsx server-standalone.ts

# Terminal 2 - Start frontend (in another terminal)
npx vite --config vite.config.standalone.ts
```

### Step 5: Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## MetaMask Configuration

For local blockchain testing:

1. Install MetaMask browser extension
2. Add local network:
   - Network Name: Localhost 8545
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 31337
   - Currency Symbol: ETH

## Features Available

- ✅ Goal creation and management
- ✅ Arabic RTL interface
- ✅ Responsive design
- ✅ Activity feed
- ✅ Statistics dashboard
- ✅ MetaMask wallet connection
- ⚠️ Blockchain functionality (requires local Hardhat network)

## Blockchain Setup (Optional)

For full blockchain functionality:

```bash
# Install Hardhat globally
npm install -g hardhat

# Start local blockchain
npx hardhat node

# Deploy contract (in another terminal)
npx hardhat run scripts/deploy.js --network localhost
```

## Troubleshooting

**Port Already in Use:**
```bash
# Change ports in .env file or kill existing processes
lsof -ti:5000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

**Module Not Found:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**MetaMask Connection Issues:**
- Ensure MetaMask is installed and unlocked
- Switch to the correct network in MetaMask
- Refresh the page after connecting wallet

## Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

The application will be built and served from the `dist` directory.