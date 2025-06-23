import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  targetAmount: decimal("target_amount", { precision: 18, scale: 8 }).notNull(),
  savedAmount: decimal("saved_amount", { precision: 18, scale: 8 }).default("0").notNull(),
  deadline: timestamp("deadline").notNull(),
  creatorAddress: text("creator_address").notNull(),
  isAchieved: boolean("is_achieved").default(false).notNull(),
  contractGoalId: integer("contract_goal_id"),
  durationInDays: integer("duration_in_days").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contributions = pgTable("contributions", {
  id: serial("id").primaryKey(),
  goalId: integer("goal_id").notNull().references(() => goals.id),
  contributorAddress: text("contributor_address").notNull(),
  amount: decimal("amount", { precision: 18, scale: 8 }).notNull(),
  transactionHash: text("transaction_hash").notNull(),
  blockNumber: integer("block_number"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const nftRewards = pgTable("nft_rewards", {
  id: serial("id").primaryKey(),
  goalId: integer("goal_id").notNull().references(() => goals.id),
  recipientAddress: text("recipient_address").notNull(),
  tokenId: integer("token_id").notNull(),
  transactionHash: text("transaction_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertGoalSchema = createInsertSchema(goals).omit({
  id: true,
  savedAmount: true,
  isAchieved: true,
  contractGoalId: true,
  createdAt: true,
}).extend({
  deadline: z.string().transform((str) => new Date(str))
});

export const insertContributionSchema = createInsertSchema(contributions).omit({
  id: true,
  createdAt: true,
});

export const insertNftRewardSchema = createInsertSchema(nftRewards).omit({
  id: true,
  createdAt: true,
});

export type Goal = typeof goals.$inferSelect;
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Contribution = typeof contributions.$inferSelect;
export type InsertContribution = z.infer<typeof insertContributionSchema>;
export type NftReward = typeof nftRewards.$inferSelect;
export type InsertNftReward = z.infer<typeof insertNftRewardSchema>;

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
