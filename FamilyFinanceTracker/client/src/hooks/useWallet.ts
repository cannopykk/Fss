import { useState, useEffect } from "react";
import { web3Service } from "@/lib/web3";

export function useWallet() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      // Check if already connected
      if (web3Service.isConnected()) {
        setIsConnected(true);
        try {
          const addr = await web3Service.getAddress();
          setAddress(addr);
        } catch (error) {
          console.error('Error getting address:', error);
        }
      } else if (window.ethereum) {
        // Check if MetaMask is connected but web3Service isn't initialized
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            // Try to reconnect
            const result = await web3Service.connectWallet();
            if (result.success && result.address) {
              setIsConnected(true);
              setAddress(result.address);
            }
          }
        } catch (error) {
          console.error('Error checking MetaMask connection:', error);
        }
      }
    };

    checkConnection();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setIsConnected(true);
        } else {
          setAddress(null);
          setIsConnected(false);
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);

    const result = await web3Service.connectWallet();
    
    if (result.success && result.address) {
      setIsConnected(true);
      setAddress(result.address);
    } else {
      setError(result.error || "Connection failed");
    }

    setIsConnecting(false);
  };

  const disconnect = () => {
    setIsConnected(false);
    setAddress(null);
    setError(null);
  };

  return {
    isConnected,
    address,
    isConnecting,
    error,
    connectWallet,
    disconnect
  };
}
