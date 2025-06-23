
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { web3Service } from "@/lib/web3";

export interface Goal {
  id: number;
  name: string;
  description?: string;
  targetAmount: string;
  savedAmount: string;
  deadline: Date;
  creatorAddress: string;
  isAchieved: boolean;
  contractGoalId?: number;
  progress: number;
  status: 'active' | 'achieved' | 'expired' | 'near_deadline';
}

export function useGoals(userAddress?: string) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch goals from blockchain
  const fetchGoals = async () => {
    if (!userAddress) return;
    
    setIsLoading(true);
    try {
      const result = await web3Service.getUserGoals(userAddress);
      if (result.success && result.goalIds) {
        const goalPromises = result.goalIds.map(async (id) => {
          const goalResult = await web3Service.getGoalDetails(id);
          if (goalResult.success) {
            const goal = goalResult.goal;
            return {
              id: Date.now() + Math.random(), // Generate unique ID
              contractGoalId: id,
              name: goal.name,
              targetAmount: goal.targetAmount,
              savedAmount: goal.savedAmount,
              deadline: new Date(Number(goal.deadline) * 1000),
              creatorAddress: goal.creator,
              isAchieved: goal.isAchieved,
              progress: Math.round((parseFloat(goal.savedAmount) / parseFloat(goal.targetAmount)) * 100),
              status: goal.isAchieved ? 'achieved' : 'active'
            } as Goal;
          }
          return null;
        });
        
        const fetchedGoals = (await Promise.all(goalPromises)).filter(Boolean) as Goal[];
        setGoals(fetchedGoals);
      }
    } catch (error) {
      console.error("Error fetching goals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [userAddress]);

  const createGoal = async (goalData: {
    name: string;
    description?: string;
    targetAmount: string;
    deadline: Date;
    creatorAddress: string;
    durationInDays: number;
  }) => {
    try {
      setIsLoading(true);
      
      console.log("useGoals createGoal called with:", goalData);
      
      // Validate inputs
      if (!goalData.name.trim()) {
        throw new Error("Goal name cannot be empty");
      }
      
      if (!goalData.targetAmount || parseFloat(goalData.targetAmount) <= 0) {
        throw new Error("Target amount must be greater than 0");
      }
      
      if (goalData.durationInDays <= 0) {
        throw new Error("Duration must be greater than 0 days");
      }
      
      // Validate wallet connection
      if (!web3Service.isConnected()) {
        throw new Error("Please connect your wallet first");
      }
      
      console.log("Calling web3Service.createGoal...");
      
      // Create goal on blockchain
      const blockchainResult = await web3Service.createGoal(
        goalData.name,
        goalData.targetAmount,
        goalData.durationInDays
      );

      console.log("Blockchain result:", blockchainResult);

      if (!blockchainResult.success) {
        throw new Error(blockchainResult.error || "Failed to create goal on blockchain");
      }

      // Refresh goals list
      console.log("Refreshing goals list...");
      await fetchGoals();
      
      return { success: true, transactionHash: blockchainResult.transactionHash };
    } catch (error: any) {
      console.error("Error in useGoals createGoal:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const contribute = async (contributionData: {
    goalId: number;
    contractGoalId: number;
    amount: string;
    contributorAddress: string;
  }) => {
    try {
      setIsLoading(true);
      // Contribute on blockchain
      const blockchainResult = await web3Service.contribute(
        contributionData.contractGoalId,
        contributionData.amount
      );

      if (!blockchainResult.success) {
        throw new Error(blockchainResult.error);
      }

      // Refresh goals list
      await fetchGoals();
      
      return { success: true };
    } catch (error: any) {
      console.error("Error contributing:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const withdraw = async (withdrawData: {
    goalId: number;
    contractGoalId: number;
  }) => {
    try {
      setIsLoading(true);
      const blockchainResult = await web3Service.withdraw(withdrawData.contractGoalId);
      
      if (!blockchainResult.success) {
        throw new Error(blockchainResult.error);
      }

      // Refresh goals list
      await fetchGoals();

      return { success: true };
    } catch (error: any) {
      console.error("Error withdrawing:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate statistics
  const stats = {
    totalGoals: goals.length,
    totalSaved: goals.reduce((sum: number, goal: Goal) => sum + parseFloat(goal.savedAmount), 0).toFixed(4),
    completedGoals: goals.filter((goal: Goal) => goal.isAchieved).length,
    nftRewards: goals.filter((goal: Goal) => goal.isAchieved).length
  };

  return {
    goals,
    isLoading,
    error: null,
    stats,
    refetch: fetchGoals,
    createGoal,
    isCreating: isLoading,
    contribute,
    isContributing: isLoading,
    withdraw,
    isWithdrawing: isLoading
  };
}

export function useContributions(goalId?: number) {
  return {
    data: [],
    isLoading: false,
    error: null
  };
}
