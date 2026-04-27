'use client';

import React, { useState } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Bitcoin, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ArrowRightLeft, 
  RefreshCcw,
  LayoutGrid,
  List,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  useUser, 
  useCollection, 
  useMemoFirebase, 
  useFirestore 
} from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const tokens = [
  { symbol: 'BTC', name: 'Bitcoin', price: 64231.50, change: 1.2, icon: 'https://picsum.photos/seed/btc/32/32' },
  { symbol: 'ETH', name: 'Ethereum', price: 3421.20, change: 0.8, icon: 'https://picsum.photos/seed/eth/32/32' },
  { symbol: 'SOL', name: 'Solana', price: 142.15, change: -2.4, icon: 'https://picsum.photos/seed/sol/32/32' },
  { symbol: 'USDT', name: 'Tether', price: 1.00, change: 0.0, icon: 'https://picsum.photos/seed/usdt/32/32' },
];

export default function CryptoDashboard() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();

  const holdingsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'cryptoWallets', 'default', 'cryptoHoldings'));
  }, [db, user]);

  const { data: holdings, isLoading } = useCollection(holdingsQuery);

  if (isUserLoading) return null;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <h1 className="text-xl font-bold">Crypto Portfolio</h1>
          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" variant="outline">
              <RefreshCcw className="w-4 h-4 mr-2" />
              Update Prices
            </Button>
            <Button size="sm">
              <ArrowRightLeft className="w-4 h-4 mr-2" />
              Swap Tokens
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6 space-y-6 bg-muted/20">
          {/* Portfolio Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-primary text-primary-foreground shadow-lg border-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium opacity-80">Total Value (USD)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">$12,450.00</div>
                <p className="text-sm mt-1 opacity-90 inline-flex items-center">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  +$1,230 (24h)
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total P/L</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">+$2,105.50</div>
                <p className="text-xs text-muted-foreground mt-1 font-medium">
                  +18.4% since inception
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Connected Wallets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2 Active</div>
                <p className="text-xs text-muted-foreground mt-1 inline-flex items-center">
                  <Wallet className="w-3 h-3 mr-1" />
                  MetaMask, WalletConnect
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="holdings" className="w-full">
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="holdings">My Holdings</TabsTrigger>
                <TabsTrigger value="market">Market Prices</TabsTrigger>
                <TabsTrigger value="activity">Recent Activity</TabsTrigger>
              </TabsList>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-primary bg-primary/10">
                  <LayoutGrid className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <TabsContent value="holdings" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {isLoading ? (
                  Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-xl" />)
                ) : holdings && holdings.length > 0 ? (
                  holdings.map((holding) => (
                    <Card key={holding.id} className="group hover:border-primary/50 transition-colors">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                              {holding.tokenSymbol[0]}
                            </div>
                            <div>
                              <CardTitle className="text-sm">{holding.tokenName}</CardTitle>
                              <CardDescription className="text-[10px]">{holding.tokenSymbol}</CardDescription>
                            </div>
                          </div>
                          <Badge variant={holding.pnl >= 0 ? 'default' : 'destructive'} className="text-[10px]">
                            {holding.pnl >= 0 ? '+' : ''}{((holding.pnl / (holding.balance * holding.avgBuyPrice)) * 100).toFixed(1)}%
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="mt-2">
                          <div className="text-xl font-bold">${(holding.balance * holding.currentPrice).toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">{holding.balance} {holding.tokenSymbol}</div>
                        </div>
                        <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-2 text-[10px]">
                          <div>
                            <span className="text-muted-foreground block">Avg Price</span>
                            <span className="font-semibold">${holding.avgBuyPrice.toLocaleString()}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-muted-foreground block">Current</span>
                            <span className="font-semibold">${holding.currentPrice.toLocaleString()}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-4 py-20 flex flex-col items-center justify-center bg-card border rounded-xl border-dashed">
                    <Bitcoin className="w-12 h-12 text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground font-medium">No holdings yet</p>
                    <Button variant="link" size="sm" className="mt-2">Go to Market to Buy</Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="market">
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-muted-foreground font-medium bg-muted/30">
                          <th className="px-6 py-4 text-left">Asset</th>
                          <th className="px-6 py-4 text-right">Price</th>
                          <th className="px-6 py-4 text-right">24h Change</th>
                          <th className="px-6 py-4 text-right">Market Cap</th>
                          <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tokens.map((token) => (
                          <tr key={token.symbol} className="border-b hover:bg-muted/10 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <img src={token.icon} alt={token.name} className="w-8 h-8 rounded-full" />
                                <div>
                                  <div className="font-bold">{token.name}</div>
                                  <div className="text-xs text-muted-foreground">{token.symbol}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right font-semibold">
                              ${token.price.toLocaleString()}
                            </td>
                            <td className={`px-6 py-4 text-right font-medium ${token.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {token.change >= 0 ? '+' : ''}{token.change}%
                            </td>
                            <td className="px-6 py-4 text-right text-muted-foreground">
                              $1.2T
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Button size="sm" variant="outline">Buy</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
