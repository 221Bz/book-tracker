'use client'

import { useLibraryData } from "@/components/LibraryData"
import Sidebar from "@/components/Sidebar"
import BookCard from "@/components/BookCard"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import Quote from "@/components/Quote"
import BookStatsCard from "@/components/BookStatsCard"
import NotesCard from "@/components/ReadingGoal"
import {
  BookCardSkeleton,
  QuoteSkeleton,
  BookStatsCardSkeleton,
  ReadingGoalSkeleton,
  Skel
} from "@/components/Skeletons"

export default function Dashboard() {
  const { userBooks = [], loading } = useLibraryData()
  const favoriteBooks = userBooks.filter(book => book.is_favorite)

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

        {/* Title */}
        {loading ? (
          <Skel w="w-1/2" h="h-12 mb-8" />
        ) : (
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8">
            BookGraph
          </h1>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-4 space-y-6">
            {loading ? <QuoteSkeleton /> : <Quote />}

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
              {loading ? <BookStatsCardSkeleton /> : <BookStatsCard />}
              {loading ? <ReadingGoalSkeleton /> : <NotesCard />}
            </div>
          </div>



          {/* RIGHT COLUMN */}
          <div className="lg:col-span-8 flex flex-col overflow-y-auto lg:max-h-[calc(90vh-4rem)]">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
              {loading ? (
                <Skel w="w-48" h="h-10" />
              ) : (
                <Button
                  variant="secondary"
                  className="rounded-full bg-neutral-800 hover:bg-neutral-700 text-sm px-4 py-2 text-white"
                >
                  <Heart className="w-4 h-4 mr-2 text-pink-400" />
                  Favorite Books
                </Button>
              )}
            </div>

            {/* Favorite Books Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                  <BookCardSkeleton key={i} />
                ))
                : favoriteBooks.length === 0
                  ? (
                    <p className="sm:col-span-2 text-center text-neutral-400 mt-10">
                      You haven’t favorited any books yet
                    </p>
                  )
                  : favoriteBooks.map(book => (
                    <BookCard key={book.id} book={book} mode="library" hideDates={true} />
                  ))
              }
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
