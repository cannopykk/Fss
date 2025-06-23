import { Wallet, PiggyBank, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "@/hooks/useWallet";
import { web3Service } from "@/lib/web3";
import { useState, useEffect } from "react";

export function Header() {
  const { isConnected, address, isConnecting, connectWallet } = useWallet();
  const [currentNetwork, setCurrentNetwork] = useState<{ chainId: number; name: string } | null>(null);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  useEffect(() => {
    const fetchNetwork = async () => {
      if (isConnected && web3Service.isConnected()) {
        try {
          const network = await web3Service.getCurrentNetwork();
          setCurrentNetwork(network);
        } catch (error) {
          console.warn("Could not fetch network:", error);
        }
      } else {
        setCurrentNetwork(null);
      }
    };

    fetchNetwork();
  }, [isConnected]);

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="bg-primary rounded-full p-2">
              <PiggyBank className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Family Smart Saver</h1>
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {/* Network Display */}
            {currentNetwork && (
              <Badge 
                variant={currentNetwork.name === "Web5Layer" ? "default" : "secondary"}
                className={`${currentNetwork.name === "Web5Layer" ? "bg-primary text-white" : ""}`}
              >
                <Globe className="w-3 h-3 mr-1" />
                {currentNetwork.name}
              </Badge>
            )}

            {isConnected && address && (
              <div className="hidden md:flex items-center space-x-3 bg-gray-100 rounded-lg px-3 py-2">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Wallet Connected</span>
                <span className="text-sm font-mono text-gray-800">{formatAddress(address)}</span>
              </div>
            )}
            <Button 
              onClick={connectWallet}
              disabled={isConnecting}
              className="bg-primary hover:bg-primary-light text-white"
            >
              <Wallet className="w-4 h-4 mr-2" />
              {isConnecting ? "Connecting..." : isConnected ? "Connected" : "Connect Wallet"}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}