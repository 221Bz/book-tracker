"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import { Home, Library, Globe, UserCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { useLanguage } from "../context/LanguageContext";

/* =====================
   Types
===================== */

interface AuthUser {
  name: string;
  email: string;
  avatar: string | null;
}

/* =====================
   Component
===================== */

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const { t, language, setLanguage } = useLanguage();

  const [user, setUser] = useState<AuthUser | null>(null);

  /* =====================
     Helpers
  ===================== */

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((x) => x[0])
      .join("")
      .toUpperCase();

  const resolveAvatar = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return supabase.storage.from("images").getPublicUrl(path).data.publicUrl;
  };

  /* =====================
     Load User
  ===================== */

  const loadUserFromDB = async (sessionUser: User) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("name, avatar_url")
      .eq("id", sessionUser.id)
      .single();

    setUser({
      name: profile?.name || "User",
      email: sessionUser.email || "",
      avatar: resolveAvatar(profile?.avatar_url ?? null),
    });
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) loadUserFromDB(session.user);
    });
  }, [supabase.auth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/api/auth/login");
  };

  const menuItems = [
    { name: "Home", href: "/home", icon: Home },
    { name: "Explore", href: "/explore", icon: Globe },
    { name: "Library", href: "/library", icon: Library },
    { name: "Profile", href: "/profile", icon: UserCircle },
  ];

  /* =====================
     Render
  ===================== */

  return (
    <>
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden md:fixed md:top-0 md:left-0 md:h-screen md:w-64 md:bg-[#1A1A1A] md:block">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-2 p-4 text-xl font-semibold text-white border-b border-white/10">
            <Library size={24} /> BookGraph
          </div>

          {/* User */}
          <div className="border-b border-white/10 p-4 flex items-center gap-3">
            {user?.avatar ? (
              <div
                className="w-10 h-10 rounded-full bg-cover bg-center"
                style={{ backgroundImage: `url(${user.avatar})` }}
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white text-sm">
                {user ? getInitials(user.name) : ""}
              </div>
            )}

            <div className="flex-1">
              <p className="text-sm font-semibold text-white truncate">
                {user?.name || "Loading..."}
              </p>
              <button
                onClick={handleLogout}
                className="text-xs text-white/70 hover:text-red-500"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Menu */}
          <nav className="px-4 py-4 space-y-1 flex-1">
            {menuItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition ${isActive
                    ? "bg-[#232323] text-white"
                    : "text-white/80 hover:bg-white/10"
                    }`}
                >
                  <Icon size={18} />
                  <span className="text-sm">{t(item.name)}</span>
                </Link>
              );
            })}
          </nav>

          {/* Language Switcher */}
          <div className="p-4 border-t border-white/10 flex justify-center">
            <button
              onClick={() => setLanguage(language === 'en' ? 'id' : 'en')}
              className="text-xs bg-neutral-800 hover:bg-neutral-700 px-4 py-2 rounded text-white flex gap-2 items-center w-full justify-center"
            >
              <Globe size={14} />
              {language === 'en' ? 'Switch to ID' : 'Switch to EN'}
            </button>
          </div>
        </div>
      </aside>

      {/* ================= MOBILE BOTTOM NAV ================= */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#1A1A1A] border-t border-white/10 md:hidden">
        <div className="flex justify-around py-4">
          {menuItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center text-xs ${isActive ? "text-white" : "text-white/50"
                  }`}
              >
                <Icon size={22} />
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
