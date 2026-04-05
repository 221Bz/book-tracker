'use client'

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { UserBookForm } from "./LibraryData"
import { Star } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"

interface Props {
  data: UserBookForm
  onChange: <K extends keyof UserBookForm>(field: K, value: UserBookForm[K]) => void
}

export default function LibraryFormFields({ data, onChange }: Props) {
  const { t } = useLanguage();
  const renderStars = () => {
    return Array.from({ length: 5 }).map((_, i) => {
      const index = i + 1
      return (
        <button
          key={i}
          type="button"
          onClick={() => onChange("rating", index)}
          className="p-0 m-0"
        >
          <Star
            className={`w-6 h-6 transition ${index <= (data.rating ?? 0)
              ? "fill-yellow-400 text-yellow-400"
              : "text-neutral-500"
              }`}
          />
        </button>
      )
    })
  }

  return (
    <div className="mt-4 max-h-80 overflow-y-auto pr-2 space-y-4">

      {/* STATUS */}
      <div className="grid gap-1">
        <Label>{t("Status")}</Label>
        <Select
          value={data.status}
          onValueChange={v =>
            onChange("status", v as UserBookForm["status"])
          }
        >
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="want">{t("Want to Read")}</SelectItem>
            <SelectItem value="reading">{t("Reading")}</SelectItem>
            <SelectItem value="finished">{t("Finished")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* LATEST PAGE */}
      <div className="grid gap-1">
        <Label>{t("Last page read")}</Label>
        <Input
          type="number"
          min={0}
          value={data.last_pages}
          onChange={e => onChange("last_pages", Number(e.target.value))}
          placeholder={t("example: 120")}
        />
      </div>

      {/* DATES */}
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-1">
          <Label>{t("Date Started")}</Label>
          <Input
            type="date"
            value={data.started_at ?? ""}
            onChange={e => onChange("started_at", e.target.value || null)}
          />
        </div>
        <div className="grid gap-1">
          <Label>{t("Date Finished")}</Label>
          <Input
            type="date"
            value={data.finished_at ?? ""}
            onChange={e => onChange("finished_at", e.target.value || null)}
          />
        </div>
      </div>

      {/* RATING */}
      <div className="grid gap-1">
        <Label>{t("Rating")}</Label>
        <div className="flex gap-1">
          {renderStars()}
        </div>
      </div>

    </div>
  )
}
