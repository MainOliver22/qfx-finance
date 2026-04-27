
'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Wallet, Shield, Link as LinkIcon, Loader2 } from 'lucide-react';
import { useConnect, useAccount } from 'wagmi';
import { useToast } from '@/hooks/use-toast';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletConnectModal({ isOpen, onClose }: WalletConnectModalProps) {
  const { connectors, connect, isPending, status } = useConnect();
  const { isConnected } = useAccount();
  const { toast } = useToast();

  React.useEffect(() => {
    if (isConnected) {
      onClose();
    }
  }, [isConnected, onClose]);

  const handleConnect = (connector: any) => {
    connect({ connector }, {
      onSuccess: () => {
        toast({
          title: 'Wallet Connected',
          description: `Successfully linked your ${connector.name} wallet.`,
        });
      },
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: 'Connection Failed',
          description: error.message,
        });
      }
    });
  };

  const getIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'metamask': return <Wallet className="w-6 h-6 text-orange-600" />;
      case 'coinbase wallet': return <Shield className="w-6 h-6 text-indigo-600" />;
      default: return <LinkIcon className="w-6 h-6 text-blue-600" />;
    }
  };

  const getBg = (name: string) => {
    switch (name.toLowerCase()) {
      case 'metamask': return 'bg-orange-100';
      case 'coinbase wallet': return 'bg-indigo-100';
      default: return 'bg-blue-100';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Web3 Wallet</DialogTitle>
          <DialogDescription>
            Choose your preferred wallet to sync your external assets.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {connectors.map((connector) => (
            <Button 
              key={connector.uid}
              variant="outline" 
              className="h-16 justify-start gap-4 px-4 hover:border-primary transition-all"
              onClick={() => handleConnect(connector)}
              disabled={isPending}
            >
              <div className={`w-10 h-10 rounded-full ${getBg(connector.name)} flex items-center justify-center`}>
                {getIcon(connector.name)}
              </div>
              <div className="text-left">
                <div className="font-bold">{connector.name}</div>
                <div className="text-xs text-muted-foreground">Secure connection</div>
              </div>
            </Button>
          ))}
        </div>
        {isPending && (
          <div className="flex flex-col items-center justify-center gap-2 py-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-sm font-medium">Awaiting approval in wallet...</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
