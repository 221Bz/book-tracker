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
        const res = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(search)}`
        )
        const data: { items?: GoogleBook[] } = await res.json()
        setBooks(data.items ?? [])
      } catch (err: unknown) {
        console.error(err)
        setError("Gagal mengambil data buku")
        setBooks([])
      } finally {
        setLoading(false)
      }
    }, 500)

    return () => clearTimeout(timeout)
  }, [search])

  return { books, loading, error }
}
