'use client'

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface LibraryHeaderProps {
  sort: 'last_read' | 'rating' | 'title';
  setSort: (v: 'last_read' | 'rating' | 'title') => void;
}

export default function LibraryHeader({ sort, setSort }: LibraryHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6 flex-none">
      <h1 className="text-2xl font-semibold flex items-center gap-2 text-white">
        My Library
      </h1>

      <div>
        <Select value={sort} onValueChange={v => setSort(v as 'last_read' | 'rating' | 'title')}>
          <SelectTrigger className="w-48 h-11 px-4 py-2 bg-[#1C1C1C] text-white rounded-xl border border-white/20 hover:border-white transition">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="bg-[#1C1C1C] text-white rounded-xl shadow-lg border border-white/10">
            <SelectItem
              value="last_read"
              className="hover:bg-white/10 cursor-pointer px-4 py-2 rounded-lg transition"
            >
              Last Read
            </SelectItem>
            <SelectItem
              value="rating"
              className="hover:bg-white/10 cursor-pointer px-4 py-2 rounded-lg transition"
            >
              Rating
            </SelectItem>
            <SelectItem
              value="title"
              className="hover:bg-white/10 cursor-pointer px-4 py-2 rounded-lg transition"
            >
              Title
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
