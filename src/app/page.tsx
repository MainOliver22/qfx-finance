'use client';

import React, { useEffect, useState } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  TrendingUp, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Cpu, 
  Plus,
  RefreshCcw,
  CreditCard,
  ArrowRightLeft,
  Bitcoin,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Loader2,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  useUser, 
  useCollection, 
  useMemoFirebase, 
  useFirestore 
} from '@/firebase';
import { collection, query, orderBy, limit, where } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { usePriceFeed } from '@/hooks/use-price-feed';
import { getFinancialAdvice, type AdvisorOutput } from '@/ai/flows/financial-advisor';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const prices = usePriceFeed();

  const [aiAdvice, setAiAdvice] = useState<AdvisorOutput | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const fiatAccountsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'fiatAccounts'));
  }, [db, user]);

  const cryptoHoldingsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'cryptoWallets', 'default', 'cryptoHoldings'));
  }, [db, user]);

  const botsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'tradingBots'));
  }, [db, user]);

  const { data: fiatAccounts, isLoading: fiatLoading } = useCollection(fiatAccountsQuery);
  const { data: cryptoHoldings, isLoading: cryptoLoading } = useCollection(cryptoHoldingsQuery);
  const { data: bots } = useCollection(botsQuery);

  // We query transactions from the first available account to avoid complex collectionGroup index requirements
  const primaryAccountId = fiatAccounts && fiatAccounts.length > 0 ? fiatAccounts[0].id : null;
  
  const recentTransactionsQuery = useMemoFirebase(() => {
    if (!db || !user || !primaryAccountId) return null;
    return query(
      collection(db, 'users', user.uid, 'fiatAccounts', primaryAccountId, 'fiatTransactions'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
  }, [db, user, primaryAccountId]);

  const { data: recentTransactions, isLoading: txLoading } = useCollection(recentTransactionsQuery);

  const totalFiatBalance = fiatAccounts?.reduce((acc, curr) => acc + (curr.balance || 0), 0) || 0;
  const totalCryptoValue = cryptoHoldings?.reduce((acc, curr) => {
    const livePrice = prices.find(p => p.symbol === curr.tokenSymbol)?.price || curr.currentPrice;
    return acc + (curr.balance * livePrice || 0);
  }, 0) || 0;

  const generateAdvice = async () => {
    if (isAiLoading) return;
    setIsAiLoading(true);
    try {
      const advice = await getFinancialAdvice({
        fiatBalance: totalFiatBalance,
        cryptoValue: totalCryptoValue,
        activeBots: bots?.filter(b => b.status === 'active').length || 0,
        riskProfile: 'Moderate-Growth',
      });
      setAiAdvice(advice);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <RefreshCcw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
          <SidebarTrigger className="-ml-1" />
          <div className="flex flex-col">
            <h1 className="text-lg font-black leading-none text-slate-800 tracking-tight">Good Morning, {user.displayName?.split(' ')[0]}</h1>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase font-black tracking-widest flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-green-600 fill-green-600/20" />
              Institutional Mode Active
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" variant="outline" className="hidden sm:flex border-primary/20 hover:bg-primary/5 font-bold" onClick={() => router.push('/admin/seed')}>
              <RefreshCcw className="w-4 h-4 mr-2" />
              Developer Tools
            </Button>
            <Button size="sm" onClick={() => router.push('/transfer')} className="font-bold shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4 mr-2" />
              New Transfer
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6 space-y-6 bg-muted/20">
          {/* Ticker Marquee */}
          <div className="w-full overflow-hidden bg-card border border-slate-200/60 rounded-xl p-3 flex items-center gap-12 whitespace-nowrap text-[11px] font-black tracking-widest uppercase">
            {prices.map(token => (
              <div key={token.symbol} className="flex items-center gap-3">
                <span className="text-slate-400">{token.symbol}/USD</span>
                <span className={token.change24h >= 0 ? 'text-green-600 font-black' : 'text-red-600 font-black'}>
                  ${token.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  <span className="ml-1.5 opacity-70">({token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(1)}%)</span>
                </span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Core Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="shadow-lg border-slate-200/60 bg-white/50 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Traditional Fiat</CardTitle>
                    <Wallet className="w-4 h-4 text-primary opacity-40" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-black text-slate-900 tracking-tighter">
                      {fiatLoading ? <Skeleton className="h-8 w-32" /> : `$${totalFiatBalance.toLocaleString()}`}
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-slate-200/60 bg-white/50 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Crypto Portfolio</CardTitle>
                    <TrendingUp className="w-4 h-4 text-green-500 opacity-40" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-black text-slate-900 tracking-tighter">
                      {cryptoLoading ? <Skeleton className="h-8 w-32" /> : `$${totalCryptoValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-slate-200/60 bg-white/50 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Net APY</CardTitle>
                    <Cpu className="w-4 h-4 text-orange-500 opacity-40" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-black text-slate-900 tracking-tighter">8.42%</div>
                  </CardContent>
                </Card>
              </div>

              {/* AI Advisor Card */}
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-4">
                  <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                </div>
                <CardHeader>
                  <CardTitle className="text-lg font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                    AI Portfolio Strategy
                  </CardTitle>
                  <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Generative Financial Insights based on your unique profile</CardDescription>
                </CardHeader>
                <CardContent>
                  {aiAdvice ? (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                      <p className="text-sm font-medium leading-relaxed text-slate-700 italic border-l-2 border-primary/30 pl-4 bg-primary/5 py-3 rounded-r-lg">
                        "{aiAdvice.summary}"
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Strategic Steps</h4>
                          <ul className="space-y-1">
                            {aiAdvice.recommendations.map((rec, i) => (
                              <li key={i} className="text-xs flex items-center gap-2 font-bold text-slate-600">
                                <ChevronRight className="w-3 h-3 text-primary" /> {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Risk Outlook</h4>
                          <p className="text-xs font-bold text-slate-600 leading-relaxed">{aiAdvice.riskAssessment}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setAiAdvice(null)} className="text-[10px] font-black uppercase tracking-widest p-0 h-auto">
                        Refresh Advice
                      </Button>
                    </div>
                  ) : (
                    <div className="py-6 flex flex-col items-center justify-center text-center gap-4">
                      <div className="p-3 rounded-full bg-primary/10 text-primary">
                        <Cpu className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-black text-slate-800 uppercase tracking-tight">Analyze My Portfolio</p>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest max-w-xs">
                          Our AI engine will analyze your fiat liquidity and crypto volatility to suggest institutional moves.
                        </p>
                      </div>
                      <Button onClick={generateAdvice} disabled={isAiLoading} className="font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                        {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                        {isAiLoading ? 'Analyzing...' : 'Generate Insights'}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Transaction List */}
              <Card className="shadow-lg border-slate-200/60 bg-white">
                <CardHeader>
                  <CardTitle className="text-lg font-black tracking-tight text-slate-900 uppercase">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {txLoading ? (
                      Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)
                    ) : recentTransactions && recentTransactions.length > 0 ? (
                      recentTransactions.map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-50 bg-slate-50/30 hover:bg-white hover:shadow-sm transition-all group">
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-full ${tx.amount > 0 ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                              {tx.amount > 0 ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                            </div>
                            <div>
                              <p className="text-xs font-black text-slate-800 uppercase">{tx.description}</p>
                              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">{new Date(tx.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-black ${tx.amount > 0 ? 'text-green-600' : 'text-slate-900'}`}>
                              {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 flex flex-col items-center justify-center text-center opacity-40">
                        <RefreshCcw className="w-10 h-10 mb-2" />
                        <p className="text-[10px] font-black uppercase tracking-widest">No recent activity</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {/* Quick Actions */}
              <Card className="shadow-lg border-slate-200/60 bg-primary text-primary-foreground">
                <CardHeader>
                  <CardTitle className="text-sm font-black uppercase tracking-widest opacity-80">Quick Command</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="secondary" className="w-full justify-start font-black uppercase tracking-widest h-11" onClick={() => router.push('/transfer')}>
                    <ArrowRightLeft className="w-4 h-4 mr-3" /> Transfer
                  </Button>
                  <Button variant="secondary" className="w-full justify-start font-black uppercase tracking-widest h-11" onClick={() => router.push('/crypto')}>
                    <Bitcoin className="w-4 h-4 mr-3" /> Buy Crypto
                  </Button>
                  <Button variant="secondary" className="w-full justify-start font-black uppercase tracking-widest h-11" onClick={() => router.push('/invest')}>
                    <TrendingUp className="w-4 h-4 mr-3" /> Yield Store
                  </Button>
                </CardContent>
              </Card>

              {/* Allocation */}
              <Card className="shadow-lg border-slate-200/60">
                <CardHeader>
                  <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-800">Allocation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                      <span>Fiat Reserves</span>
                      <span>72%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-primary h-full" style={{ width: '72%' }} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                      <span>Digital Assets</span>
                      <span>28%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-chart-2 h-full" style={{ width: '28%' }} />
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-50 flex flex-col gap-2">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                      <span className="text-muted-foreground">Risk Level</span>
                      <Badge variant="outline" className="text-[8px] border-slate-200">Moderate</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}