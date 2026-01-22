'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

/* =====================
   Types
===================== */

export type BookStatus = "want" | "reading" | "finished";

export interface UserBook {
  id: string;
  status: BookStatus;
  progress: number;
  rating: number;
  last_read_at: string | null;
  is_favorite: boolean;
  last_pages: number;

  title: string;
  author: string;
  genres: string[];
  cover_url: string | null;
  description: string;
  published_year: string;
  pages: number;
}

export type UserBookForm = {
  status: BookStatus;
  last_pages: number;
  rating: number;
};

export const statusColors: Record<BookStatus, string> = {
  finished: "bg-green-100 text-green-800",
  reading: "bg-blue-100 text-blue-800",
  want: "bg-orange-100 text-orange-800",
};

/* =====================
   Hook
===================== */

export function useLibraryData() {
  const router = useRouter();

  const [userBooks, setUserBooks] = useState<UserBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"all" | BookStatus>("all");
  const [sort, setSort] = useState<"last_read" | "rating" | "title">("last_read");
  const [selectedBook, setSelectedBook] = useState<UserBook | null>(null);
  const [expandedBookId, setExpandedBookId] = useState<string | null>(null);
  const [formData, setFormData] = useState<UserBookForm>({
    status: "want",
    last_pages: 0,
    rating: 0,
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserBooks = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/api/auth/login");

      const { data, error } = await supabase
        .from("user_books")
        .select(`
          id,
          status,
          progress,
          rating,
          last_read_at,
          is_favorite,
          last_pages,
          books (
            title,
            author,
            genres,
            cover_url,
            description,
            published_year,
            pages
          )
        `)
        .eq("user_id", user.id);

      if (error) return console.error(error);

      interface SupabaseRow {
        id: string;
        status: BookStatus;
        progress: number;
        rating: number;
        last_read_at: string | null;
        is_favorite: boolean;
        last_pages: number;
        books: {
          title: string | null;
          author: string | null;
          genres: string[] | null;
          cover_url: string | null;
          description: string | null;
          published_year: string | null;
          pages: number | null;
        } | null;
      }

      const mapped: UserBook[] = (data as unknown as SupabaseRow[])?.map((row) => {
        const book = row.books;
        if (!book) return null;
        return {
          id: row.id,
          status: row.status,
          progress: row.progress,
          rating: row.rating,
          last_read_at: row.last_read_at,
          is_favorite: row.is_favorite,
          last_pages: row.last_pages,
          title: book.title ?? "",
          author: book.author ?? "Unknown",
          genres: book.genres ?? [],
          cover_url: book.cover_url ?? null,
          description: book.description ?? "",
          published_year: book.published_year ?? "",
          pages: book.pages ?? 0,
        };
      }).filter(Boolean) as UserBook[];

      setUserBooks(mapped);
      setLoading(false);
    };

    fetchUserBooks();
  }, [router, supabase.auth]);

  // Filter & Sort
  const filteredBooks = userBooks
    .filter((b) => status === "all" || b.status === status)
    .sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      if (sort === "rating") return b.rating - a.rating;
      const aTime = a.last_read_at ? new Date(a.last_read_at).getTime() : 0;
      const bTime = b.last_read_at ? new Date(b.last_read_at).getTime() : 0;
      return bTime - aTime;
    });

  // Stars
  const renderStars = (book: UserBook) =>
    Array.from({ length: 5 }).map((_, i) => {
      const index = i + 1;
      return (
        <button
          key={i}
          type="button"
          className="p-0 m-0"
          onClick={() => onUpdateRating(book, index)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={index <= (book.rating ?? 0) ? "currentColor" : "none"}
            stroke="currentColor"
            className={`w-4 h-4 transition ${index <= (book.rating ?? 0) ? "text-yellow-400" : "text-gray-400"}`}
          >
            <path d="M12 .587l3.668 7.431L24 9.748l-6 5.847L19.336 24 12 20.201 4.664 24 6 15.595 0 9.748l8.332-1.73z" />
          </svg>
        </button>
      );
    });


  const onUpdateRating = async (book: UserBook, rating: number) => {
    const { error } = await supabase.from("user_books").update({ rating }).eq("id", book.id);
    if (error) return console.error(error);
    setUserBooks((prev) => prev.map((b) => (b.id === book.id ? { ...b, rating } : b)));
  };

  const handleUpdateClick = (book: UserBook) => {
    setSelectedBook(book);
    setFormData({
      status: book.status,
      last_pages: book.last_pages,
      rating: book.rating,
    });
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedBook) return;
    const progress = selectedBook.pages > 0 ? Math.min(100, Math.round((formData.last_pages / selectedBook.pages) * 100)) : 0;
    const now = new Date().toISOString();

    const { error } = await supabase.from("user_books").update({
      status: formData.status,
      last_pages: formData.last_pages,
      rating: formData.rating,
      progress,
      last_read_at: now
    }).eq("id", selectedBook.id);

    if (error) return console.error(error);

    setUserBooks((prev) => prev.map((b) => (b.id === selectedBook.id ? { ...b, ...formData, progress, last_read_at: now } : b)));
    setEditDialogOpen(false);
    setSelectedBook(null);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("user_books").delete().eq("id", id);
    if (error) return console.error(error);
    setUserBooks((prev) => prev.filter((b) => b.id !== id));
    setDeleteId(null);
  };

  const toggleFavorite = async (book: UserBook) => {
    const { error } = await supabase.from("user_books").update({ is_favorite: !book.is_favorite }).eq("id", book.id);
    if (error) return console.error(error);
    setUserBooks((prev) => prev.map((b) => (b.id === book.id ? { ...b, is_favorite: !b.is_favorite } : b)));
  };

  const handleFormChange = <K extends keyof UserBookForm>(field: K, value: UserBookForm[K]) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      if (field === 'status' && value === 'finished' && selectedBook?.pages) {
        newData.last_pages = selectedBook.pages;
      }
      return newData;
    });
  };

  return {
    userBooks,
    filteredBooks,
    loading,
    status,
    setStatus,
    sort,
    setSort,
    selectedBook,
    setSelectedBook,
    expandedBookId,
    setExpandedBookId,
    formData,
    setFormData,
    editDialogOpen,
    setEditDialogOpen,
    deleteId,
    setDeleteId,
    renderStars,
    onUpdateRating,
    handleUpdateClick,
    handleUpdate,
    handleDelete,
    toggleFavorite,
    handleFormChange
  };
}
