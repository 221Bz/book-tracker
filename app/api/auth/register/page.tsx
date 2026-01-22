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

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
  // SUBMIT REGISTER
  // ------------------------------------------------
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Password tidak sama.");
      return;
    }

    if (process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
      const token = getCaptchaToken();
      if (!token) {
        alert("Silakan centang Recaptcha dulu.");
        return;
      }
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error || !data.user) {
        alert(error?.message || "Gagal membuat akun");
        return;
      }

      // Buat profile awal
      await supabase.from('profiles').insert({
        user_id: data.user.id,
        created_at: new Date(),
      });

      alert("Akun berhasil dibuat. Silakan login.");
      router.push('/api/auth/login');
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat register");
    } finally {
      setLoading(false);
    }
  }

  // ------------------------------------------------
  // REGISTER GOOGLE
  // ------------------------------------------------
  async function registerWithGoogle() {
    const token = getCaptchaToken();
    if (!token) {
      alert("Silakan centang Recaptcha dulu.");
      return;
    }

    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/home`,
        },
      });
    } catch (err) {
      console.error(err);
      alert("Register Google gagal");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-3xl font-bold">Create account</CardTitle>
          <CardDescription>
            Sign up to get started with your account.
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

            <div className="space-y-2">
              <Label>Confirm Password</Label>
              <Input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {isClient && process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && (
              <div className="w-full flex justify-center mt-3">
                <div
                  className="g-recaptcha"
                  data-sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                />
              </div>
            )}

            <Button type="submit" className="w-full bg-black hover:bg-gray-900" disabled={loading}>
              {loading ? 'Loading...' : 'Sign Up'}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={registerWithGoogle}
              className="w-full flex items-center gap-3"
            >
              <Image
                src="/google-logo.png"
                alt="Google Logo"
                width={20}
                height={20}
              />
              Sign up with Google
            </Button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{" "}
            <Link href="/api/auth/login" className="font-semibold text-black underline">
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
