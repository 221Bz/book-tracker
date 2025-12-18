'use client'

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabaseClient"

export interface Book {
    id: string
    title: string
    author: string
    published_year: string
    cover_url: string
    description: string
    genres: string[]
  }

export function useExploreData() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [yearFilter, setYearFilter] = useState("all")
  const [expandedBookId, setExpandedBookId] = useState<string | null>(null)

  const fetchBooks = useCallback(async () => {
    setLoading(true)

    let query = supabase
      .from("books")
      .select("id, title, author, published_year, cover_url, description, genres")

    if (search.trim()) {
      query = query.or(`title.ilike.%${search}%,author.ilike.%${search}%`)
    }

    if (yearFilter === "2020+") {
      query = query.gte("published_year", "2020")
    } else if (yearFilter === "2010s") {
      query = query.gte("published_year", "2010").lt("published_year", "2020")
    } else if (yearFilter === "old") {
      query = query.lt("published_year", "2010")
    }

    const { data, error } = await query.order("published_year", { ascending: false })
    if (!error) setBooks(data ?? [])
    setLoading(false)
  }, [search, yearFilter])

  // Auto fetch with debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchBooks()
    }, 300)
    return () => clearTimeout(timeout)
  }, [fetchBooks])

  return {
    books,
    loading,
    search,
    setSearch,
    yearFilter,
    setYearFilter,
    expandedBookId,
    setExpandedBookId,
  }
}
