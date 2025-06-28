
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Target, Filter, Wallet, TrendingUp, Trophy, Gift, Coins } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/hooks/useWallet";
import { useGoals, Goal } from "@/hooks/useGoals";
import { GoalCard } from "@/components/GoalCard";
import { CreateGoalModal } from "@/components/CreateGoalModal";
import { ContributionModal } from "@/components/ContributionModal";
import { PiNetworkIntegration } from "@/components/PiNetworkIntegration";

export default function Dashboard() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  
  const { toast } = useToast();
  const { address, isConnected, connectWallet } = useWallet();
  const { 
    goals, 
    isLoading, 
    stats, 
    createGoal, 
    isCreating, 
    contribute, 
    isContributing, 
    withdraw, 
    isWithdrawing,
    refetch
  } = useGoals(address);

  // Auto-refresh goals every 30 seconds
  useEffect(() => {
    if (isConnected && address) {
      const interval = setInterval(() => {
        refetch();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [isConnected, address, refetch]);

  const handleCreateGoal = async (goalData: any) => {
    try {
      const result = await createGoal(goalData);
      setShowCreateModal(false);
      return result;
    } catch (error: any) {
      console.error("Dashboard handleCreateGoal error:", error);
      throw error;
    }
  };

  const handleContribute = (goal: Goal) => {
    setSelectedGoal(goal);
    setShowContributionModal(true);
  };

  const handleContributionSubmit = async (amount: string) => {
    if (!selectedGoal) return;

    try {
      await contribute({
        goalId: selectedGoal.id,
        contractGoalId: selectedGoal.contractGoalId || 0,
        amount,
        contributorAddress: address || ""
      });
      
      setShowContributionModal(false);
      setSelectedGoal(null);
      toast({
        title: "Success!",
        description: `Contributed ${amount} ETH to ${selectedGoal.name}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to contribute",
        variant: "destructive"
      });
    }
  };

  const handleWithdraw = async (goal: Goal) => {
    try {
      await withdraw({
        goalId: goal.id,
        contractGoalId: goal.contractGoalId || 0
      });
      
      toast({
        title: "Success!",
        description: `Funds withdrawn from ${goal.name}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to withdraw funds",
        variant: "destructive"
      });
    }
  };

  const handleViewDetails = (goal: Goal) => {
    // For now, just show a toast with goal details
    toast({
      title: goal.name,
      description: `Target: ${parseFloat(goal.targetAmount).toFixed(4)} ETH | Progress: ${goal.progress}%`,
    });
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <div className="bg-primary bg-opacity-10 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Wallet className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Connect Your Wallet
            </h2>
            <p className="text-gray-600 mb-6">
              Connect your Web3 wallet to start saving for your family's goals and earn NFT rewards!
            </p>
            <Button 
              onClick={connectWallet}
              className="w-full bg-primary hover:bg-primary-light text-white"
            >
              <Wallet className="w-4 h-4 mr-2" />
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Goals</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalGoals}</p>
                </div>
                <Target className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Saved</p>
                  <p className="text-2xl font-bold text-success">{stats.totalSaved} ETH</p>
                </div>
                <TrendingUp className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-achievement">{stats.completedGoals}</p>
                </div>
                <Trophy className="w-8 h-8 text-achievement" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">NFT Rewards</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.nftRewards}</p>
                </div>
                <Gift className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">Savings Goals</h2>
          <div className="flex space-x-3">
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-primary hover:bg-primary-light text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Goal
            </Button>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {/* Goals Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-300 rounded mb-4"></div>
                  <div className="h-2 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 bg-gray-300 rounded mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : goals.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Target className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Goals Yet
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start by creating your family's first savings goal and earn NFT rewards when you achieve it!
            </p>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-primary hover:bg-primary-light text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Goal
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onContribute={handleContribute}
                onWithdraw={handleWithdraw}
                onViewDetails={handleViewDetails}
                userAddress={address}
              />
            ))}
          </div>
        )}

        {/* Pi Network Integration Section */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Pi Network Integration</h3>
          <PiNetworkIntegration 
            goalName="General Family Savings"
            onPaymentSuccess={(amount) => {
              toast({
                title: "Pi Payment Received! 🥧",
                description: `Successfully received ${amount} Pi coins for family savings`,
              });
            }}
          />
        </div>

        {/* Modals */}
        <CreateGoalModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreateGoal={handleCreateGoal}
          userAddress={address}
          isCreating={isCreating}
        />

        <ContributionModal
          isOpen={showContributionModal}
          onClose={() => {
            setShowContributionModal(false);
            setSelectedGoal(null);
          }}
          onContribute={handleContributionSubmit}
          goal={selectedGoal}
          isContributing={isContributing}
        />
      </div>
    </div>
  );
}
