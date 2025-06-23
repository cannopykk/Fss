import { 
  goals, 
  contributions, 
  nftRewards, 
  users,
  type Goal, 
  type InsertGoal, 
  type Contribution, 
  type InsertContribution, 
  type NftReward, 
  type InsertNftReward,
  type User, 
  type InsertUser 
} from "@shared/schema";

export interface IStorage {
  // Goals
  getGoal(id: number): Promise<Goal | undefined>;
  getGoalsByCreator(creatorAddress: string): Promise<Goal[]>;
  getAllGoals(): Promise<Goal[]>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: number, updates: Partial<Goal>): Promise<Goal | undefined>;

  // Contributions
  getContribution(id: number): Promise<Contribution | undefined>;
  getContributionsByGoal(goalId: number): Promise<Contribution[]>;
  getContributionsByAddress(contributorAddress: string): Promise<Contribution[]>;
  createContribution(contribution: InsertContribution): Promise<Contribution>;

  // NFT Rewards
  getNftReward(id: number): Promise<NftReward | undefined>;
  getNftRewardsByGoal(goalId: number): Promise<NftReward[]>;
  getNftRewardsByAddress(recipientAddress: string): Promise<NftReward[]>;
  createNftReward(reward: InsertNftReward): Promise<NftReward>;

  // Users (existing)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

export class MemStorage implements IStorage {
  private goals: Map<number, Goal>;
  private contributions: Map<number, Contribution>;
  private nftRewards: Map<number, NftReward>;
  private users: Map<number, User>;
  private currentGoalId: number;
  private currentContributionId: number;
  private currentNftRewardId: number;
  private currentUserId: number;

  constructor() {
    this.goals = new Map();
    this.contributions = new Map();
    this.nftRewards = new Map();
    this.users = new Map();
    this.currentGoalId = 1;
    this.currentContributionId = 1;
    this.currentNftRewardId = 1;
    this.currentUserId = 1;
  }

  // Goals
  async getGoal(id: number): Promise<Goal | undefined> {
    return this.goals.get(id);
  }

  async getGoalsByCreator(creatorAddress: string): Promise<Goal[]> {
    return Array.from(this.goals.values()).filter(
      (goal) => goal.creatorAddress.toLowerCase() === creatorAddress.toLowerCase()
    );
  }

  async getAllGoals(): Promise<Goal[]> {
    return Array.from(this.goals.values());
  }

  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    const id = this.currentGoalId++;
    const goal: Goal = {
      ...insertGoal,
      id,
      savedAmount: "0",
      isAchieved: false,
      contractGoalId: null,
      createdAt: new Date()
    };
    this.goals.set(id, goal);
    return goal;
  }

  async updateGoal(id: number, updates: Partial<Goal>): Promise<Goal | undefined> {
    const existingGoal = this.goals.get(id);
    if (!existingGoal) return undefined;

    const updatedGoal = { ...existingGoal, ...updates };
    this.goals.set(id, updatedGoal);
    return updatedGoal;
  }

  // Contributions
  async getContribution(id: number): Promise<Contribution | undefined> {
    return this.contributions.get(id);
  }

  async getContributionsByGoal(goalId: number): Promise<Contribution[]> {
    return Array.from(this.contributions.values()).filter(
      (contribution) => contribution.goalId === goalId
    );
  }

  async getContributionsByAddress(contributorAddress: string): Promise<Contribution[]> {
    return Array.from(this.contributions.values()).filter(
      (contribution) => contribution.contributorAddress.toLowerCase() === contributorAddress.toLowerCase()
    );
  }

  async createContribution(insertContribution: InsertContribution): Promise<Contribution> {
    const id = this.currentContributionId++;
    const contribution: Contribution = {
      ...insertContribution,
      id,
      createdAt: new Date()
    };
    this.contributions.set(id, contribution);

    // Update goal's saved amount
    const goal = this.goals.get(contribution.goalId);
    if (goal) {
      const newSavedAmount = (parseFloat(goal.savedAmount) + parseFloat(contribution.amount)).toString();
      const targetAmount = parseFloat(goal.targetAmount);
      const savedAmount = parseFloat(newSavedAmount);

      // Check if goal is achieved (80% or more)
      const isAchieved = savedAmount >= (targetAmount * 0.8);

      this.goals.set(goal.id, {
        ...goal,
        savedAmount: newSavedAmount,
        isAchieved
      });
    }

    return contribution;
  }

  // NFT Rewards
  async getNftReward(id: number): Promise<NftReward | undefined> {
    return this.nftRewards.get(id);
  }

  async getNftRewardsByGoal(goalId: number): Promise<NftReward[]> {
    return Array.from(this.nftRewards.values()).filter(
      (reward) => reward.goalId === goalId
    );
  }

  async getNftRewardsByAddress(recipientAddress: string): Promise<NftReward[]> {
    return Array.from(this.nftRewards.values()).filter(
      (reward) => reward.recipientAddress.toLowerCase() === recipientAddress.toLowerCase()
    );
  }

  async createNftReward(insertNftReward: InsertNftReward): Promise<NftReward> {
    const id = this.currentNftRewardId++;
    const nftReward: NftReward = {
      ...insertNftReward,
      id,
      createdAt: new Date()
    };
    this.nftRewards.set(id, nftReward);
    return nftReward;
  }

  // Users (existing methods)
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
}

export const storage = new MemStorage();