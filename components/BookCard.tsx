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
}

export default function BookCard({ book, mode = "explore" }: BookCardProps) {
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
      };
    }
  });

  const handleSetStatus = async (status: BookStatus) => {
    if (!("volumeInfo" in book)) return;

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    let bookRow = null;

    const { data: bookRowData, error: selectError } = await supabase
      .from("books")
      .select("id, pages")
      .eq("google_books_id", book.id)
      .single();

    if (selectError) {
      console.error(selectError);
      setLoading(false);
      return;
    }

    if (!bookRowData) {
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
        console.error(insertError);
        setLoading(false);
        return;
      }

      bookRow = insertedBook;
    } else {
      bookRow = bookRowData;
    }

    const lastPages = status === "finished" ? book.volumeInfo.pageCount ?? 0 : 0;
    const progress = status === "finished" ? 100 : 0;

    await supabase.from("user_books").upsert(
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

    // Update localBook supaya langsung refleksi ke UI
    setLocalBook((prev) => ({
      ...prev,
      last_pages: lastPages,
      progress,
      total_pages: book.volumeInfo.pageCount ?? prev.total_pages,
      book_id: bookRow.id,
    }));

    setLoading(false);
    setOpen(false);
  };

  const toggleFavorite = async () => {
    if (!isUserBook) return;

    setLoading(true);

    const { error } = await supabase
      .from("user_books")
      .update({ is_favorite: !isFavorite })
      .eq("id", (book as UserBook).id);

    if (!error) setIsFavorite(!isFavorite);

    setLoading(false);
  };

  // Render pakai localBook supaya warning hilang
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
                className={`w-4 h-4 transition ${
                  isFavorite
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
                className={`text-sm text-neutral-400 leading-relaxed ${
                  expanded ? "" : "line-clamp-3"
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
