import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

export default async function Home() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

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
