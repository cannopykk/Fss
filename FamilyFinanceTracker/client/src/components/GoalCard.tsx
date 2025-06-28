import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Trophy, Clock, Coins } from "lucide-react";
import { Goal } from "@/hooks/useGoals";
import { PiNetworkIntegration } from "@/components/PiNetworkIntegration";

interface GoalCardProps {
  goal: Goal;
  onContribute: (goal: Goal) => void;
  onWithdraw: (goal: Goal) => void;
  onViewDetails: (goal: Goal) => void;
  userAddress?: string;
}

export function GoalCard({ goal, onContribute, onWithdraw, onViewDetails, userAddress }: GoalCardProps) {
  const progressPercentage = Math.round((parseFloat(goal.savedAmount) / parseFloat(goal.targetAmount)) * 100);
  const isCreator = userAddress === goal.creatorAddress;
  const deadlineDate = new Date(goal.deadline);
  const isExpired = new Date() > deadlineDate;
  const daysRemaining = Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  const getStatusBadge = () => {
    if (goal.isAchieved) {
      return <Badge className="bg-success bg-opacity-10 text-success">Achieved</Badge>;
    }
    if (isExpired) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    if (daysRemaining <= 7) {
      return <Badge className="bg-warning bg-opacity-10 text-warning">Expiring Soon</Badge>;
    }
    return <Badge className="bg-secondary bg-opacity-10 text-secondary">Active</Badge>;
  };

  const getProgressColor = () => {
    if (goal.isAchieved) return "bg-success";
    if (daysRemaining <= 7) return "bg-warning";
    return "bg-primary";
  };

  const formatDate = (date: string | Date) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) {
        return "Invalid Date";
      }
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{goal.name}</h3>
            {goal.description && (
              <p className="text-sm text-gray-500">{goal.description}</p>
            )}
          </div>
          {getStatusBadge()}
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">Progress</span>
            <div className="flex items-center space-x-1 space-x-reverse">
              {goal.isAchieved && <Trophy className="w-4 h-4 text-achievement" />}
              <span className="text-sm font-bold text-gray-900">{progressPercentage}%</span>
            </div>
          </div>
          <Progress 
            value={progressPercentage} 
            className={`h-2 ${getProgressColor()}`}
          />
        </div>

        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-xs text-gray-500">Saved</p>
            <p className="text-lg font-bold text-success">{parseFloat(goal.savedAmount).toFixed(4)} ETH</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Target</p>
            <p className="text-lg font-bold text-gray-900">{parseFloat(goal.targetAmount).toFixed(4)} ETH</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">{formatDate(goal.deadline)}</span>
          </div>
          {daysRemaining > 0 && !goal.isAchieved && (
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">{daysRemaining} days remaining</span>
            </div>
          )}
        </div>

        {goal.isAchieved && (
          <div className="bg-gradient-to-r from-achievement to-purple-600 rounded-lg p-3 mb-4 text-white">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Trophy className="w-5 h-5" />
              <div>
                <p className="text-sm font-medium">You earned an NFT reward!</p>
                <p className="text-xs opacity-90">Golden Saving Achievement Badge</p>
              </div>
            </div>
          </div>
        )}

        {!goal.isAchieved && daysRemaining <= 7 && daysRemaining > 0 && (
          <div className="bg-warning bg-opacity-10 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Clock className="w-4 h-4 text-warning" />
              <p className="text-sm text-warning font-medium">
                {daysRemaining} days left to deadline
              </p>
            </div>
          </div>
        )}

        <div className="flex space-x-2 space-x-reverse">
          {goal.isAchieved ? (
            <>
              {isCreator && (
                <Button 
                  onClick={() => onWithdraw(goal)}
                  className="flex-1 bg-success hover:bg-green-600 text-white"
                >
                  Withdraw Funds
                </Button>
              )}
              <Button 
                onClick={() => onViewDetails(goal)}
                className="bg-achievement hover:bg-purple-700 text-white"
              >
                View NFT
              </Button>
            </>
          ) : (
            <>
              <Button 
                onClick={() => onContribute(goal)}
                className={`flex-1 ${daysRemaining <= 7 ? 'bg-warning hover:bg-yellow-500' : 'bg-primary hover:bg-primary-light'} text-white`}
                disabled={isExpired}
              >
                {daysRemaining <= 7 ? 'Urgent Contribution' : 'Contribute'}
              </Button>
              <Button 
                onClick={() => onViewDetails(goal)}
                variant="outline"
              >
                Details
              </Button>
            </>
          )}
        </div>

        {/* Pi Network Integration */}
        {!goal.isAchieved && !isExpired && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <PiNetworkIntegration 
              goalName={goal.name}
              onPaymentSuccess={(amount) => {
                // Convert Pi payment to ETH contribution (for demo purposes)
                // In a real app, you'd handle Pi payments separately
                console.log(`Pi payment of ${amount} Pi received for ${goal.name}`);
              }}
              className="border-0 bg-transparent p-0"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}