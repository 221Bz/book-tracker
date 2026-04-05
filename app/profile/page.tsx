'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/Sidebar"
import { Button } from "@/components/ui/button"
import { Camera, Heart } from "lucide-react"
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
  const [favModalOpen, setFavModalOpen] = useState(false)

  const [favoriteBooks, setFavoriteBooks] = useState<UserBook[]>([])

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
     Update favorites ketika userBooks berubah
  ===================== */
  useEffect(() => {
    if (!libraryLoading) {
      // pakai setTimeout 0 supaya React nggak protes
      const timer = setTimeout(() => {
        setFavoriteBooks(userBooks.filter(b => b.on_profile && b.is_favorite).slice(0, 4))
        setLoading(false)
      }, 0)

      return () => clearTimeout(timer)
    }
  }, [userBooks, libraryLoading, setFavoriteBooks, setLoading])

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

        {/* FAVORITES */}
        <div className="flex items-center gap-2 mb-4 flex-none">
          <div className="flex items-center gap-2 text-neutral-400">
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-neutral-700 rounded-full animate-pulse" />
                <div className="w-20 h-5 bg-neutral-700 rounded animate-pulse" />
              </div>
            ) : (
              <>
                <Heart className="w-4 h-4 text-pink-400" />
                <span>Favorites</span>
                {!loading && (
                  <button
                    onClick={() => setFavModalOpen(true)}
                    className="ml-4 text-xs bg-neutral-800 hover:bg-neutral-700 px-3 py-1 rounded text-white"
                  >
                    Edit
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-37 sm:h-55 md:h-92 lg:h-92 bg-neutral-700 rounded-xl animate-pulse" />
            ))
            : favoriteBooks.map(b => (
              <div key={b.id} className="bg-[#1C1C1C] rounded-xl overflow-hidden">
                {b.cover_url ? (
                  <img
                    src={b.cover_url}
                    alt={b.title}
                    className="w-full h-auto object-contain"
                  />
                ) : (
                  <div className="h-48 flex items-center justify-center text-neutral-500">
                    No Cover
                  </div>
                )}
              </div>
            ))
          }

          {!loading &&
            Array.from({ length: Math.max(0, 4 - favoriteBooks.length) }).map((_, i) => (
              <div
                key={i}
                className="border border-dashed border-neutral-700 rounded-xl h-37 sm:h-55 md:h-92 lg:h-92 flex items-center justify-center text-neutral-600"
              >
                +
              </div>
            ))
          }
        </div>
      </div>

      {/* Edit Favorites Modal */}
      {favModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex flex-col pt-10 px-4 pb-4 items-center justify-center">
          <div className="bg-[#1C1C1C] flex flex-col p-4 rounded-xl max-w-4xl w-full max-h-[80vh]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white font-bold text-xl">Select Favorites</h2>
              <button onClick={() => setFavModalOpen(false)} className="text-neutral-400 hover:text-white">Close</button>
            </div>

            <div className="overflow-y-auto flex-1 pr-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {userBooks.filter(b => b.is_favorite).map(book => (
                  <div
                    key={book.id}
                    className="relative cursor-pointer group"
                    onClick={() => toggleOnProfile(book)}
                  >
                    <div className={`p-1 border-2 rounded-xl h-48 md:h-56 ${book.on_profile ? 'border-pink-500' : 'border-transparent group-hover:border-neutral-600'}`}>
                      {book.cover_url ? (
                        <img src={book.cover_url} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <div className="w-full h-full bg-neutral-800 rounded-lg flex items-center justify-center text-xs text-neutral-500 text-center p-2">
                          {book.title}
                        </div>
                      )}
                    </div>
                    {book.on_profile && (
                      <div className="absolute top-3 right-3 p-1.5 bg-black/60 rounded-full">
                        <Heart className="w-4 h-4 transition fill-pink-500 text-pink-500" />
                      </div>
                    )}
                  </div>
                ))}
                {userBooks.filter(b => b.is_favorite).length === 0 && (
                  <p className="col-span-full text-center text-neutral-400 py-10">
                    Kamu belum memiliki buku favorit di Library.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
