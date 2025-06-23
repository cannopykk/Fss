import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGoal: (goalData: {
    name: string;
    description?: string;
    targetAmount: string;
    deadline: Date;
    creatorAddress: string;
    durationInDays: number;
  }) => Promise<any>;
  userAddress?: string;
  isCreating?: boolean;
}

export function CreateGoalModal({ 
  isOpen, 
  onClose, 
  onCreateGoal, 
  userAddress,
  isCreating = false 
}: CreateGoalModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    targetAmount: "",
    deadline: ""
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userAddress) {
      toast({
        title: "Error",
        description: "Please connect your wallet first",
        variant: "destructive"
      });
      return;
    }

    if (!formData.name || !formData.targetAmount || !formData.deadline) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const deadlineDate = new Date(formData.deadline);
    const today = new Date();
    const durationInDays = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (durationInDays <= 0) {
      toast({
        title: "Error",
        description: "Deadline must be in the future",
        variant: "destructive"
      });
      return;
    }

    if (parseFloat(formData.targetAmount) <= 0) {
      toast({
        title: "Error",
        description: "Target amount must be greater than zero",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log("Creating goal with data:", {
        name: formData.name,
        description: formData.description || undefined,
        targetAmount: formData.targetAmount,
        deadline: deadlineDate,
        creatorAddress: userAddress,
        durationInDays
      });

      await onCreateGoal({
        name: formData.name,
        description: formData.description || undefined,
        targetAmount: formData.targetAmount,
        deadline: deadlineDate,
        creatorAddress: userAddress,
        durationInDays
      });

      // Reset form only on success
      setFormData({
        name: "",
        description: "",
        targetAmount: "",
        deadline: ""
      });
      onClose();

      toast({
        title: "Success!",
        description: "Your savings goal has been created successfully.",
      });

    } catch (error: any) {
      console.error("Error creating goal:", error);

      let errorMessage = "Failed to create goal";

      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.reason) {
        errorMessage = error.reason;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      description: "",
      targetAmount: "",
      deadline: ""
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-4">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Create New Savings Goal
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Goal Name *
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Example: New Car"
              required
            />
          </div>

          <div>
            <Label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Goal Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Write a brief description of the goal..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="targetAmount" className="block text-sm font-medium text-gray-700 mb-2">
              Target Amount (ETH) *
            </Label>
            <Input
              id="targetAmount"
              type="number"
              step="0.01"
              min="0.01"
              value={formData.targetAmount}
              onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <Label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-2">
              Goal Deadline *
            </Label>
            <Input
              id="deadline"
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <Button 
              type="submit" 
              className="flex-1 bg-primary hover:bg-primary-light text-white"
              disabled={isCreating}
            >
              {isCreating ? "Creating..." : "Create Goal"}
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={handleClose}
              disabled={isCreating}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}