import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, Coins, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { usePiNetwork } from '@/hooks/usePiNetwork';
import { useToast } from '@/hooks/use-toast';

interface PiNetworkIntegrationProps {
  onPaymentSuccess?: (amount: number) => void;
  goalName?: string;
  className?: string;
}

export const PiNetworkIntegration = ({ 
  onPaymentSuccess, 
  goalName = "Family Goal",
  className = "" 
}: PiNetworkIntegrationProps) => {
  const [paymentAmount, setPaymentAmount] = useState<number>(1);
  const { toast } = useToast();
  
  const {
    isAuthenticated,
    userInfo,
    isLoading,
    isPiAvailable,
    isPaymentProcessing,
    authenticateUser,
    makePayment
  } = usePiNetwork();

  const handleConnect = async () => {
    try {
      await authenticateUser();
      toast({
        title: "Success!",
        description: "Connected to Pi Network successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to Pi Network",
        variant: "destructive"
      });
    }
  };

  const handlePayment = async () => {
    try {
      const paymentData = {
        amount: paymentAmount,
        memo: `Family Smart Saver - Contribution to ${goalName}`,
        metadata: {
          type: "family_savings_contribution",
          goal: goalName,
          timestamp: new Date().toISOString()
        }
      };

      await makePayment(paymentData);
      
      toast({
        title: "Payment Successful! 🎉",
        description: `Contributed ${paymentAmount} Pi to ${goalName}`,
      });

      if (onPaymentSuccess) {
        onPaymentSuccess(paymentAmount);
      }
    } catch (error: any) {
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process Pi payment",
        variant: "destructive"
      });
    }
  };

  // Show fallback message if Pi SDK is not available
  if (!isPiAvailable) {
    return (
      <Card className={`border-orange-200 bg-orange-50 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-100 p-2 rounded-full">
              <Coins className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-orange-900">Pi Network Integration Available!</h4>
              <p className="text-sm text-orange-700">
                Open this app in the Pi Browser to connect your Pi wallet and make Pi payments.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Coins className="w-6 h-6 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Pi Network</h3>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              ✓ Verified
            </Badge>
          </div>
          {isAuthenticated && userInfo && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Welcome, {userInfo.username}!</span>
            </div>
          )}
        </div>

        {!isAuthenticated ? (
          <div className="space-y-4">
            <p className="text-gray-600">
              Connect your Pi wallet to contribute Pi coins to your family savings goals.
            </p>
            <Button 
              onClick={handleConnect}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect with Pi
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pi Amount
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter amount"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-gray-500 text-sm">π</span>
                  </div>
                </div>
              </div>
            </div>

            <Button 
              onClick={handlePayment}
              disabled={isPaymentProcessing || paymentAmount <= 0}
              className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white"
            >
              {isPaymentProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <Coins className="w-4 h-4 mr-2" />
                  Pay {paymentAmount} Pi
                </>
              )}
            </Button>

            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <AlertCircle className="w-3 h-3" />
              <span>Payments are processed securely through Pi Network</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

