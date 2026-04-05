"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Heart } from "lucide-react";

export type Mode = "explore" | "library";
export type BookStatus = "want" | "reading" | "finished";

export interface UserBook {
  id: string;
  book_id?: string;
  status?: BookStatus;
  last_pages?: number;
  progress?: number;
  total_pages?: number;
  is_favorite?: boolean;

  title: string;
  author?: string;
  description?: string;
  cover_url?: string | null;
  published_year?: string;
  genres?: string[];
  pages?: number;
  started_at?: string | null;
  finished_at?: string | null;
}

export interface GoogleBook {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    imageLinks?: { thumbnail?: string };
    publishedDate?: string;
    categories?: string[];
    pageCount?: number;
  };
}

export interface BookCardProps {
  book: GoogleBook | UserBook;
  mode?: Mode;
  hideDates?: boolean;
}

export default function BookCard({ book, mode = "explore", hideDates = false }: BookCardProps) {
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [open, setOpen] = useState(false);

  const isUserBook = !("volumeInfo" in book);

  const [isFavorite, setIsFavorite] = useState(
    isUserBook ? book.is_favorite ?? false : false
  );

  // Local state dipakai untuk render & update UI
  const [localBook, setLocalBook] = useState<UserBook>(() => {
    if ("volumeInfo" in book) {
      return {
        id: "",
        book_id: "",
        title: book.volumeInfo.title,
        author: book.volumeInfo.authors?.join(", ") ?? "Unknown",
        description: book.volumeInfo.description ?? "",
        cover_url: book.volumeInfo.imageLinks?.thumbnail ?? null,
        published_year: book.volumeInfo.publishedDate?.slice(0, 4) ?? "",
        genres: book.volumeInfo.categories ?? [],
        last_pages: 0,
        progress: 0,
        total_pages: book.volumeInfo.pageCount ?? 0,
        is_favorite: false,
      };
    } else {
      return {
        ...book,
        last_pages: book.last_pages ?? 0,
        progress: book.progress ?? 0,
        total_pages: book.total_pages ?? book.pages ?? 0,
        is_favorite: book.is_favorite ?? false,
        started_at: book.started_at ?? null,
        finished_at: book.finished_at ?? null,
      };
    }
  });

  const handleSetStatus = async (status: BookStatus) => {
    if (!("volumeInfo" in book)) return;

    if (!book.id) {
      console.error("Book ID is missing:", book);
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.warn("User not logged in");
        setLoading(false);
        return;
      }

      // Cari buku di database
      const { data: bookRowData, error: selectError } = await supabase
        .from("books")
        .select("id, pages")
        .eq("google_books_id", book.id)
        .maybeSingle(); // <-- pakai maybeSingle supaya tidak error kalau data kosong

      if (selectError) {
        console.error("Error selecting book:", selectError);
        setLoading(false);
        return;
      }

      let bookRow = bookRowData;

      // Kalau buku belum ada, insert
      if (!bookRow) {
        const { data: insertedBook, error: insertError } = await supabase
          .from("books")
          .insert({
            google_books_id: book.id,
            title: book.volumeInfo.title,
            author: book.volumeInfo.authors?.join(", ") ?? "Unknown",
            description: book.volumeInfo.description ?? "",
            cover_url: book.volumeInfo.imageLinks?.thumbnail ?? null,
            published_year: book.volumeInfo.publishedDate?.slice(0, 4) ?? "",
            genres: book.volumeInfo.categories ?? [],
            pages: book.volumeInfo.pageCount ?? 0,
          })
          .select()
          .single();

        if (insertError || !insertedBook) {
          console.error("Error inserting book:", insertError);
          setLoading(false);
          return;
        }

        bookRow = insertedBook;
      }

      if (!bookRow) {
        console.error("bookRow is null after insert");
        setLoading(false);
        return;
      }

      // Hitung progress & last pages
      const lastPages = status === "finished" ? book.volumeInfo.pageCount ?? 0 : 0;
      const progress = status === "finished" ? 100 : 0;

      // Upsert ke user_books
      const { error: upsertError } = await supabase.from("user_books").upsert(
        {
          user_id: user.id,
          book_id: bookRow.id,
          status,
          last_pages: lastPages,
          progress,
          rating: 0,
          is_favorite: false,
        },
        { onConflict: "user_id,book_id" }
      );

      if (upsertError) {
        console.error("Error updating user_books:", upsertError);
        setLoading(false);
        return;
      }

      // Update state lokal
      setLocalBook((prev) => ({
        ...prev,
        last_pages: lastPages,
        progress,
        total_pages: book.volumeInfo.pageCount ?? prev.total_pages,
        book_id: bookRow.id,
      }));

      setOpen(false);
    } catch (err) {
      console.error("Unexpected error in handleSetStatus:", err);
    } finally {
      setLoading(false);
    }
  };


  const toggleFavorite = async () => {
    if (!isUserBook) return;

    setLoading(true);

    const newIsFavorite = !isFavorite;
    const updates: any = { is_favorite: newIsFavorite };
    if (!newIsFavorite) {
      updates.on_profile = false;
    }

    const { error } = await supabase
      .from("user_books")
      .update(updates)
      .eq("id", (book as UserBook).id);

    if (!error) setIsFavorite(newIsFavorite);

    setLoading(false);
  };

  const title = localBook.title;
  const author = localBook.author ?? "Unknown";
  const cover = localBook.cover_url;
  const desc = localBook.description ?? "";
  const publishedYear = localBook.published_year ?? "";
  const genres = localBook.genres ?? [];

  return (
    <>
      <Card
        onClick={() => mode === "explore" && setOpen(true)}
        className="cursor-pointer rounded-xl bg-[#1C1C1C] hover:bg-[#232323] transition flex flex-col p-0"
      >
        <div className="relative w-full h-44 flex items-center justify-center rounded-t-xl overflow-hidden">
          {mode === "library" && isUserBook && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite();
              }}
              className="absolute top-2 left-2 z-10 p-1 rounded-full"
            >
              <Heart
                className={`w-4 h-4 transition ${isFavorite
                  ? "fill-pink-500 text-pink-500"
                  : "text-white hover:text-pink-400"
                  }`}
              />
            </button>
          )}

          {cover ? (
            <img
              src={cover}
              alt={title}
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <BookOpen className="text-neutral-600 w-12 h-12" />
          )}
        </div>

        <CardHeader className="flex flex-col gap-2 pt-2 pb-3 px-3">
          <CardTitle className="text-lg text-white wrap-break-words">
            {title}
          </CardTitle>

          <p className="text-sm text-neutral-400">{author}</p>
          <p className="text-xs text-neutral-500">{publishedYear}</p>

          {desc && (
            <>
              <p
                className={`text-sm text-neutral-400 leading-relaxed ${expanded ? "" : "line-clamp-3"
                  }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded(!expanded);
                }}
              >
                {desc}
              </p>
              {desc.length > 120 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpanded(!expanded);
                  }}
                  className="self-start text-xs text-pink-400 hover:underline"
                >
                  {expanded ? "View less" : "View all"}
                </button>
              )}
            </>
          )}

          {/* Dates (Only for UserBooks) */}
          {!hideDates && (localBook.started_at || localBook.finished_at) && (
            <div className="flex flex-col gap-1 text-[10px] text-neutral-400 bg-neutral-800/50 p-2 rounded-md mt-2 mb-1">
              {localBook.started_at && (
                <div className="flex justify-between">
                  <span>Started:</span>
                  <span className="font-medium text-white">
                    {new Date(localBook.started_at).toLocaleDateString("id-ID", {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </span>
                </div>
              )}
              {localBook.finished_at && (
                <div className="flex justify-between">
                  <span>Finished:</span>
                  <span className="font-medium text-green-400">
                    {new Date(localBook.finished_at).toLocaleDateString("id-ID", {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </span>
                </div>
              )}
            </div>
          )}

          {genres.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-1 mb-2">
              {genres.map((g) => (
                <span
                  key={g}
                  className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full"
                >
                  {g}
                </span>
              ))}
            </div>
          )}
        </CardHeader>
      </Card>

      {mode === "explore" && open && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-[#1C1C1C] rounded-2xl p-6 w-80 flex flex-col gap-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-white" />
              <span className="text-white font-semibold text-lg">
                Add to Library
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                variant="default"
                disabled={loading}
                onClick={() => handleSetStatus("reading")}
              >
                Reading
              </Button>
              <Button
                variant="default"
                disabled={loading}
                onClick={() => handleSetStatus("want")}
              >
                Want to Read
              </Button>
              <Button
                variant="default"
                disabled={loading}
                onClick={() => handleSetStatus("finished")}
              >
                Finished
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
