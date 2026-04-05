'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'id';

type Dictionary = Record<string, string>;

const dictionaries: Record<Language, Dictionary> = {
    en: {
        "Beranda": "Home",
        "Jelajah": "Explore",
        "Perpustakaan": "Library",
        "Profil": "Profile",
        "Keluar": "Logout",
        "Mencari data buku...": "Fetching book data...",
        "Gagal mengambil data buku": "Failed to fetch book data",
        "Buku tidak ditemukan": "No books found",
        "Cari buku...": "Search books...",
        "Sedang Dibaca": "Reading",
        "Ingin Dibaca": "Want to Read",
        "Selesai": "Finished",
        "Mulai:": "Started:",
        "Selesai:": "Finished:",
        "Lihat semua": "View all",
        "Lihat lebih sedikit": "View less",
        "Tambahkan ke Perpustakaan": "Add to Library",
        "Buku Favorit": "Favorite Books",
        "Kamu belum memiliki buku favorit di Perpustakaan.": "You don't have any favorite books in your Library yet.",
        "Pustaka Kosong": "Your library is empty.",
        "Batal": "Cancel",
        "Simpan": "Save",
        "Ubah": "Edit",
        "Pilihan Favorit": "Select Favorites",
        "Tutup": "Close",
        "Buku Populer": "popular books",
        "Semua": "All",
        "Filter Status": "Filter by Status",
        "Urutkan": "Sort by",
        "Terakhir Dibaca": "Last Read",
        "Judul": "Title",
        "Penilaian": "Rating",
        "Bacaan": "Reading Overview",
        "Halaman dibaca": "Pages read",
        "Target Bulanan": "Monthly Goal",
        "Ubah Target": "Edit Goal",
        "Tahun Terbit": "Published Year",
        "Kategori": "Genres",
        "Hapus": "Delete",
        "Detail Buku": "Book Details",
        "Perbarui": "Update",
        "Tidak Ada Sampul": "No Cover",
        "Sandi Baru": "New password",
        "Nama": "Name",
        "Ubah Profil": "Edit Profile",
        "buku": "books"
    },
    id: {
        "Home": "Beranda",
        "Explore": "Jelajah",
        "Library": "Perpustakaan",
        "Profile": "Profil",
        "Logout": "Keluar",
        "Fetching book data...": "Mencari data buku...",
        "Failed to fetch book data": "Gagal mengambil data buku",
        "No books found": "Buku tidak ditemukan",
        "Search books...": "Cari buku...",
        "Reading": "Sedang Dibaca",
        "Want to Read": "Ingin Dibaca",
        "Finished": "Selesai",
        "Started:": "Mulai:",
        "Finished:": "Selesai:",
        "View all": "Lihat semua",
        "View less": "Lihat lebih sedikit",
        "Add to Library": "Tambahkan ke Perpustakaan",
        "Favorite Books": "Buku Favorit",
        "You don't have any favorite books in your Library yet.": "Kamu belum memiliki buku favorit di Library.",
        "Your library is empty.": "Pustaka Kosong",
        "Cancel": "Batal",
        "Save": "Simpan",
        "Edit": "Ubah",
        "Select Favorites": "Pilihan Favorit",
        "Close": "Tutup",
        "popular books": "buku populer",
        "All": "Semua",
        "Filter by Status": "Filter Status",
        "Sort by": "Urutkan",
        "Last Read": "Terakhir Dibaca",
        "Title": "Judul",
        "Rating": "Penilaian",
        "Reading Overview": "Ringkasan Bacaan",
        "Pages read": "Halaman dibaca",
        "Monthly Goal": "Target Bulanan",
        "Edit Goal": "Ubah Target",
        "Published Year": "Tahun Terbit",
        "Delete": "Hapus",
        "Book Details": "Detail Buku",
        "Update": "Perbarui",
        "No Cover": "Tidak Ada Sampul",
        "New password": "Sandi Baru",
        "Name": "Nama",
        "Edit Profile": "Ubah Profil",
        "books": "buku",
        "No books found in your library.": "Tidak ada buku di perpustakaan Anda.",
        "Try adding some books to start tracking your reading.": "Coba tambahkan beberapa buku untuk mulai melacak bacaan Anda.",
        "From library": "Dari perpustakaan",
        "Target this month": "Target bulan ini",
        "Delete Confirmation": "Konfirmasi Hapus",
        "Are you sure you want to delete this data?": "Apakah Anda yakin ingin menghapus data ini?",
        "Edit Data": "Ubah Data",
        "Tambah Data": "Tambah Data",
        "Status": "Status",
        "Last page read": "Halaman Terakhir Dibaca",
        "example: 120": "contoh: 120",
        "Date Started": "Mulai Baca",
        "Date Finished": "Selesai Baca",
        "You haven’t favorited any books yet": "Anda belum memfavoritkan satupun buku"
    }
};

interface LanguageContextProps {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (text: string) => string;
}

const LanguageContext = createContext<LanguageContextProps>({
    language: 'en',
    setLanguage: () => { },
    t: (text) => text,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>('en');

    useEffect(() => {
        const saved = localStorage.getItem('app_lang') as Language;
        if (saved) setLanguage(saved);
    }, []);

    const changeLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem('app_lang', lang);
    };

    const t = (text: string) => {
        return dictionaries[language][text] || text; // fall back to text itself if not found
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLanguage = () => useContext(LanguageContext);
