
'use client';

import React, { useState } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, Zap, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { collection, doc, writeBatch, serverTimestamp, getDocs, deleteDoc, query } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function SeedingPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);

  const seedData = async () => {
    if (!user || !db) return;
    setIsSeeding(true);

    try {
      const batch = writeBatch(db);

      // 1. Create Fiat Transactions (20+)
      const fiatAccountsSnap = await getDocs(query(collection(db, 'users', user.uid, 'fiatAccounts')));
      const checkingAcc = fiatAccountsSnap.docs.find(d => d.data().accountType === 'checking');
      
      if (checkingAcc) {
        for (let i = 0; i < 20; i++) {
          const txRef = doc(collection(db, 'users', user.uid, 'fiatAccounts', checkingAcc.id, 'fiatTransactions'));
          const amount = (Math.random() * 500 + 50).toFixed(2);
          const isDeposit = Math.random() > 0.7;
          
          batch.set(txRef, {
            id: txRef.id,
            accountId: checkingAcc.id,
            userId: user.uid,
            type: isDeposit ? 'deposit' : 'transfer',
            amount: isDeposit ? parseFloat(amount) : -parseFloat(amount),
            description: isDeposit ? 'Payroll Deposit' : `Payment to Vendor ${i}`,
            status: 'completed',
            counterpartyName: isDeposit ? 'Employer Inc' : 'Amazon.com',
            createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString()
          });
        }
      }

      // 2. Create Crypto Holdings
      const symbols = ['BTC', 'ETH', 'SOL', 'USDT'];
      for (const symbol of symbols) {
        const holdingRef = doc(collection(db, 'users', user.uid, 'cryptoWallets', 'default', 'cryptoHoldings'));
        const balance = Math.random() * 2;
        const avgPrice = symbol === 'BTC' ? 60000 : symbol === 'ETH' ? 3000 : 100;
        
        batch.set(holdingRef, {
          id: holdingRef.id,
          walletId: 'default',
          userId: user.uid,
          tokenSymbol: symbol,
          tokenName: symbol === 'BTC' ? 'Bitcoin' : symbol === 'ETH' ? 'Ethereum' : symbol,
          balance: balance,
          avgBuyPrice: avgPrice,
          currentPrice: avgPrice * 1.1,
          pnl: balance * avgPrice * 0.1,
          lastUpdated: new Date().toISOString()
        });
      }

      // 3. Create Trading Bots
      const strategies = ['DCA', 'grid', 'momentum'];
      for (const strategy of strategies) {
        const botRef = doc(collection(db, 'users', user.uid, 'tradingBots'));
        batch.set(botRef, {
          id: botRef.id,
          userId: user.uid,
          name: `${strategy.toUpperCase()} Alpha`,
          strategy: strategy,
          status: 'active',
          tradingPair: 'BTC/USD',
          investmentAmount: 5000,
          frequency: 'daily',
          takeProfitPct: 10,
          stopLossPct: 5,
          totalProfit: Math.random() * 1000,
          totalTrades: Math.floor(Math.random() * 50),
          createdAt: new Date().toISOString()
        });
      }

      await batch.commit();
      toast({
        title: 'Seeding Complete',
        description: 'Mock transactions, holdings, and bots have been added.',
      });
    } catch (error: any) {
      console.error('Seeding failed:', error);
      toast({
        variant: 'destructive',
        title: 'Seeding Failed',
        description: error.message,
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <h1 className="text-xl font-bold">Developer Tools</h1>
        </header>

        <main className="flex-1 overflow-auto p-6 space-y-6 bg-muted/20">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                Seed Demo Data
              </CardTitle>
              <CardDescription>
                Populate your current account with 20+ transactions, 4 crypto holdings, and 3 active trading bots.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 flex gap-3">
                <Zap className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  This tool will create realistic historical data spanning the last 30 days. It uses high-performance Firestore batches to ensure atomic updates.
                </p>
              </div>
              <Button 
                onClick={seedData} 
                className="w-full" 
                disabled={isSeeding}
              >
                {isSeeding ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Provisioning...
                  </>
                ) : (
                  'Start Seeding'
                )}
              </Button>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
