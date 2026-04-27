
'use client';

import React, { useState } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  Lock, 
  Info,
  Loader2
} from 'lucide-react';
import { 
  useUser, 
  useCollection, 
  useMemoFirebase, 
  useFirestore 
} from '@/firebase';
import { collection, query, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const demoPackages = [
  {
    id: 'stable-yield',
    name: 'Stable Yield Fund',
    description: 'Low-risk fund focused on stablecoin lending and government bonds.',
    apy: 5.2,
    min: 1000,
    risk: 'Low',
    lock: '0 Days',
    icon: ShieldCheck,
    color: 'text-blue-500'
  },
  {
    id: 'crypto-staking',
    name: 'ETH Staking Premium',
    description: 'Participate in Ethereum network security and earn protocol rewards.',
    apy: 12.5,
    min: 5000,
    risk: 'Medium',
    lock: '30 Days',
    icon: Zap,
    color: 'text-purple-500'
  },
  {
    id: 'growth-fund',
    name: 'DeFi Growth Engine',
    description: 'High-growth strategy utilizing yield farming and liquidity provision.',
    apy: 24.8,
    min: 10000,
    risk: 'High',
    lock: '90 Days',
    icon: TrendingUp,
    color: 'text-green-500'
  }
];

export default function InvestPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [isInvesting, setIsInvesting] = useState(false);

  const packagesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'investmentPackages'));
  }, [db]);

  const { data: packages, isLoading } = useCollection(packagesQuery);

  const handleInvest = async () => {
    if (!user || !db || !selectedPackage) return;
    
    setIsInvesting(true);
    // Realism delay
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const investmentRef = collection(db, 'users', user.uid, 'userInvestments');
      await addDoc(investmentRef, {
        userId: user.uid,
        packageId: selectedPackage.id,
        amountInvested: selectedPackage.minAmount || selectedPackage.min,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + (selectedPackage.lockPeriodDays || 30) * 24 * 60 * 60 * 1000).toISOString(),
        expectedReturn: (selectedPackage.apyRate || selectedPackage.apy) / 100 * (selectedPackage.minAmount || selectedPackage.min),
        status: 'active',
        createdAt: serverTimestamp(),
      });

      toast({
        title: 'Investment Confirmed',
        description: `You have successfully joined the ${selectedPackage.name}.`,
      });
      setSelectedPackage(null);
    } catch (error: any) {
      console.error('Investment failed:', error);
      toast({
        variant: 'destructive',
        title: 'Investment Failed',
        description: error.message,
      });
    } finally {
      setIsInvesting(false);
    }
  };

  if (isUserLoading) return null;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <h1 className="text-xl font-bold text-slate-800">Elite Yield Management</h1>
        </header>

        <main className="flex-1 overflow-auto p-6 space-y-8 bg-muted/20">
          <div className="bg-primary rounded-2xl p-8 md:p-12 text-primary-foreground relative overflow-hidden shadow-2xl border border-white/10">
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight uppercase italic drop-shadow-sm">Institutional Growth</h2>
              <p className="text-primary-foreground/90 text-lg mb-8 font-medium">
                Direct access to high-yield digital asset strategies. Managed by algorithms, backed by collateral.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button variant="secondary" size="lg" className="font-bold uppercase tracking-wider h-12 px-8">Browse Market</Button>
                <Button variant="outline" size="lg" className="bg-white/10 border-white/30 font-bold uppercase tracking-wider backdrop-blur-sm h-12 px-8">My Holdings</Button>
              </div>
            </div>
            <TrendingUp className="absolute -right-10 -bottom-10 w-80 h-80 opacity-10 rotate-12" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-96 w-full rounded-2xl" />)
            ) : (packages && packages.length > 0 ? packages : demoPackages).map((pkg) => (
              <Card key={pkg.id} className="relative group hover:border-primary transition-all duration-500 shadow-xl border-slate-200/60 overflow-hidden bg-card/50 backdrop-blur-sm">
                <div className="absolute top-0 right-0 p-4">
                  <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors uppercase font-black text-[10px] tracking-widest px-3 py-1">
                    {pkg.riskLevel || pkg.risk} RISK
                  </Badge>
                </div>
                <CardHeader className="pt-10">
                  <div className={`w-14 h-14 rounded-2xl bg-white shadow-inner flex items-center justify-center mb-5 transition-transform group-hover:scale-110 duration-500 border border-slate-100`}>
                    {pkg.icon ? <pkg.icon className={`w-7 h-7 ${pkg.color}`} /> : <ShieldCheck className="w-7 h-7 text-primary" />}
                  </div>
                  <CardTitle className="text-2xl font-black tracking-tight text-slate-900">{pkg.name}</CardTitle>
                  <CardDescription className="line-clamp-2 min-h-[44px] text-slate-500 leading-relaxed font-medium">{pkg.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-5xl font-black text-primary tracking-tighter">{pkg.apyRate || pkg.apy}%</span>
                    <span className="text-xs text-muted-foreground font-black mb-1.5 uppercase tracking-widest">Est. APY</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6 p-4 rounded-xl bg-muted/30 border border-slate-100">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block opacity-70">Minimum</span>
                      <span className="font-black text-slate-800">${(pkg.minAmount || pkg.min).toLocaleString()}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block opacity-70">Lock Term</span>
                      <span className="font-black text-slate-800 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" />
                        {pkg.lockPeriodDays || pkg.lock}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-4">
                  <Button 
                    className="w-full h-12 font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all"
                    onClick={() => setSelectedPackage(pkg)}
                  >
                    Invest Now
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-slate-50/50 border-dashed border-2 border-slate-200">
              <CardContent className="p-8 flex gap-6 items-start">
                <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                  <Info className="w-6 h-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-black text-slate-900 tracking-tight">Deployment Strategy</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Once capital is deployed, it enters our automated liquidity pools. Interest is calculated on-chain and settled daily to your vault.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-50/50 border-dashed border-2 border-slate-200">
              <CardContent className="p-8 flex gap-6 items-start">
                <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                  <ShieldCheck className="w-6 h-6 text-green-500" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-black text-slate-900 tracking-tight">Investor Protection</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    All elite packages feature a 1:1 collateral ratio. Your principal is isolated from market volatility through our algorithmic hedging.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

        <Dialog open={!!selectedPackage} onOpenChange={() => setSelectedPackage(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black">Confirm Investment</DialogTitle>
              <DialogDescription className="font-medium">
                You are about to deploy capital into the {selectedPackage?.name}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-xl bg-muted/50 border border-slate-200 space-y-3 text-sm font-medium">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Investment Amount:</span>
                  <span className="font-black text-slate-900">${(selectedPackage?.minAmount || selectedPackage?.min)?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Target APY:</span>
                  <span className="font-black text-green-600">{selectedPackage?.apyRate || selectedPackage?.apy}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lock Period:</span>
                  <span className="font-black text-slate-900">{selectedPackage?.lockPeriodDays || selectedPackage?.lock}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed italic">
                By clicking confirm, you authorize the transfer of funds from your primary checking account. Early withdrawal may result in a 2.5% service fee.
              </p>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setSelectedPackage(null)} disabled={isInvesting}>Cancel</Button>
              <Button onClick={handleInvest} disabled={isInvesting} className="font-black uppercase tracking-widest">
                {isInvesting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {isInvesting ? 'Deploying...' : 'Confirm & Deploy'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  );
}
