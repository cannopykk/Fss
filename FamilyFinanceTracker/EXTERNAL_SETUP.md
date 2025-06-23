# Family Smart Saver - External Setup Instructions

## Package Contents
Your downloadable package includes:
- Complete React frontend with Arabic RTL interface
- Express.js backend server
- Smart contract for Web5Layer blockchain
- All necessary configuration files
- Deployment guides and documentation

## Quick Setup (5 minutes)

### 1. Extract and Install
```bash
# Extract the package
tar -xzf family-smart-saver-web5layer.tar.gz
cd family-smart-saver-web5layer

# Rename package file
mv package-external.json package.json
mv vite.config.external.ts vite.config.ts
mv server-external.ts server.ts

# Install dependencies
npm install
```

### 2. Deploy Smart Contract
1. Open Remix IDE: https://remix.ethereum.org
2. Upload `FamilySmartSaver.sol`
3. Compile with Solidity 0.8.19+
4. Connect MetaMask to Web5Layer network:
   - RPC: https://rpc.web5layer.xyz
   - Chain ID: 8984
   - Symbol: WEB5
5. Deploy contract and copy the address

### 3. Configure Contract Address
Edit `client/src/lib/constants.ts`:
```typescript
export const DEFAULT_CONTRACT_ADDRESS = "YOUR_CONTRACT_ADDRESS_HERE";
```

### 4. Start Application
```bash
# Development mode (recommended for testing)
npm run dev

# Production mode
npm run build
npm start
```

Access your application at http://localhost:3000

## Key Features Ready
✅ Web5Layer blockchain integration
✅ Arabic RTL interface
✅ MetaMask wallet connection
✅ Smart contract for family savings goals
✅ Real-time progress tracking
✅ Secure contribution system

## Support Files Included
- `FamilySmartSaver.sol` - Smart contract code
- `CONTRACT_DEPLOYMENT.md` - Detailed contract deployment guide
- `DEPLOYMENT_GUIDE.md` - Complete setup instructions
- All source code with Web5Layer configuration

## Next Steps
1. Deploy your contract to Web5Layer
2. Update the contract address in the configuration
3. Test with small WEB5 amounts
4. Share with your family members

Your application is now ready to run independently outside of Replit!