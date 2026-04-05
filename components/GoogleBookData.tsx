'use client'

import { useEffect, useState } from "react"

export interface GoogleBook {
  id: string
  volumeInfo: {
    title: string
    authors?: string[]
    description?: string
    categories?: string[]
    imageLinks?: {
      thumbnail?: string
    }
    pageCount?: number
    publishedDate?: string
  }
}

export interface OpenLibraryDoc {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  number_of_pages_median?: number;
  cover_i?: number;
  subject?: string[];
}

export function useGoogleBookData(search: string) {
  const [books, setBooks] = useState<GoogleBook[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!search.trim()) {
      setBooks([])
      return
    }

    const timeout = setTimeout(async () => {
      setLoading(true)
      setError(null)

      try {
        const query = search.trim() === "popular books" ? "popular" : search;
        const res = await fetch(
          `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=15`
        )

        if (!res.ok) {
          throw new Error("Gagal mengambil data dari OpenLibrary")
        }

        const data: { docs: OpenLibraryDoc[] } = await res.json();

        // Coba transform data agar sesuai dengan interface GoogleBook lama
        // Supaya kita tidak perlu mengubah BookCard
        const mappedBooks: GoogleBook[] = data.docs.map(doc => ({
          id: doc.key.replace('/works/', ''),
          volumeInfo: {
            title: doc.title,
            authors: doc.author_name,
            description: "No Description available from OpenLibrary Search.",
            imageLinks: doc.cover_i ? { thumbnail: `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` } : undefined,
            publishedDate: doc.first_publish_year?.toString(),
            categories: doc.subject?.slice(0, 3), // Ambil maksimal 3 kategori
            pageCount: doc.number_of_pages_median
          }
        }));

        setBooks(mappedBooks ?? [])
      } catch (err: unknown) {
        console.error(err)
        setError(err instanceof Error ? err.message : "Gagal mengambil data buku")
        setBooks([])
      } finally {
        setLoading(false)
      }
    }, 500)

    return () => clearTimeout(timeout)
  }, [search])

  return { books, loading, error }
}
