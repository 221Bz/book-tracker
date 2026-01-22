'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/Sidebar"
import { Button } from "@/components/ui/button"
import { Camera, BookOpen, Trash2 } from "lucide-react"
import { useLibraryData, UserBook } from "@/components/LibraryData"
import { supabase } from "@/lib/supabaseClient"

interface AuthUser {
  id: string
  email: string
  user_metadata: {
    custom_name?: string
    avatar_url?: string
    provider_avatar_url?: string
  }
}

export default function ProfilePage() {
  const router = useRouter()
  const { userBooks, loading: libraryLoading, toggleOnProfile } = useLibraryData()

  const [user, setUser] = useState<AuthUser | null>(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState("")
  const [editMode, setEditMode] = useState(false)
  const [loading, setLoading] = useState(true)

  const [profileBooks, setProfileBooks] = useState<UserBook[]>([])
  const [selectorOpen, setSelectorOpen] = useState(false)

  /* =====================
     Load Profile
  ===================== */
  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        router.push("/api/auth/login")
        return
      }

      const authUser = session.user as AuthUser
      setUser(authUser)
      setEmail(authUser.email ?? "")

      const { data: profile } = await supabase
        .from("profiles")
        .select("name, avatar_url")
        .eq("id", authUser.id)
        .single()

      setName(profile?.name ?? authUser.user_metadata.custom_name ?? "")

      if (profile?.avatar_url) {
        const url = profile.avatar_url.startsWith("http")
          ? profile.avatar_url
          : supabase.storage.from("images").getPublicUrl(profile.avatar_url).data.publicUrl
        setPhotoPreview(url)
      }
    }

    loadProfile()
  }, [router, supabase.auth, supabase.storage])

  /* =====================
     Update profileBooks ketika userBooks berubah
  ===================== */
  useEffect(() => {
    if (!libraryLoading) {
      // pakai setTimeout 0 supaya React nggak protes
      const timer = setTimeout(() => {
        setProfileBooks(userBooks.filter(b => b.on_profile).slice(0, 4))
        setLoading(false)
      }, 0)

      return () => clearTimeout(timer)
    }
  }, [userBooks, libraryLoading, setProfileBooks, setLoading])

  /* =====================
     Handlers
  ===================== */
  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const getInitials = (n: string) =>
    n.split(" ").map(x => x[0]).join("").toUpperCase()

  const saveProfile = async () => {
    if (!user) return

    let avatarPath = user.user_metadata.avatar_url ?? null

    if (photo) {
      const fileName = photo.name.replace(/\s/g, "_")
      const path = `user-${user.id}/${Date.now()}-${fileName}`

      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(path, photo, { upsert: true })

      if (uploadError) {
        console.error("Upload error:", uploadError)
        alert("Upload avatar gagal")
        return
      }

      avatarPath = path
    }

    // Update Supabase Auth
    const { error: authError } = await supabase.auth.updateUser({
      email: email !== user.email ? email : undefined,
      password: password || undefined,
      data: { custom_name: name, avatar_url: avatarPath },
    })

    if (authError) {
      console.error("Auth update error:", authError)
      alert("Update auth gagal")
      return
    }

    // Update table profiles
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .upsert({ id: user.id, name, avatar_url: avatarPath })
      .select()
      .single()

    if (profileError) {
      console.error("Profile update error:", profileError)
      alert("Update profile gagal")
      return
    }

    // Update local preview
    const { data } = supabase.storage.from("images").getPublicUrl(profile.avatar_url)
    setPhotoPreview(data?.publicUrl ?? "")
    setEditMode(false)
  }

  const handleSelectBook = (book: UserBook) => {
    toggleOnProfile(book)
    setSelectorOpen(false)
  }

  /* =====================
     Render
  ===================== */
  return (
    <div className="flex min-h-screen text-white">
      <Sidebar />

      <div className="w-full px-4 sm:px-6 md:px-10 pt-6 pb-24 md:pb-8 md:ml-64">

        {/* PROFILE CARD */}
        <div className="mb-12 flex flex-col items-center text-center gap-6 sm:flex-row sm:text-left sm:items-start sm:gap-10">
          <div className="relative w-24 h-24 sm:w-32 sm:h-32">
            {loading ? (
              <div className="w-full h-full rounded-full bg-neutral-700 animate-pulse" />
            ) : (
              <div
                className={`w-full h-full rounded-full ${photoPreview
                  ? "bg-cover bg-center ring-4 ring-neutral-400"
                  : "bg-neutral-700 flex items-center justify-center text-2xl sm:text-3xl font-bold"
                  }`}
                style={photoPreview ? { backgroundImage: `url(${photoPreview})` } : undefined}
              >
                {!photoPreview && getInitials(name)}
              </div>
            )}
            {editMode && !loading && (
              <label className="absolute bottom-1 right-1 bg-neutral-600 p-2 rounded-full cursor-pointer">
                <Camera className="text-white" />
                <input type="file" hidden onChange={handlePhoto} />
              </label>
            )}
          </div>

          <div className="flex-1 w-full space-y-3">
            {loading ? (
              <div className="flex flex-col items-center sm:items-start space-y-2">
                <div className="h-6 w-36 bg-neutral-700 rounded animate-pulse" />
                <div className="h-4 w-48 bg-neutral-700 rounded animate-pulse" />
                <div className="h-10 w-32 bg-neutral-700 rounded animate-pulse mt-4" />
              </div>
            ) : editMode ? (
              <>
                <input
                  className="w-full rounded-xl px-4 py-2 text-white outline"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Name"
                />
                <input
                  className="w-full rounded-xl px-4 py-2 text-white outline"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Email"
                />
                <input
                  type="password"
                  className="w-full rounded-xl px-4 py-2 text-white outline"
                  placeholder="New password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <div className="flex gap-2 justify-center sm:justify-end mt-4">
                  <Button onClick={saveProfile} className="bg-neutral-500 hover:bg-neutral-600 text-white">
                    Save
                  </Button>
                  <Button variant="secondary" onClick={() => setEditMode(false)}>
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold p-0">{name}</div>
                <div className="text-neutral-400 p-0">{email}</div>
                <Button variant="secondary" className="mt-4" onClick={() => setEditMode(true)}>
                  Edit Profile
                </Button>
              </>
            )}
          </div>
        </div>

        {/* FEATURED BOOKS */}
        <div className="flex items-center justify-between gap-2 mb-4 flex-none">
          <div className="flex items-center gap-2 text-neutral-400">
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-neutral-700 rounded-full animate-pulse" />
                <div className="w-20 h-5 bg-neutral-700 rounded animate-pulse" />
              </div>
            ) : (
              <>
                <BookOpen className="w-4 h-4 text-pink-400" />
                <span>Featured Books</span>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-37 sm:h-55 md:h-60 bg-neutral-700 rounded-xl animate-pulse" />
            ))
            : profileBooks.map(b => (
              <div key={b.id} className="relative group bg-[#1C1C1C] rounded-xl overflow-hidden shadow-lg h-60 flex flex-col">
                {b.cover_url ? (
                  <img
                    src={b.cover_url}
                    alt={b.title}
                    className="w-full h-3/4 object-contain pt-2"
                  />
                ) : (
                  <div className="h-3/4 flex items-center justify-center text-neutral-500">
                    No Cover
                  </div>
                )}
                <div className="p-2 text-center text-xs text-neutral-400 line-clamp-1">
                  {b.title}
                </div>

                <button
                  onClick={() => toggleOnProfile(b)}
                  className="absolute top-1 right-1 bg-black/60 rounded-full p-1 opacity-0 group-hover:opacity-100 transition text-red-400 hover:text-red-500"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))
          }

          {!loading &&
            Array.from({ length: Math.max(0, 4 - profileBooks.length) }).map((_, i) => (
              <button
                key={i}
                onClick={() => setSelectorOpen(true)}
                className="border border-dashed border-neutral-700 hover:border-neutral-500 hover:bg-neutral-800/50 transition rounded-xl h-60 flex flex-col items-center justify-center text-neutral-600 gap-2"
              >
                <span className="text-3xl font-light">+</span>
                <span className="text-xs">Add to Profile</span>
              </button>
            ))
          }
        </div>
      </div>

      <BookSelectorDialog
        open={selectorOpen}
        onOpenChange={setSelectorOpen}
        userBooks={userBooks}
        onSelect={handleSelectBook}
      />
    </div>
  )
}

import BookSelectorDialog from "@/components/BookSelectorDialog"
