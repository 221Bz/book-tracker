'use client';

import { UserBook, statusColors } from "./LibraryData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Trash2, RefreshCw, Heart } from "lucide-react";

interface BookGridProps {
  books: UserBook[];
  expandedBookId: string | null;
  setExpandedBookId: (id: string | null) => void;
  renderStars: (rating: number) => React.ReactNode;
  onUpdateClick: (book: UserBook) => void;
  onDeleteClick: (id: string) => void;
  onToggleFavorite: (book: UserBook) => void;

  // ✅ tambahkan ini
  mode: "library" | "explore";
}

export default function BookGrid({
  books,
  expandedBookId,
  setExpandedBookId,
  renderStars,
  onUpdateClick,
  onDeleteClick,
  onToggleFavorite,
}: BookGridProps) {
  return (
    <div className="overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 pr-2">
      {books.map((book) => {
        const isExpanded = expandedBookId === book.id;
        const coverUrl = book.cover_url;

        return (
          <Card
            key={book.id}
            className="rounded-xl bg-[#1C1C1C] hover:bg-[#232323] transition shadow-sm flex flex-col p-0"
          >
            {/* Cover */}
            <div className="w-full h-44 flex items-center justify-center bg-transparent rounded-t-2xl overflow-hidden">
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt={book.title}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <div className="w-full h-44 flex items-center justify-center bg-neutral-300 rounded-t-2xl">
                  <BookOpen className="text-neutral-600" />
                </div>
              )}
            </div>

            {/* Header */}
            <CardHeader className="flex flex-col gap-2 pt-2 pb-2 px-3">
              <div className="flex justify-between items-start gap-2">
                <CardTitle className="text-lg text-white flex-1 wrap-break-words">
                  {book.title}
                </CardTitle>

                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    statusColors[book.status]
                  }`}
                >
                  {book.status === "finished"
                    ? "Finished"
                    : book.status === "reading"
                    ? "Reading"
                    : "Want to Read"}
                </span>
              </div>

              <p className="text-sm text-neutral-400">{book.author}</p>
              <p className="text-xs text-neutral-500">{book.published_year}</p>

              <p
                className={`text-sm text-neutral-400 leading-relaxed ${
                  isExpanded ? "" : "line-clamp-3"
                }`}
              >
                {book.description}
              </p>

              {book.description?.length > 120 && (
                <button
                  onClick={() =>
                    setExpandedBookId(isExpanded ? null : book.id)
                  }
                  className="self-start text-xs text-pink-400 hover:underline"
                >
                  {isExpanded ? "View less" : "View all"}
                </button>
              )}

              {/* ⭐ Rating + ❤️ Favorite */}
              <div className="flex items-center gap-2">
                <div className="flex gap-1">{renderStars(book.rating)}</div>

                <button onClick={() => onToggleFavorite(book)} className="mt-px">
                  <Heart
                    className={`w-5 h-5 transition ${
                      book.is_favorite
                        ? "fill-pink-500 text-pink-500"
                        : "text-neutral-500 hover:text-pink-400"
                    }`}
                  />
                </button>
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-2 mt-1">
                {(book.genres ?? []).map((genre) => (
                  <span
                    key={genre}
                    className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </CardHeader>

            {/* Progress & Actions */}
            <CardContent className="space-y-4 pt-0 px-3 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-white font-medium w-8 text-right">
                  {book.progress}%
                </span>
                <div className="flex-1 h-2 bg-neutral-400 rounded-full">
                  <div
                    className="h-2 bg-indigo-500 rounded-full"
                    style={{ width: `${book.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-between gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => onUpdateClick(book)}
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Update
                </Button>

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDeleteClick(book.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
