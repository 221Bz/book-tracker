'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { UserBook } from "./LibraryData"
import Link from "next/link"

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    userBooks: UserBook[]
    onSelect: (book: UserBook) => void
}

export default function BookSelectorDialog({ open, onOpenChange, userBooks, onSelect }: Props) {
    // Hanya tampilkan buku yang belum ada di profil
    const availableBooks = userBooks.filter(b => !b.on_profile)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-[#1C1C1C] text-white border-neutral-700 max-h-[80vh] overflow-y-auto w-full max-w-md">
                <DialogHeader>
                    <DialogTitle>Select Book to Showcase</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-2 mt-4">
                    {availableBooks.length === 0 ? (
                        <div className="text-center text-neutral-400 py-8">
                            <p>No books available.</p>
                            <Link href="/explore" className="text-pink-400 text-sm hover:underline mt-2">
                                Add books from Explore
                            </Link>
                        </div>
                    ) : (
                        availableBooks.map(book => (
                            <button
                                key={book.id}
                                onClick={() => onSelect(book)}
                                className="flex items-start gap-3 p-2 rounded-lg hover:bg-neutral-800 transition text-left"
                            >
                                <div className="w-12 h-16 bg-neutral-700 rounded overflow-hidden flex-none">
                                    {book.cover_url ? (
                                        <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs text-neutral-500">No Cover</div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-medium text-sm line-clamp-2">{book.title}</h3>
                                    <p className="text-xs text-neutral-400">{book.author}</p>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
