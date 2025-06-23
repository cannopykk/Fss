import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Goal } from "@/hooks/useGoals";
import { Info } from "lucide-react";

interface ContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: Goal | null;
  onContribute: (contributionData: {
    goalId: number;
    contractGoalId: number;
    amount: string;
    contributorAddress: string;
  }) => void;
  userAddress?: string;
  isContributing?: boolean;
}

export function ContributionModal({ 
  isOpen, 
  onClose, 
  goal,
  onContribute, 
  userAddress,
  isContributing = false 
}: ContributionModalProps) {
  const [amount, setAmount] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!userAddress) {
      toast({
        title: "Error",
        description: "You must connect your wallet first",
        variant: "destructive"
      });
      return;
    }

    if (!goal) {
      toast({
        title: "Error",
        description: "Goal not found",
        variant: "destructive"
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    if (!goal.contractGoalId && goal.contractGoalId !== 0) {
      toast({
        title: "Error",
        description: "Invalid smart contract ID",
        variant: "destructive"
      });
      return;
    }

    onContribute({
      goalId: goal.id,
      contractGoalId: goal.contractGoalId,
      amount,
      contributorAddress: userAddress
    });

    // Reset form
    setAmount("");
  };

  const handleClose = () => {
    setAmount("");
    onClose();
  };

  const setQuickAmount = (value: string) => {
    setAmount(value);
  };

  if (!goal) return null;

  const progressPercentage = Math.round((parseFloat(goal.savedAmount) / parseFloat(goal.targetAmount)) * 100);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-4 font-arabic">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Contribute to Goal
          </DialogTitle>
        </DialogHeader>

        <div className="mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">{goal.name}</h4>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Current Progress:</span>
              <span>
                {parseFloat(goal.savedAmount).toFixed(4)} / {parseFloat(goal.targetAmount).toFixed(4)} ETH ({progressPercentage}%)
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Contribution Amount (ETH)
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="text-2xl font-bold text-center"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setQuickAmount("0.1")}
              className="text-sm"
            >
              0.1 ETH
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setQuickAmount("0.5")}
              className="text-sm"
            >
              0.5 ETH
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setQuickAmount("1.0")}
              className="text-sm"
            >
              1.0 ETH
            </Button>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 space-x-reverse text-sm text-blue-700">
              <Info className="w-4 h-4" />
              <p>The transaction will be executed via smart contract</p>
            </div>
          </div>

          <div className="flex space-x-4 space-x-reverse pt-4">
            <Button 
              type="submit" 
              className="flex-1 bg-primary hover:bg-primary-light text-white flex items-center justify-center space-x-2 space-x-reverse"
              disabled={isContributing}
            >
              <span>⟠</span>
              <span>{isContributing ? "Contributing..." : "Confirm Contribution"}</span>
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={handleClose}
              disabled={isContributing}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}