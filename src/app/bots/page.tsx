'use client';

import React from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Cpu, 
  Plus, 
  Play, 
  Pause, 
  Trash2, 
  TrendingUp, 
  Activity,
  ChevronRight
} from 'lucide-react';
import { 
  useUser, 
  useCollection, 
  useMemoFirebase, 
  useFirestore 
} from '@/firebase';
import { collection, query, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

export default function BotsPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const botsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'tradingBots'));
  }, [db, user]);

  const { data: bots, isLoading } = useCollection(botsQuery);

  const toggleBotStatus = async (botId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    try {
      const botRef = doc(db, 'users', user!.uid, 'tradingBots', botId);
      await updateDoc(botRef, { status: newStatus });
      toast({
        title: `Bot ${newStatus === 'active' ? 'Started' : 'Paused'}`,
        description: `Your trading bot is now ${newStatus}.`,
      });
    } catch (error: any) {
      console.error('Bot status update failed:', error);
      toast({
        variant: 'destructive',
        title: 'Status Update Failed',
        description: error.message,
      });
    }
  };

  const deleteBot = async (botId: string) => {
    try {
      const botRef = doc(db, 'users', user!.uid, 'tradingBots', botId);
      await deleteDoc(botRef);
      toast({
        title: 'Bot Deleted',
        description: 'The trading bot has been removed from your account.',
      });
    } catch (error: any) {
      console.error('Bot deletion failed:', error);
      toast({
        variant: 'destructive',
        title: 'Deletion Failed',
        description: error.message,
      });
    }
  };

  if (isUserLoading) return null;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <h1 className="text-xl font-bold">Automated Trading</h1>
          <Button size="sm" className="ml-auto">
            <Plus className="w-4 h-4 mr-2" />
            Create Bot
          </Button>
        </header>

        <main className="flex-1 overflow-auto p-6 space-y-6 bg-muted/20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Bots</span>
                </div>
                <div className="text-2xl font-bold">{bots?.filter(b => b.status === 'active').length || 0}</div>
              </CardContent>
            </Card>
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Profit</span>
                </div>
                <div className="text-2xl font-bold text-green-600">+$1,420.50</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-xl" />)
            ) : bots && bots.length > 0 ? (
              bots.map((bot) => (
                <Card key={bot.id} className="group overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Cpu className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{bot.name}</CardTitle>
                          <CardDescription className="capitalize">{bot.strategy} Strategy</CardDescription>
                        </div>
                      </div>
                      <Badge variant={bot.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                        {bot.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-muted rounded-lg">
                        <span className="text-[10px] text-muted-foreground block uppercase">Pair</span>
                        <span className="font-bold">{bot.tradingPair}</span>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <span className="text-[10px] text-muted-foreground block uppercase">Profit</span>
                        <span className={`font-bold ${bot.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${bot.totalProfit.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={bot.status === 'active'} 
                          onCheckedChange={() => toggleBotStatus(bot.id, bot.status)}
                        />
                        <span className="text-xs font-medium">Auto-Trading</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => deleteBot(bot.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-8">
                          Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full py-20 flex flex-col items-center justify-center bg-card border rounded-xl border-dashed">
                <Cpu className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground font-medium">No active trading bots</p>
                <Button variant="link" size="sm" className="mt-2">Create your first bot</Button>
              </div>
            )}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
