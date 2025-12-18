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

interface Props {
  data: UserBookForm
  onChange: <K extends keyof UserBookForm>(
    field: K,
    value: UserBookForm[K]
  ) => void
}

export default function LibraryFormFields({ data, onChange }: Props) {
  return (
    <div className="mt-4 max-h-80 overflow-y-auto pr-2 space-y-4">

      {/* STATUS */}
      <div className="grid gap-1">
        <Label>Status</Label>
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
            <SelectItem value="want">Want to Read</SelectItem>
            <SelectItem value="reading">Reading</SelectItem>
            <SelectItem value="finished">Finished</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* LATEST PAGE */}
{/* LATEST PAGE */}
<div className="grid gap-1">
  <Label>Halaman Terakhir Dibaca</Label>
  <Input
    type="number"
    min={0}
    value={data.last_pages}
    onChange={e =>
      onChange("last_pages", Number(e.target.value))
    }
    placeholder="contoh: 120"
  />
</div>


      {/* RATING */}
      <div className="grid gap-1">
        <Label>Rating (0–5)</Label>
        <Input
          type="number"
          min={0}
          max={5}
          step={0.5}
          value={data.rating}
          onChange={e =>
            onChange("rating", Number(e.target.value))
          }
        />
      </div>

    </div>
  )
}
