
'use client';

import React, { useState } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Cpu, 
  ArrowRight, 
  Settings, 
  Zap, 
  BarChart3, 
  Shield, 
  Info,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

const strategies = [
  { id: 'dca', name: 'DCA (Dollar Cost Averaging)', icon: BarChart3, description: 'Periodic buying regardless of price' },
  { id: 'grid', name: 'Grid Trading', icon: Cpu, description: 'Buy low and sell high in a range' },
  { id: 'momentum', name: 'Momentum Scalper', icon: Zap, description: 'Follow the trend using RSI/MACD' },
];

export default function CreateBotPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [botData, setBotData] = useState({
    name: '',
    strategy: '',
    tradingPair: 'BTC/USD',
    investmentAmount: '',
    frequency: 'daily',
    takeProfitPct: '10',
    stopLossPct: '5'
  });

  const handleCreate = async () => {
    if (!user || !db) return;
    setLoading(true);

    try {
      const botsRef = collection(db, 'users', user.uid, 'tradingBots');
      await addDoc(botsRef, {
        ...botData,
        userId: user.uid,
        status: 'active',
        investmentAmount: parseFloat(botData.investmentAmount),
        takeProfitPct: parseFloat(botData.takeProfitPct),
        stopLossPct: parseFloat(botData.stopLossPct),
        totalProfit: 0,
        totalTrades: 0,
        createdAt: new Date().toISOString(),
        updatedAt: serverTimestamp()
      });

      toast({
        title: 'Bot Activated',
        description: `${botData.name} is now live and trading.`,
      });
      router.push('/bots');
    } catch (error: any) {
      console.error('Bot creation failed:', error);
      toast({
        variant: 'destructive',
        title: 'Activation Failed',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <h1 className="text-xl font-black uppercase tracking-tight">Bot Deployment Wizard</h1>
        </header>

        <main className="flex-1 overflow-auto p-6 bg-muted/20">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Stepper */}
            <div className="flex items-center justify-between px-4 md:px-20">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-colors ${step >= s ? 'bg-primary text-white' : 'bg-muted text-muted-foreground border border-slate-200'}`}>
                    {s}
                  </div>
                  {s < 3 && <div className={`h-1 w-12 md:w-24 rounded-full ${step > s ? 'bg-primary' : 'bg-muted'}`} />}
                </div>
              ))}
            </div>

            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-black uppercase tracking-tight text-slate-800">Select Strategy</h2>
                  <p className="text-muted-foreground font-medium uppercase text-xs tracking-widest">Choose the mathematical model for your bot</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {strategies.map((strat) => (
                    <Card 
                      key={strat.id} 
                      className={`cursor-pointer transition-all border-2 ${botData.strategy === strat.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50 border-transparent'}`}
                      onClick={() => {
                        setBotData({ ...botData, strategy: strat.id });
                        setStep(2);
                      }}
                    >
                      <CardHeader>
                        <strat.icon className={`w-10 h-10 mb-2 ${botData.strategy === strat.id ? 'text-primary' : 'text-slate-400'}`} />
                        <CardTitle className="text-lg font-black">{strat.name}</CardTitle>
                        <CardDescription className="text-[10px] font-bold uppercase tracking-wider">{strat.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <Card className="animate-in fade-in slide-in-from-right-4">
                <CardHeader>
                  <CardTitle className="text-2xl font-black uppercase italic">Bot Configuration</CardTitle>
                  <CardDescription className="font-bold uppercase text-[10px] tracking-widest">Define your risk and capital allocation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="font-black uppercase text-[10px] tracking-widest">Bot Name</Label>
                      <Input 
                        placeholder="Alpha Alpha 1" 
                        value={botData.name}
                        onChange={(e) => setBotData({ ...botData, name: e.target.value })}
                        className="h-12 font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-black uppercase text-[10px] tracking-widest">Trading Pair</Label>
                      <Select defaultValue="BTC/USD" onValueChange={(v) => setBotData({ ...botData, tradingPair: v })}>
                        <SelectTrigger className="h-12 font-bold">
                          <SelectValue placeholder="Select pair" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BTC/USD">BTC/USD</SelectItem>
                          <SelectItem value="ETH/USD">ETH/USD</SelectItem>
                          <SelectItem value="SOL/USD">SOL/USD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-black uppercase text-[10px] tracking-widest">Investment Amount (USD)</Label>
                      <Input 
                        type="number" 
                        placeholder="5000" 
                        value={botData.investmentAmount}
                        onChange={(e) => setBotData({ ...botData, investmentAmount: e.target.value })}
                        className="h-12 font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-black uppercase text-[10px] tracking-widest">Trade Frequency</Label>
                      <Select defaultValue="daily" onValueChange={(v) => setBotData({ ...botData, frequency: v })}>
                        <SelectTrigger className="h-12 font-bold">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">Hourly (High Activity)</SelectItem>
                          <SelectItem value="daily">Daily (Moderate)</SelectItem>
                          <SelectItem value="weekly">Weekly (Conservative)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="pt-4 flex justify-between">
                    <Button variant="outline" onClick={() => setStep(1)} className="font-black uppercase tracking-widest">Back</Button>
                    <Button onClick={() => setStep(3)} className="font-black uppercase tracking-widest px-8">Next Step <ArrowRight className="w-4 h-4 ml-2" /></Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 3 && (
              <Card className="animate-in fade-in slide-in-from-right-4">
                <CardHeader>
                  <CardTitle className="text-2xl font-black uppercase italic">Risk Management</CardTitle>
                  <CardDescription className="font-bold uppercase text-[10px] tracking-widest">Set automated exit points</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label className="font-black uppercase text-[10px] tracking-widest">Take Profit (%)</Label>
                        <span className="font-black text-primary text-xl">{botData.takeProfitPct}%</span>
                      </div>
                      <Input 
                        type="range" 
                        min="1" 
                        max="100" 
                        value={botData.takeProfitPct}
                        onChange={(e) => setBotData({ ...botData, takeProfitPct: e.target.value })}
                        className="cursor-pointer"
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label className="font-black uppercase text-[10px] tracking-widest">Stop Loss (%)</Label>
                        <span className="font-black text-destructive text-xl">{botData.stopLossPct}%</span>
                      </div>
                      <Input 
                        type="range" 
                        min="1" 
                        max="50" 
                        value={botData.stopLossPct}
                        onChange={(e) => setBotData({ ...botData, stopLossPct: e.target.value })}
                        className="cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-muted rounded-2xl border border-slate-200 flex gap-4">
                    <Shield className="w-6 h-6 text-primary shrink-0" />
                    <div className="space-y-1">
                      <h4 className="text-xs font-black uppercase tracking-tight">Institutional Protection Active</h4>
                      <p className="text-[10px] font-medium text-slate-500 uppercase leading-relaxed">
                        This bot is protected by our algorithmic hedging. If volatility exceeds 15% in 1 hour, trading will automatically pause.
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between">
                    <Button variant="outline" onClick={() => setStep(2)} className="font-black uppercase tracking-widest">Back</Button>
                    <Button 
                      onClick={handleCreate} 
                      disabled={loading || !botData.name}
                      className="font-black uppercase tracking-widest px-8 shadow-xl shadow-primary/20"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                      Deploy Bot
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="bg-white border border-slate-200 rounded-2xl p-6 flex gap-6 items-center shadow-sm">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Info className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-1">
                <h4 className="font-black uppercase text-xs tracking-tight">Need help choosing?</h4>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Our AI Advisor can analyze market conditions and suggest the best strategy for your current liquidity.
                </p>
              </div>
              <Button variant="link" className="ml-auto font-black uppercase text-[10px] tracking-widest">Ask AI Advisor</Button>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
