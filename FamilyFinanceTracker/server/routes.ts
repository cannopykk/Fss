import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGoalSchema, insertContributionSchema, insertNftRewardSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all goals for a user
  app.get("/api/goals/:userAddress?", async (req, res) => {
    try {
      const { userAddress } = req.params;
      
      let goals;
      if (userAddress) {
        goals = await storage.getGoalsByCreator(userAddress);
      } else {
        goals = await storage.getAllGoals();
      }

      // Calculate progress and status for each goal
      const goalsWithProgress = goals.map(goal => {
        const progress = Math.round((parseFloat(goal.savedAmount) / parseFloat(goal.targetAmount)) * 100);
        const now = new Date();
        const deadline = new Date(goal.deadline);
        const daysRemaining = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        let status: 'active' | 'achieved' | 'expired' | 'near_deadline' = 'active';
        
        if (goal.isAchieved) {
          status = 'achieved';
        } else if (now > deadline) {
          status = 'expired';
        } else if (daysRemaining <= 7) {
          status = 'near_deadline';
        }

        return {
          ...goal,
          progress,
          status,
          deadline: goal.deadline.toISOString()
        };
      });

      res.json(goalsWithProgress);
    } catch (error) {
      console.error("Error fetching goals:", error);
      res.status(500).json({ message: "Failed to fetch goals" });
    }
  });

  // Create a new goal
  app.post("/api/goals", async (req, res) => {
    try {
      const validatedData = insertGoalSchema.parse(req.body);
      const goal = await storage.createGoal(validatedData);
      res.status(201).json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid goal data", errors: error.errors });
      } else {
        console.error("Error creating goal:", error);
        res.status(500).json({ message: "Failed to create goal" });
      }
    }
  });

  // Get goal by ID
  app.get("/api/goals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const goal = await storage.getGoal(id);
      
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }

      res.json(goal);
    } catch (error) {
      console.error("Error fetching goal:", error);
      res.status(500).json({ message: "Failed to fetch goal" });
    }
  });

  // Update a goal
  app.put("/api/goals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const updatedGoal = await storage.updateGoal(id, updates);
      
      if (!updatedGoal) {
        return res.status(404).json({ message: "Goal not found" });
      }

      res.json(updatedGoal);
    } catch (error) {
      console.error("Error updating goal:", error);
      res.status(500).json({ message: "Failed to update goal" });
    }
  });

  // Get contributions for a goal
  app.get("/api/contributions/:goalId?", async (req, res) => {
    try {
      const { goalId } = req.params;
      const { address } = req.query;

      let contributions;
      
      if (goalId) {
        contributions = await storage.getContributionsByGoal(parseInt(goalId));
      } else if (address) {
        contributions = await storage.getContributionsByAddress(address as string);
      } else {
        return res.status(400).json({ message: "Either goalId or address parameter is required" });
      }

      res.json(contributions);
    } catch (error) {
      console.error("Error fetching contributions:", error);
      res.status(500).json({ message: "Failed to fetch contributions" });
    }
  });

  // Create a new contribution
  app.post("/api/contributions", async (req, res) => {
    try {
      const validatedData = insertContributionSchema.parse(req.body);
      const contribution = await storage.createContribution(validatedData);
      res.status(201).json(contribution);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid contribution data", errors: error.errors });
      } else {
        console.error("Error creating contribution:", error);
        res.status(500).json({ message: "Failed to create contribution" });
      }
    }
  });

  // Get NFT rewards for a user or goal
  app.get("/api/nft-rewards", async (req, res) => {
    try {
      const { goalId, address } = req.query;

      let rewards;
      
      if (goalId) {
        rewards = await storage.getNftRewardsByGoal(parseInt(goalId as string));
      } else if (address) {
        rewards = await storage.getNftRewardsByAddress(address as string);
      } else {
        return res.status(400).json({ message: "Either goalId or address parameter is required" });
      }

      res.json(rewards);
    } catch (error) {
      console.error("Error fetching NFT rewards:", error);
      res.status(500).json({ message: "Failed to fetch NFT rewards" });
    }
  });

  // Create a new NFT reward
  app.post("/api/nft-rewards", async (req, res) => {
    try {
      const validatedData = insertNftRewardSchema.parse(req.body);
      const reward = await storage.createNftReward(validatedData);
      res.status(201).json(reward);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid NFT reward data", errors: error.errors });
      } else {
        console.error("Error creating NFT reward:", error);
        res.status(500).json({ message: "Failed to create NFT reward" });
      }
    }
  });

  // Get recent activities (mock endpoint for demo)
  app.get("/api/activities", async (req, res) => {
    try {
      // In a real app, this would aggregate data from contributions, achievements, etc.
      const activities = [
        {
          id: 1,
          type: 'contribution',
          message: 'Ahmed contributed 0.5 ETH to goal "New Family Car"',
          amount: '+0.5 ETH',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          icon: 'plus',
          color: 'success'
        },
        {
          id: 2,
          type: 'achievement',
          message: 'Goal "Summer Family Vacation" achieved and NFT reward received!',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          icon: 'trophy',
          color: 'achievement'
        },
        {
          id: 3,
          type: 'goal_created',
          message: 'New goal "Home Renovation" created',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          icon: 'target',
          color: 'secondary'
        }
      ];

      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
