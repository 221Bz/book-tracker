import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    redirect("/api/auth/login");
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);


  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Kalau belum login, redirect ke login
  if (!session || !session.user) {
    redirect("/api/auth/login");
  }

  // Kalau sudah login, redirect ke /home
  redirect("/home");
}
