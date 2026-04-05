'use client'

import Sidebar from "@/components/Sidebar"
import BookCard from "@/components/BookCard"
import { useGoogleBookData } from "@/components/GoogleBookData"
import { useState } from "react"
import { BookCardSkeleton } from "@/components/Skeletons"
import { useLanguage } from "@/context/LanguageContext"

export default function Explore() {
  const [search, setSearch] = useState("")
  const { t } = useLanguage()
  const query = search.trim() === "" ? "popular books" : search
  const { books = [], loading, error } = useGoogleBookData(query)

  return (
    <div className="flex min-h-screen text-white">
      <Sidebar />

      <main className="
  w-full
  px-4 sm:px-6 md:px-10
  pt-6
  pb-24 md:pb-8
  md:ml-64
">

        <input
          placeholder={t("Search books...")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2 bg-neutral-800 rounded"
        />

        {error && <p className="text-red-400 mt-3">{t(error)}</p>}

        <div className="
grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3
  gap-4 md:gap-6
  mt-6 overflow-y-auto lg:max-h-[calc(90vh-4rem)]
">

          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <BookCardSkeleton key={i} />
            ))
          ) : books.length === 0 ? (
            <p className="col-span-3 text-center text-neutral-400">
              {t("No books found")}
            </p>
          ) : (
            books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))
          )}
        </div>
      </main>
    </div>
  )
}
