'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../../lib/supabaseClient';
import Image from 'next/image';
import Link from "next/link";

// SHADCN
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  // ------------------------------------------------
  // ENABLE CLIENT RENDER
  // ------------------------------------------------
  useEffect(() => setIsClient(true), [setIsClient]);

  // ------------------------------------------------
  // LOAD RECAPTCHA SCRIPT
  // ------------------------------------------------
  useEffect(() => {
    if (!document.getElementById("recaptcha-script")) {
      const script = document.createElement("script");
      script.id = "recaptcha-script";
      script.src = "https://www.google.com/recaptcha/api.js";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

  // ------------------------------------------------
  // GET CAPTCHA TOKEN
  // ------------------------------------------------
  function getCaptchaToken(): string {
    const gre = (window as unknown as { grecaptcha?: { getResponse(): string } }).grecaptcha;
    return gre?.getResponse() ?? "";
  }

  // ------------------------------------------------
  // SUBMIT LOGIN
  // ------------------------------------------------
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
      const token = getCaptchaToken();
      if (!token) {
        alert("Silakan centang Recaptcha dulu.");
        return;
      }
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.user) {
        alert("Email atau password salah.");
        return;
      }

      // Insert profile jika belum ada
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', data.user.id)
        .maybeSingle();

      if (!profileData) {
        await supabase.from('profiles').insert({
          user_id: data.user.id,
          created_at: new Date(),
        });
      }

      router.push('/home');
    } catch (err: unknown) {
      console.error(err);
      alert("Terjadi kesalahan saat login");
    } finally {
      setLoading(false);
    }
  }

  // ------------------------------------------------
  // LOGIN GOOGLE
  // ------------------------------------------------
  async function loginWithGoogle() {
    if (process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
      const token = getCaptchaToken();
      if (!token) {
        alert("Silakan centang Recaptcha dulu.");
        return;
      }
    }

    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/home`,
          queryParams: { prompt: "select_account" },
        },
      });
    } catch (err: unknown) {
      console.error(err);
      alert("Login Google gagal");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-3xl font-bold">Welcome back</CardTitle>
          <CardDescription>
            Welcome back! Please enter your details.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <p
              onClick={() => router.push("/forgot-password")}
              className="mt-3 text-sm text-gray-600 hover:underline cursor-pointer"
            >
              Forgot password?
            </p>

            {isClient && process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && (
              <div className="w-full flex justify-center mt-3">
                <div
                  className="g-recaptcha"
                  data-sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                />
              </div>
            )}

            <Button type="submit" className="w-full bg-black hover:bg-gray-900" disabled={loading}>
              {loading ? 'Loading...' : 'Login'}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={loginWithGoogle}
              className="w-full flex items-center gap-3"
            >
              <Image
                src="/google-logo.png"
                alt="Google Logo"
                width={20}
                height={20}
              />
              Sign in with Google
            </Button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/api/auth/register" className="font-semibold text-black underline">
              Sign up for free
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
