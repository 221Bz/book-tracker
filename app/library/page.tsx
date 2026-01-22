'use client'

import Sidebar from "@/components/Sidebar"
import LibraryHeader from "@/components/LibraryHeader"
import LibraryTabs from "@/components/LibraryTabs"
import BookGrid from "@/components/BookGrid"
import EditDialog from "@/components/DialogEdit"
import DeleteDialog from "@/components/DialogDelete"
import LibraryFormFields from "@/components/LibraryFormFields"
import { useLibraryData } from "@/components/LibraryData"
import { BookGridSkeleton, LibraryHeaderSkeleton, LibraryTabsSkeleton } from "@/components/Skeletons"

export default function MyLibrary() {
  const {
    filteredBooks,
    status,
    setStatus,
    sort,
    setSort,
    expandedBookId,
    setExpandedBookId,
    formData,
    handleFormChange,
    handleUpdateClick,
    handleUpdate,
    handleDelete,
    editDialogOpen,
    setEditDialogOpen,
    deleteId,
    setDeleteId,
    toggleFavorite,
    loading,
    renderStars,
  } = useLibraryData();

  return (
    <div className="flex min-h-screen text-white">
      <Sidebar />

      <main className="w-full px-4 sm:px-6 md:px-10 pt-6 pb-24 md:pb-8 md:ml-64">
        {loading ? <LibraryHeaderSkeleton /> : <LibraryHeader sort={sort} setSort={setSort} />}
        {loading ? <LibraryTabsSkeleton /> : <LibraryTabs status={status} setStatus={setStatus} />}

        <div className="overflow-y-auto lg:max-h-[calc(85vh-4rem)]">
          {loading ? (
            <BookGridSkeleton count={6} />
          ) : filteredBooks.length === 0 ? (
            <div className="text-center text-white/60 mt-10">
              <p className="text-lg">No books found in your library.</p>
              <p className="text-sm mt-2">Try adding some books to start tracking your reading.</p>
            </div>
          ) : (
            <BookGrid
              books={filteredBooks}
              expandedBookId={expandedBookId}
              setExpandedBookId={setExpandedBookId}
              onUpdateClick={handleUpdateClick}
              onDeleteClick={(id: string) => setDeleteId(id)}
              onToggleFavorite={toggleFavorite}
              renderStars={renderStars}
              mode="library"
            />
          )}
        </div>

        <EditDialog open={editDialogOpen} setOpen={setEditDialogOpen} onSave={handleUpdate}>
          <LibraryFormFields data={formData} onChange={handleFormChange} />
        </EditDialog>

        <DeleteDialog
          open={!!deleteId}
          setOpen={(open: boolean) => { if (!open) setDeleteId(null); }}
          onConfirm={() => { if (deleteId) handleDelete(deleteId); setDeleteId(null); }}
        />
      </main>
    </div>
  );
}
