"use client";

export const Skel = ({
  w = "w-full",
  h = "h-4",
  className = "",
}: {
  w?: string
  h?: string
  className?: string
}) => <div className={`animate-pulse bg-gray-300 rounded ${w} ${h} ${className}`} />
// =====================
// BookCard Skeleton
// =====================
export const BookCardSkeleton = () => (
  <div className="rounded-xl bg-[#1C1C1C] animate-pulse flex flex-col">
    {/* Cover */}
    <div className="w-full h-44 flex items-center justify-center bg-neutral-800 rounded-t-2xl">
      <Skel w="w-12" h="h-12" /> {/* icon placeholder */}
    </div>

    <div className="flex flex-col gap-1 pt-2 pb-3 px-3">
      <Skel w="w-3/4" h="h-5" /> {/* Title */}
      <Skel w="w-1/2" h="h-4" /> {/* Author */}
      <Skel w="w-1/4" h="h-3" /> {/* Published year */}
      <Skel w="w-full" h="h-3" /> {/* Desc line 1 */}
      <Skel w="w-5/6" h="h-3" /> {/* Desc line 2 */}
      <Skel w="w-3/4" h="h-3" /> {/* Desc line 3 */}
      <div className="flex flex-wrap gap-2 mt-2">
        <Skel w="w-12" h="h-5" />
        <Skel w="w-16" h="h-5" />
        <Skel w="w-10" h="h-5" />
      </div>
      <Skel w="w-20" h="h-7" /> {/* Favorite button */}
    </div>
  </div>
);

// =====================
// NotesCard Skeleton
// =====================
export const ReadingGoalSkeleton = () => (
  <div className="p-4 animate-pulse flex flex-col gap-2">
    <Skel w="w-30" h="h-5" /> {/* ★ NOTES header */}
    <Skel w="w-full" h="h-3" /> {/* first line */}
    <Skel w="w-20" h="h-4" /> {/* second line */}
    <Skel w="w-full" h="h-8" /> {/* third line */}
  </div>
);

export const BookStatsCardSkeleton = () => {
  return (
    <div className=" rounded-xl p-4 flex flex-col gap-2">
      {/* Header */}
      <Skel w="w-45" h="h-5" />
      {/* Total buku */}
      <Skel w="w-25" h="h-5" />
      <Skel w="w-20" h="h-4" />
      {/* Label Progress */}
      <Skel w="w-25" h="h-5" />
      <Skel w="w-20" h="h-4" />
    </div>
  );
};

export const QuoteSkeleton = () => {
  return (
    <div className="border-l-4 border-neutral-600 pl-4 space-y-2">
      <Skel w="w-3/4" h="h-4" />
      <Skel w="w-full" h="h-4" />
      <Skel w="w-5/6" h="h-4" />
    </div>
  );
};

export const LibraryTabsSkeleton = () => (
  <div className="flex-none mb-6 flex gap-2">
    <Skel w="w-16" h="h-8" />
    <Skel w="w-24" h="h-8" />
    <Skel w="w-32" h="h-8" />
    <Skel w="w-20" h="h-8" />
  </div>
);

export const LibraryHeaderSkeleton = () => (
  <div className="flex items-center justify-between mb-6 flex-none">
    {/* Title + Icon */}
    <div className="flex items-center gap-2">
      <Skel w="w-40" h="h-10" /> {/* Text My Library */}
    </div>

    {/* Select */}
    <div className="flex gap-2">
      <Skel w="w-48" h="h-10" /> {/* Select dropdown */}
    </div>
  </div>
);

export const BookGridSkeleton = ({ count = 6 }: { count?: number }) => {
  return (
    <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 pr-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl bg-[#1C1C1C] flex flex-col p-0 animate-pulse"
        >
          {/* Cover */}
          <div className="w-full h-44 flex items-center justify-center bg-neutral-800 rounded-t-2xl">
      <Skel w="w-12" h="h-12" /> {/* icon placeholder */}
    </div>

          {/* Header */}
          <div className="flex flex-col gap-2 pt-2 pb-2 px-3">
            <div className="flex justify-between items-start gap-2">
              <Skel w="w-32" h="h-5" /> {/* Title */}
              <Skel w="w-16" h="h-4" /> {/* Status */}
            </div>
            <Skel w="w-24" h="h-3" /> {/* Author */}
            <Skel w="w-16" h="h-2" /> {/* Year */}
            <Skel w="w-full" h="h-10" /> {/* Description */}
            <div className="flex gap-1 mt-1">
              <Skel w="w-4" h="h-4" />
              <Skel w="w-4" h="h-4" />
              <Skel w="w-4" h="h-4" />
            </div>
            <div className="flex flex-wrap gap-2 mt-1">
              <Skel w="w-10" h="h-4" />
              <Skel w="w-12" h="h-4" />
            </div>
          </div>

          {/* Progress & Actions */}
          <div className="space-y-2 pt-0 px-3 pb-3">
            <div className="flex items-center gap-2">
              <Skel w="w-8" h="h-3" /> {/* Progress text */}
              <div className="flex-1 h-2 bg-white/20 rounded-full">
                <Skel w="w-3/4" h="h-2" />
              </div>
            </div>
            <div className="flex justify-between gap-2">
              <Skel w="w-1/2 h-8" /> {/* Update button */}
              <Skel w="w-20 h-8" /> {/* Delete button */}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};