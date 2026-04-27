'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ShieldCheck, User, Mail, Lock, Phone } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    phone: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { user } = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      
      await updateProfile(user, { displayName: formData.fullName });

      // 1. Create User Profile in Firestore
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        id: user.uid,
        email: formData.email,
        username: formData.username,
        fullName: formData.fullName,
        phone: formData.phone,
        kycStatus: 'verified', // Auto-verified for demo
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // 2. Auto-create Checking Account
      const checkingAccountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();
      const checkingRef = collection(db, 'users', user.uid, 'fiatAccounts');
      await addDoc(checkingRef, {
        userId: user.uid,
        accountType: 'checking',
        accountNumber: checkingAccountNumber,
        balance: 10000.00,
        currency: 'USD',
        status: 'active',
        createdAt: new Date().toISOString(),
      });

      // 3. Auto-create Savings Account
      const savingsAccountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();
      await addDoc(checkingRef, {
        userId: user.uid,
        accountType: 'savings',
        accountNumber: savingsAccountNumber,
        balance: 10000.00,
        currency: 'USD',
        status: 'active',
        createdAt: new Date().toISOString(),
      });

      toast({
        title: 'Account Created',
        description: 'Welcome to QFX Finance! Your demo accounts have been provisioned.',
      });
      
      router.push('/');
    } catch (error: any) {
      console.error('Registration failed:', error);
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-8">
      <Card className="w-full max-w-lg shadow-xl border-t-4 border-t-primary">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="bg-primary/10 p-3 rounded-full mb-2">
            <ShieldCheck className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Join QFX Finance</CardTitle>
          <CardDescription>
            Create your modern fintech ecosystem account today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2 md:col-span-1">
              <Label htmlFor="fullName">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="fullName" placeholder="John Doe" className="pl-10" onChange={handleChange} required />
              </div>
            </div>
            <div className="space-y-2 col-span-2 md:col-span-1">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="username" placeholder="johndoe123" className="pl-10" onChange={handleChange} required />
              </div>
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="name@example.com" className="pl-10" onChange={handleChange} required />
              </div>
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" className="pl-10" onChange={handleChange} required />
              </div>
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="password" type="password" className="pl-10" onChange={handleChange} required />
              </div>
            </div>
            <div className="col-span-2 pt-2">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating Account...' : 'Register Account'}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t p-4">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
