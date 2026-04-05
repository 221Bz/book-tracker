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
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY;
        const url = new URL('https://www.googleapis.com/books/v1/volumes');
        url.searchParams.set('q', search);
        if (apiKey) {
          url.searchParams.set('key', apiKey);
        }

        const res = await fetch(url.toString());

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData?.error?.message || `Error fetching books (Status: ${res.status})`);
        }

        const data: { items?: GoogleBook[] } = await res.json();
        setBooks(data.items ?? []);
      } catch (err: unknown) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Gagal mengambil data buku");
        setBooks([]);
      } finally {
        setLoading(false);
      }
    }, 500)

    return () => clearTimeout(timeout)
  }, [search])

  return { books, loading, error }
}
