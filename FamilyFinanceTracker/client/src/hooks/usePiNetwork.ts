import { useState, useEffect, useCallback } from 'react';

// Pi Network types
interface PiUser {
  uid: string;
  username: string;
}

interface PiPayment {
  identifier: string;
  user_uid: string;
  amount: number;
  memo: string;
  metadata: Record<string, any>;
  from_address: string;
  to_address: string;
  direction: string;
  created_at: string;
  network: string;
  status: {
    developer_approved: boolean;
    transaction_verified: boolean;
    developer_completed: boolean;
    cancelled: boolean;
    user_cancelled: boolean;
  };
  transaction?: {
    txid: string;
    verified: boolean;
    _link: string;
  };
}

interface PiPaymentData {
  amount: number;
  memo: string;
  metadata?: Record<string, any>;
}

interface PiPaymentCallbacks {
  onReadyForServerApproval: (paymentId: string) => void;
  onReadyForServerCompletion: (paymentId: string, txid: string) => void;
  onCancel: (paymentId: string) => void;
  onError: (error: Error, payment?: PiPayment) => void;
}

// Declare Pi SDK globally
declare global {
  interface Window {
    Pi?: {
      authenticate: (scopes: string[], callbacks?: any) => Promise<PiUser>;
      createPayment: (paymentData: PiPaymentData, callbacks: PiPaymentCallbacks) => Promise<PiPayment>;
      init: (config: any) => void;
    };
  }
}

export const usePiNetwork = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<PiUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPiAvailable, setIsPiAvailable] = useState(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  const apiBaseUrl = 'https://poetic-rugelach-73213f.netlify.app/.netlify/functions/pi-proxy';

  // Check if Pi SDK is available
  useEffect(() => {
    const checkPiAvailability = () => {
      if (typeof window !== 'undefined' && window.Pi) {
        setIsPiAvailable(true);
        console.log('Pi SDK loaded successfully');
        checkAuthStatus();
      } else {
        console.log('Pi SDK not available - likely not in Pi Browser');
        setIsPiAvailable(false);
      }
    };

    // Check immediately
    checkPiAvailability();

    // Also check after a delay in case SDK loads asynchronously
    const timer = setTimeout(checkPiAvailability, 1000);

    return () => clearTimeout(timer);
  }, []);

  const checkAuthStatus = useCallback(async () => {
    if (!window.Pi) return;

    try {
      setIsLoading(true);
      const user = await window.Pi.authenticate(['username', 'payments'], {
        onIncompletePaymentFound: (payment: PiPayment) => {
          console.log('Incomplete payment found:', payment);
          handleIncompletePayment(payment);
        }
      });
      
      setUserInfo(user);
      setIsAuthenticated(true);
      console.log('User authenticated:', user);
    } catch (error) {
      console.log('Authentication check failed:', error);
      setIsAuthenticated(false);
      setUserInfo(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const authenticateUser = useCallback(async () => {
    if (!window.Pi) {
      throw new Error('Pi SDK not available');
    }

    try {
      setIsLoading(true);
      const user = await window.Pi.authenticate(['username', 'payments'], {
        onIncompletePaymentFound: (payment: PiPayment) => {
          console.log('Incomplete payment found:', payment);
          handleIncompletePayment(payment);
        }
      });

      setUserInfo(user);
      setIsAuthenticated(true);
      console.log('User authenticated successfully:', user);
      return user;
    } catch (error) {
      console.error('Authentication failed:', error);
      setIsAuthenticated(false);
      setUserInfo(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const makePayment = useCallback(async (paymentData: PiPaymentData) => {
    if (!window.Pi) {
      throw new Error('Pi SDK not available');
    }

    if (!isAuthenticated) {
      throw new Error('Please connect to Pi Network first');
    }

    try {
      setIsPaymentProcessing(true);

      const payment = await window.Pi.createPayment(paymentData, {
        onReadyForServerApproval: (paymentId: string) => {
          console.log('Payment ready for server approval:', paymentId);
          approvePaymentOnServer(paymentId);
        },
        onReadyForServerCompletion: (paymentId: string, txid: string) => {
          console.log('Payment ready for server completion:', paymentId, txid);
          completePaymentOnServer(paymentId, txid);
        },
        onCancel: (paymentId: string) => {
          console.log('Payment cancelled:', paymentId);
          setIsPaymentProcessing(false);
          throw new Error('Payment was cancelled');
        },
        onError: (error: Error, payment?: PiPayment) => {
          console.error('Payment error:', error, payment);
          setIsPaymentProcessing(false);
          throw error;
        }
      });

      console.log('Payment created:', payment);
      return payment;
    } catch (error) {
      setIsPaymentProcessing(false);
      throw error;
    }
  }, [isAuthenticated]);

  const approvePaymentOnServer = async (paymentId: string) => {
    try {
      const response = await fetch(apiBaseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'approve',
          paymentId: paymentId
        })
      });

      const result = await response.json();
      console.log('Server approval response:', result);

      if (!result.success) {
        throw new Error(result.error || 'Server approval failed');
      }
    } catch (error) {
      console.error('Server approval failed:', error);
      setIsPaymentProcessing(false);
      throw new Error('Payment approval failed on server');
    }
  };

  const completePaymentOnServer = async (paymentId: string, txid: string) => {
    try {
      const response = await fetch(apiBaseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'complete',
          paymentId: paymentId,
          txid: txid
        })
      });

      const result = await response.json();
      console.log('Server completion response:', result);

      if (result.success) {
        setIsPaymentProcessing(false);
        return result;
      } else {
        throw new Error(result.error || 'Server completion failed');
      }
    } catch (error) {
      console.error('Server completion failed:', error);
      setIsPaymentProcessing(false);
      throw new Error('Payment completion failed on server');
    }
  };

  const handleIncompletePayment = (payment: PiPayment) => {
    console.log('Handling incomplete payment:', payment);
    // Handle incomplete payments here
    // You might want to show a modal or notification to the user
  };

  return {
    isAuthenticated,
    userInfo,
    isLoading,
    isPiAvailable,
    isPaymentProcessing,
    authenticateUser,
    makePayment,
    checkAuthStatus
  };
};

