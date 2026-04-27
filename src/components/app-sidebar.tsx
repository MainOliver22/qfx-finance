
'use client';

import * as React from 'react';
import {
  LayoutDashboard,
  Wallet,
  Cpu,
  TrendingUp,
  Settings,
  ShieldCheck,
  CreditCard,
  LogOut,
  ArrowLeftRight,
  RefreshCw,
  Plus,
  Database,
  Link as LinkIcon
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAccount, useDisconnect } from 'wagmi';
import { Badge } from '@/components/ui/badge';

const bankingItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Accounts', url: '/fiat', icon: CreditCard },
  { title: 'Transfer', url: '/transfer', icon: ArrowLeftRight },
];

const cryptoItems = [
  { title: 'Portfolio', url: '/crypto', icon: Wallet },
  { title: 'Swap Tokens', url: '/crypto/swap', icon: RefreshCw },
  { title: 'Trading Bots', url: '/bots', icon: Cpu },
  { title: 'Deploy Bot', url: '/bots/create', icon: Plus },
  { title: 'Yield Fund', url: '/invest', icon: TrendingUp },
];

const adminItems = [
  { title: 'Seed Demo Data', url: '/admin/seed', icon: Database },
];

export function AppSidebar() {
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16 flex items-center px-4">
        <div className="flex items-center gap-2 font-black text-2xl text-primary tracking-tighter cursor-pointer" onClick={() => router.push('/')}>
          <ShieldCheck className="w-8 h-8 fill-primary/20" />
          <span className="group-data-[collapsible=icon]:hidden">QFX<span className="text-foreground">FINANCE</span></span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        {isConnected && (
          <SidebarGroup>
            <SidebarGroupLabel className="font-black uppercase tracking-widest text-[9px]">Web3 Identity</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <div className="px-2 py-2 flex flex-col gap-2 group-data-[collapsible=icon]:hidden">
                  <div className="flex items-center gap-2 p-2 bg-primary/5 rounded-lg border border-primary/10">
                    <LinkIcon className="w-3 h-3 text-primary" />
                    <span className="text-[10px] font-black font-mono truncate">
                      {address?.slice(0, 6)}...{address?.slice(-4)}
                    </span>
                    <Badge variant="outline" className="ml-auto text-[8px] h-4">Active</Badge>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 text-[9px] font-black uppercase tracking-widest justify-start px-2 hover:text-destructive"
                    onClick={() => disconnect()}
                  >
                    Disconnect Wallet
                  </Button>
                </div>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className="font-black uppercase tracking-widest text-[9px]">Traditional Banking</SidebarGroupLabel>
          <SidebarMenu>
            {bankingItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  asChild 
                  isActive={pathname === item.url}
                  tooltip={item.title}
                  className="font-bold"
                >
                  <a href={item.url} className="flex items-center gap-3">
                    <item.icon className={cn("w-5 h-5", pathname === item.url ? "text-primary" : "text-muted-foreground")} />
                    <span className="uppercase tracking-tight text-xs">{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator className="mx-4 my-2" />

        <SidebarGroup>
          <SidebarGroupLabel className="font-black uppercase tracking-widest text-[9px]">Crypto Ecosystem</SidebarGroupLabel>
          <SidebarMenu>
            {cryptoItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  asChild 
                  isActive={pathname === item.url}
                  tooltip={item.title}
                  className="font-bold"
                >
                  <a href={item.url} className="flex items-center gap-3">
                    <item.icon className={cn("w-5 h-5", pathname === item.url ? "text-primary" : "text-muted-foreground")} />
                    <span className="uppercase tracking-tight text-xs">{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator className="mx-4 my-2" />

        <SidebarGroup>
          <SidebarGroupLabel className="font-black uppercase tracking-widest text-[9px]">Developer Core</SidebarGroupLabel>
          <SidebarMenu>
            {adminItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  asChild 
                  isActive={pathname === item.url}
                  tooltip={item.title}
                  className="font-bold"
                >
                  <a href={item.url} className="flex items-center gap-3">
                    <item.icon className={cn("w-5 h-5", pathname === item.url ? "text-primary" : "text-muted-foreground")} />
                    <span className="uppercase tracking-tight text-xs">{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 bg-muted/30">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <Avatar className="w-10 h-10 border-2 border-primary/20 shadow-sm">
            <AvatarImage src={user?.photoURL || ''} />
            <AvatarFallback className="bg-primary text-primary-foreground font-black">
              {user?.email?.[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-black truncate text-slate-800 tracking-tight">{user?.displayName || 'Elite User'}</span>
            <span className="text-[10px] text-muted-foreground truncate uppercase font-black tracking-widest">KYC Verified</span>
          </div>
          <SidebarMenuButton onClick={handleLogout} className="w-8 h-8 p-0 flex items-center justify-center text-muted-foreground hover:text-destructive group-data-[collapsible=icon]:hidden">
            <LogOut className="w-4 h-4" />
          </SidebarMenuButton>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
