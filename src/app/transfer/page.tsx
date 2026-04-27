'use client';

import React, { useState } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { ArrowRightLeft, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { 
  useUser, 
  useCollection, 
  useMemoFirebase, 
  useFirestore 
} from '@/firebase';
import { collection, query, doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function TransferPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const fiatAccountsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'fiatAccounts'));
  }, [db, user]);

  const { data: accounts, isLoading } = useCollection(fiatAccountsQuery);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromAccount || !toAccount || !amount || fromAccount === toAccount) {
      toast({
        variant: 'destructive',
        title: 'Invalid Transfer',
        description: 'Please select different accounts and a valid amount.',
      });
      return;
    }

    setIsProcessing(true);
    try {
      const fromAccDoc = accounts?.find(a => a.id === fromAccount);
      const toAccDoc = accounts?.find(a => a.id === toAccount);
      const transferAmount = parseFloat(amount);

      if (!fromAccDoc || !toAccDoc) throw new Error('Accounts not found');
      if (fromAccDoc.balance < transferAmount) throw new Error('Insufficient funds');

      const batch = writeBatch(db);

      // Update From Account
      const fromRef = doc(db, 'users', user!.uid, 'fiatAccounts', fromAccount);
      batch.update(fromRef, {
        balance: fromAccDoc.balance - transferAmount,
        updatedAt: serverTimestamp()
      });

      // Update To Account
      const toRef = doc(db, 'users', user!.uid, 'fiatAccounts', toAccount);
      batch.update(toRef, {
        balance: toAccDoc.balance + transferAmount,
        updatedAt: serverTimestamp()
      });

      // Create Transaction Record
      const txRef = doc(collection(db, 'users', user!.uid, 'fiatAccounts', fromAccount, 'fiatTransactions'));
      batch.set(txRef, {
        id: txRef.id,
        accountId: fromAccount,
        userId: user!.uid,
        type: 'transfer',
        amount: -transferAmount,
        description: `Transfer to ${toAccDoc.accountType} account`,
        status: 'completed',
        createdAt: new Date().toISOString()
      });

      await batch.commit();
      setIsSuccess(true);
      toast({
        title: 'Transfer Successful',
        description: `Successfully transferred $${amount} to your ${toAccDoc.accountType} account.`,
      });
    } catch (error: any) {
      console.error('Transfer failed:', error);
      toast({
        variant: 'destructive',
        title: 'Transfer Failed',
        description: error.message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isUserLoading) return null;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <h1 className="text-xl font-bold">Transfer Funds</h1>
        </header>

        <main className="flex-1 overflow-auto p-6 bg-muted/20">
          <div className="max-w-2xl mx-auto">
            {isSuccess ? (
              <Card className="text-center py-12">
                <CardContent className="space-y-4">
                  <div className="flex justify-center">
                    <CheckCircle2 className="w-16 h-16 text-green-500" />
                  </div>
                  <CardTitle className="text-2xl font-bold">Transfer Complete</CardTitle>
                  <CardDescription>Your funds have been moved successfully.</CardDescription>
                  <div className="pt-4 flex justify-center gap-4">
                    <Button variant="outline" onClick={() => setIsSuccess(false)}>New Transfer</Button>
                    <Button onClick={() => window.location.href = '/'}>Back to Dashboard</Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowRightLeft className="w-5 h-5 text-primary" />
                    Internal Account Transfer
                  </CardTitle>
                  <CardDescription>Move money instantly between your QFX Finance accounts.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleTransfer} className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>From Account</Label>
                        {isLoading ? (
                          <Skeleton className="h-10 w-full" />
                        ) : (
                          <Select onValueChange={setFromAccount} value={fromAccount}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select source account" />
                            </SelectTrigger>
                            <SelectContent>
                              {accounts?.map(acc => (
                                <SelectItem key={acc.id} value={acc.id}>
                                  <div className="flex justify-between items-center w-full min-w-[300px]">
                                    <span className="capitalize">{acc.accountType} (***{acc.accountNumber.slice(-4)})</span>
                                    <span className="font-bold">${acc.balance.toLocaleString()}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>

                      <div className="flex justify-center">
                        <div className="p-2 rounded-full bg-primary/10 text-primary">
                          <ArrowRightLeft className="w-4 h-4" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>To Account</Label>
                        {isLoading ? (
                          <Skeleton className="h-10 w-full" />
                        ) : (
                          <Select onValueChange={setToAccount} value={toAccount}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select destination account" />
                            </SelectTrigger>
                            <SelectContent>
                              {accounts?.map(acc => (
                                <SelectItem key={acc.id} value={acc.id}>
                                  <div className="flex justify-between items-center w-full min-w-[300px]">
                                    <span className="capitalize">{acc.accountType} (***{acc.accountNumber.slice(-4)})</span>
                                    <span className="font-bold">${acc.balance.toLocaleString()}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="amount">Amount (USD)</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 font-bold text-muted-foreground">$</span>
                          <Input 
                            id="amount" 
                            type="number" 
                            placeholder="0.00" 
                            className="pl-8" 
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-muted p-4 rounded-lg flex gap-3 items-start">
                      <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground">
                        Transfers are subject to our security protocols. Most internal transfers are processed instantly.
                      </p>
                    </div>

                    <Button type="submit" className="w-full" disabled={isProcessing || isLoading}>
                      {isProcessing ? 'Processing...' : 'Confirm Transfer'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
