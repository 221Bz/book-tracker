'use client'

import { Card, CardContent } from "@/components/ui/card"
import { BookOpen } from "lucide-react"
import { useLibraryData } from "@/components/LibraryData"
import { useLanguage } from "@/context/LanguageContext"

export default function BookStatsCard() {
  const { userBooks = [] } = useLibraryData()
  const { t } = useLanguage()

  const totalBooks = userBooks.length
  const totalPagesRead = userBooks.reduce((sum, b) => {
    const pages = b.pages ?? 0
    const readPages = Math.round((b.progress / 100) * pages)
    return sum + readPages
  }, 0)

  return (
    <Card className="bg-transparent rounded-xl">
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-white/80">
          <BookOpen className="w-4 h-4 text-white" />
          <span>{t("Reading Overview")}</span>
        </div>

        <div className="text-white">
          <p className="text-lg font-bold">{totalBooks} {t("books")}</p>
          <p className="text-sm text-white/80">{t("From library")}</p>
        </div>

        <div className="text-white">
          <p className="text-lg font-bold">{totalPagesRead.toLocaleString()} {t("Pages read")}</p>
          <p className="text-sm text-white/80">{t("Pages read")}</p>
        </div>
      </CardContent>
    </Card>
  )
}
