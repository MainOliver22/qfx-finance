'use client';

import React from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  CreditCard, 
  ArrowRightLeft, 
  History, 
  Plus, 
  Search,
  Download,
  MoreVertical,
  ArrowUpRight,
  ArrowDownLeft
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
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

export default function FiatAccountsPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();

  const fiatAccountsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'fiatAccounts'));
  }, [db, user]);

  const { data: accounts, isLoading } = useCollection(fiatAccountsQuery);

  if (isUserLoading) return null;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <h1 className="text-xl font-bold">Traditional Banking</h1>
          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Statement
            </Button>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Account
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6 space-y-6 bg-muted/20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array(2).fill(0).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-xl" />)
            ) : accounts?.map((acc) => (
              <Card key={acc.id} className="relative overflow-hidden group border-primary/10">
                <div className="absolute top-0 right-0 p-4">
                  <Badge variant="outline" className="bg-background/50 backdrop-blur capitalize">{acc.status}</Badge>
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 capitalize">
                    <CreditCard className="w-5 h-5 text-primary" />
                    {acc.accountType} Account
                  </CardTitle>
                  <CardDescription>**** **** **** {acc.accountNumber.slice(-4)}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">${acc.balance.toLocaleString()}</div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="secondary" size="sm" className="flex-1">
                      <ArrowRightLeft className="w-4 h-4 mr-2" />
                      Transfer
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <History className="w-4 h-4 mr-2" />
                      Activity
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
              <div>
                <CardTitle>Transactions</CardTitle>
                <CardDescription>Your recent banking activity.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search transactions..." className="pl-8 h-9" />
                </div>
                <Button variant="outline" size="sm">Filters</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Demo Transactions */}
                  {[1, 2, 3, 4, 5].map((i) => (
                    <TableRow key={i}>
                      <TableCell className="text-muted-foreground">Oct {10 + i}, 2023</TableCell>
                      <TableCell>
                        <div className="font-medium">{i % 2 === 0 ? 'Starbucks Coffee' : 'Zelle Transfer - Alice'}</div>
                        <div className="text-xs text-muted-foreground">Debit Card Purchase</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-normal capitalize">{i % 2 === 0 ? 'purchase' : 'transfer'}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-green-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-600" />
                          <span>Completed</span>
                        </div>
                      </TableCell>
                      <TableCell className={`text-right font-semibold ${i % 2 === 0 ? '' : 'text-green-600'}`}>
                        {i % 2 === 0 ? '-' : '+'}${i * 15.50}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}