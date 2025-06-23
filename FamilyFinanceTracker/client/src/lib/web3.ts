
import { ethers, BrowserProvider, Contract, formatEther, parseEther } from "ethers";
import { FAMILY_SAVER_ABI, DEFAULT_CONTRACT_ADDRESS, NETWORKS } from "./constants";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export class Web3Service {
  private provider: BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private contract: Contract | null = null;
  private contractAddress: string;

  constructor(contractAddress: string = DEFAULT_CONTRACT_ADDRESS) {
    this.contractAddress = contractAddress;
  }

  async connectWallet(): Promise<{ success: boolean; address?: string; error?: string }> {
    if (!window.ethereum) {
      return {
        success: false,
        error: "Please install MetaMask to continue"
      };
    }

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      this.provider = new BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();

      const address = await this.signer.getAddress();

      // Check and switch to Web5Layer network
      const switchResult = await this.switchToWeb5Layer();
      if (!switchResult.success) {
        console.warn("Could not switch to Web5Layer network:", switchResult.error);
      }

      // Initialize contract
      this.contract = new Contract(
        this.contractAddress,
        FAMILY_SAVER_ABI,
        this.signer
      );

      return {
        success: true,
        address
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to connect wallet"
      };
    }
  }

  async switchToWeb5Layer(): Promise<{ success: boolean; error?: string }> {
    if (!window.ethereum) {
      return { success: false, error: "MetaMask not available" };
    }

    try {
      const web5LayerConfig = NETWORKS.web5layer;

      // Try to switch to the network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${web5LayerConfig.chainId.toString(16)}` }],
      });

      return { success: true };
    } catch (error: any) {
      // If the network doesn't exist, add it
      if (error.code === 4902) {
        try {
          const web5LayerConfig = NETWORKS.web5layer;
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${web5LayerConfig.chainId.toString(16)}`,
              chainName: web5LayerConfig.name,
              rpcUrls: [web5LayerConfig.rpcUrl],
              blockExplorerUrls: web5LayerConfig.blockExplorer ? [web5LayerConfig.blockExplorer] : null,
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18,
              },
            }],
          });
          return { success: true };
        } catch (addError: any) {
          return { success: false, error: addError.message };
        }
      }
      return { success: false, error: error.message };
    }
  }

  async getCurrentNetwork(): Promise<{ chainId: number; name: string }> {
    if (!this.provider) {
      throw new Error("Provider not initialized");
    }

    const network = await this.provider.getNetwork();
    const chainId = Number(network.chainId);
    const networkConfig = Object.values(NETWORKS).find(n => n.chainId === chainId);

    return {
      chainId,
      name: networkConfig?.name || `Unknown (${chainId})`
    };
  }

  async createGoal(name: string, targetEth: string, durationInDays: number): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
    console.log("web3Service.createGoal called with:", { name, targetEth, durationInDays });
    
    if (!this.contract) {
      console.error("Contract not initialized");
      return { success: false, error: "Smart contract not connected. Please connect your wallet and try again." };
    }

    if (!this.signer) {
      console.error("Signer not available");
      return { success: false, error: "Wallet not connected. Please connect your wallet and try again." };
    }

    try {
      // Check network first
      const network = await this.getCurrentNetwork();
      if (network.chainId !== 9000) {
        console.log("Wrong network, attempting to switch...");
        const switchResult = await this.switchToWeb5Layer();
        if (!switchResult.success) {
          return { success: false, error: "Please switch to Web5Layer network (Chain ID: 9000)" };
        }
        // Reinitialize contract with new network
        this.contract = new Contract(
          this.contractAddress,
          FAMILY_SAVER_ABI,
          this.signer
        );
      }

      // Validate inputs before sending transaction
      if (!name.trim()) {
        return { success: false, error: "Goal name cannot be empty" };
      }
      if (parseFloat(targetEth) <= 0) {
        return { success: false, error: "Target amount must be greater than 0" };
      }
      if (durationInDays <= 0) {
        return { success: false, error: "Duration must be greater than 0 days" };
      }

      console.log("Converting targetEth to Wei:", targetEth);
      const targetWei = parseEther(targetEth);
      console.log("Target Wei:", targetWei.toString());
      
      // Check wallet balance first
      const balance = await this.signer.provider.getBalance(await this.signer.getAddress());
      console.log("Wallet balance:", formatEther(balance), "ETH");
      
      // Check if contract exists by calling a view function first
      try {
        const goalCounter = await this.contract.goalCounter();
        console.log("Contract is accessible, goal counter:", goalCounter.toString());
      } catch (contractError: any) {
        console.error("Contract access error:", contractError);
        return { 
          success: false, 
          error: "Contract not found at this address. Please check if the contract is deployed correctly on Web5Layer." 
        };
      }
      
      console.log("Sending transaction directly without gas estimation...");
      const tx = await this.contract.createGoal(name, targetWei, durationInDays, {
        gasLimit: BigInt(500000), // Use fixed gas limit
        gasPrice: parseEther("0.000000020") // 20 gwei
      });
      
      console.log("Transaction sent, waiting for confirmation...", tx.hash);
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);

      return {
        success: true,
        transactionHash: tx.hash
      };
    } catch (error: any) {
      console.error("Detailed error creating goal:", {
        error,
        message: error.message,
        reason: error.reason,
        code: error.code,
        data: error.data
      });
      
      let errorMessage = "Failed to create goal";
      
      if (error.code === "CALL_EXCEPTION" && error.message.includes("invalid opcode")) {
        errorMessage = "Contract incompatibility detected. The contract may need to be redeployed with correct Solidity compiler settings.";
      } else if (error.reason) {
        errorMessage = error.reason;
      } else if (error.data && error.data.message) {
        errorMessage = error.data.message;
      } else if (error.message) {
        if (error.message.includes("user rejected")) {
          errorMessage = "Transaction was rejected by user";
        } else if (error.message.includes("insufficient funds")) {
          errorMessage = "Insufficient funds for gas fees";
        } else if (error.message.includes("execution reverted")) {
          errorMessage = "Transaction failed - please check your inputs and network connection";
        } else if (error.message.includes("network")) {
          errorMessage = "Network error - please check your connection to Web5Layer";
        } else if (error.message.includes("missing revert data")) {
          errorMessage = "Contract error - please check if the contract is properly deployed and compatible";
        } else {
          errorMessage = error.message;
        }
      }
      
      console.log("Returning error:", errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  async contribute(goalId: number, amountEth: string): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
    if (!this.contract) {
      return { success: false, error: "Smart contract not connected" };
    }

    try {
      if (parseFloat(amountEth) <= 0) {
        return { success: false, error: "Contribution amount must be greater than 0" };
      }

      const amountWei = parseEther(amountEth);
      
      // Estimate gas first
      const gasEstimate = await this.contract.contribute.estimateGas(goalId, { value: amountWei });
      
      const tx = await this.contract.contribute(goalId, { 
        value: amountWei,
        gasLimit: gasEstimate + BigInt(50000)
      });
      
      await tx.wait();

      return {
        success: true,
        transactionHash: tx.hash
      };
    } catch (error: any) {
      console.error("Error contributing:", error);
      
      let errorMessage = "Failed to contribute";
      
      if (error.reason) {
        errorMessage = error.reason;
      } else if (error.message) {
        if (error.message.includes("user rejected")) {
          errorMessage = "Transaction was rejected by user";
        } else if (error.message.includes("insufficient funds")) {
          errorMessage = "Insufficient funds for transaction";
        } else if (error.message.includes("Goal does not exist")) {
          errorMessage = "Goal does not exist";
        } else if (error.message.includes("Goal is not active")) {
          errorMessage = "Goal is no longer active";
        } else if (error.message.includes("Goal deadline has passed")) {
          errorMessage = "Goal deadline has passed";
        } else {
          errorMessage = error.message;
        }
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  async withdraw(goalId: number): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
    if (!this.contract) {
      return { success: false, error: "Smart contract not connected" };
    }

    try {
      const tx = await this.contract.withdraw(goalId);
      await tx.wait();

      return {
        success: true,
        transactionHash: tx.hash
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to withdraw funds"
      };
    }
  }

  async getUserGoals(address: string): Promise<{ success: boolean; goalIds?: number[]; error?: string }> {
    if (!this.contract) {
      return { success: false, error: "Smart contract not connected" };
    }

    try {
      const goalIds = await this.contract.getUserGoals(address);
      return {
        success: true,
        goalIds: goalIds.map((id: bigint) => Number(id))
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to fetch goals"
      };
    }
  }

  async getGoalDetails(goalId: number): Promise<{ success: boolean; goal?: any; error?: string }> {
    if (!this.contract) {
      return { success: false, error: "Smart contract not connected" };
    }

    try {
      const goal = await this.contract.getGoal(goalId);
      return {
        success: true,
        goal: {
          name: goal.name,
          targetAmount: formatEther(goal.targetAmount),
          savedAmount: formatEther(goal.savedAmount),
          deadline: goal.deadline,
          creator: goal.creator,
          isAchieved: goal.isAchieved,
          isActive: goal.isActive,
          createdAt: goal.createdAt
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to fetch goal details"
      };
    }
  }

  async getGoal(goalId: number): Promise<{ success: boolean; goal?: any; error?: string }> {
    return this.getGoalDetails(goalId);
  }

  async getGoalContributions(goalId: number): Promise<{ success: boolean; contributions?: any[]; error?: string }> {
    if (!this.contract) {
      return { success: false, error: "Smart contract not connected" };
    }

    try {
      const contributions = await this.contract.getGoalContributions(goalId);
      return {
        success: true,
        contributions: contributions.map((contrib: any) => ({
          contributor: contrib.contributor,
          amount: formatEther(contrib.amount),
          timestamp: new Date(Number(contrib.timestamp) * 1000)
        }))
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to fetch contributions"
      };
    }
  }

  async getAddress(): Promise<string | null> {
    if (!this.signer) return null;
    try {
      return await this.signer.getAddress();
    } catch {
      return null;
    }
  }

  isConnected(): boolean {
    return this.provider !== null && this.signer !== null;
  }
}

export const web3Service = new Web3Service();
