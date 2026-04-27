
'use client';

import React, { useState } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowDown, RefreshCcw, Settings2, Info, Loader2, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const tokens = [
  { symbol: 'ETH', name: 'Ethereum', balance: '1.45', price: 3450 },
  { symbol: 'USDT', name: 'Tether', balance: '12,450.00', price: 1.00 },
  { symbol: 'SOL', name: 'Solana', balance: '45.2', price: 145 },
  { symbol: 'BTC', name: 'Bitcoin', balance: '0.045', price: 98500 },
];

export default function SwapPage() {
  const { toast } = useToast();
  const [fromToken, setFromToken] = useState(tokens[0]);
  const [toToken, setToToken] = useState(tokens[1]);
  const [amount, setAmount] = useState('');
  const [isSwapping, setIsSwapping] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSwap = () => {
    if (!amount) return;
    setIsSwapping(true);
    setTimeout(() => {
      setIsSwapping(false);
      setIsSuccess(true);
      toast({
        title: 'Swap Successful',
        description: `Exchanged ${amount} ${fromToken.symbol} for ${((parseFloat(amount) * fromToken.price) / toToken.price).toFixed(4)} ${toToken.symbol}`,
      });
    }, 2000);
  };

  const reverseTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <h1 className="text-xl font-black uppercase tracking-tight">Institutional Swap</h1>
        </header>

        <main className="flex-1 overflow-auto p-6 bg-muted/20 flex items-center justify-center">
          <div className="w-full max-w-lg space-y-4">
            {isSuccess ? (
              <Card className="text-center py-10 animate-in fade-in zoom-in-95">
                <CardContent className="space-y-4">
                  <div className="flex justify-center">
                    <CheckCircle2 className="w-16 h-16 text-green-500" />
                  </div>
                  <CardTitle className="text-2xl font-black">Trade Executed</CardTitle>
                  <p className="text-muted-foreground font-medium">Your assets have been swapped and settled on-chain.</p>
                  <Button className="w-full font-black uppercase" onClick={() => setIsSuccess(false)}>New Trade</Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-2xl border-primary/10">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-black">Swap Assets</CardTitle>
                    <CardDescription>Real-time algorithmic exchange</CardDescription>
                  </div>
                  <Settings2 className="w-5 h-5 text-muted-foreground cursor-pointer hover:text-primary transition-colors" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="p-4 bg-muted rounded-2xl border border-slate-200">
                    <div className="flex justify-between mb-2">
                      <span className="text-xs font-black text-muted-foreground uppercase">Sell</span>
                      <span className="text-xs font-black text-muted-foreground uppercase">Balance: {fromToken.balance}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Input 
                        type="number" 
                        placeholder="0.0" 
                        className="bg-transparent border-none text-2xl font-black p-0 focus-visible:ring-0" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                      <Button variant="outline" className="rounded-full font-black uppercase text-xs h-8">
                        {fromToken.symbol}
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-center -my-4 relative z-10">
                    <Button variant="outline" size="icon" className="rounded-xl bg-white shadow-md hover:rotate-180 transition-transform" onClick={reverseTokens}>
                      <ArrowDown className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="p-4 bg-muted rounded-2xl border border-slate-200">
                    <div className="flex justify-between mb-2">
                      <span className="text-xs font-black text-muted-foreground uppercase">Buy</span>
                      <span className="text-xs font-black text-muted-foreground uppercase">Balance: {toToken.balance}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-black flex-1 opacity-50">
                        {amount ? ((parseFloat(amount) * fromToken.price) / toToken.price).toFixed(4) : '0.0'}
                      </div>
                      <Button variant="outline" className="rounded-full font-black uppercase text-xs h-8">
                        {toToken.symbol}
                      </Button>
                    </div>
                  </div>

                  <div className="pt-4 space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase text-muted-foreground tracking-widest px-1">
                      <span>Rate</span>
                      <span>1 {fromToken.symbol} = {(fromToken.price / toToken.price).toLocaleString()} {toToken.symbol}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-black uppercase text-muted-foreground tracking-widest px-1">
                      <span>Price Impact</span>
                      <span className="text-green-600">{"<0.01%"}</span>
                    </div>
                    <Button 
                      className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-lg shadow-xl shadow-primary/20"
                      disabled={!amount || isSwapping}
                      onClick={handleSwap}
                    >
                      {isSwapping ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                      {isSwapping ? 'Executing...' : 'Swap Assets'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex gap-3">
              <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <p className="text-[10px] font-bold text-slate-600 uppercase leading-relaxed">
                Trade with confidence. Our aggregation engine routes your order through 14+ liquidity providers to ensure minimal slippage and best execution price.
              </p>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
