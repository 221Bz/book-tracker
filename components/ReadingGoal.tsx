'use client'

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"

interface Goal {
  id: string
  target: number
  period_start: string
  period_end: string
}

export default function ReadingGoalPage() {
  const [goal, setGoal] = useState<Goal | null>(null)
  const [progress, setProgress] = useState(0)
  const [target, setTarget] = useState(10)
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    const loadGoal = async () => {

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return
      }

      const now = new Date()
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)

      const startISO = start.toISOString()
      const endISO = end.toISOString()

      // ambil goal bulan ini
      const { data: goalData } = await supabase
        .from('reading_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'monthly')
        .gte('period_start', startISO)
        .lte('period_end', endISO)
        .single()

      let activeGoal = goalData

      // kalau belum ada → create
      if (!goalData) {
        const { data: newGoal } = await supabase
          .from('reading_goals')
          .insert({
            user_id: user.id,
            type: 'monthly',
            target: 10,
            period_start: startISO,
            period_end: endISO,
          })
          .select()
          .single()

        activeGoal = newGoal
      }

      setGoal(activeGoal)
      setTarget(activeGoal.target)

      // hitung progress
      let { count } = await supabase
        .from('user_books')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'finished')
        .gte('finished_at', startISO)
        .lte('finished_at', endISO)

      // fallback kalau finished_at belum ada
      if (!count || count === 0) {
        const { count: fallbackCount } = await supabase
          .from('user_books')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'finished')

        count = fallbackCount ?? 0
      }

      setProgress(count)
    }

    loadGoal()
  }, [])

  const saveTarget = async () => {
    if (!goal) return

    const { error } = await supabase
      .from('reading_goals')
      .update({ target })
      .eq('id', goal.id)

    if (!error) {
      setGoal({ ...goal, target })
      setEditMode(false)
    }
  }

  const percent = goal
    ? Math.min(100, Math.round((progress / goal.target) * 100))
    : 0

  return (
    <Card className="bg-transparent max-w-md">
      <CardContent className="space-y-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-white/80">
          <Calendar className="w-4 h-4 text-white" />
          <span>Monthly Goal</span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-neutral-400 rounded">
          <div
            className="h-2 bg-indigo-500 rounded transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-sm text-neutral-300">
          <span>{progress} / {goal?.target} books</span>
          <span>{percent}%</span>
        </div>

        {/* VIEW MODE */}
        {!editMode && (
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => setEditMode(true)}
          >
            Edit Goal
          </Button>
        )}

        {/* EDIT MODE */}
        {editMode && (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-neutral-400">
                Target this month
              </label>
              <input
                type="number"
                min={1}
                value={target}
                onChange={e => setTarget(Number(e.target.value))}
                className="
                          mt-1 w-full px-3 py-2 rounded
                          bg-neutral-700 border border-neutral-600
                          focus:outline-none focus:ring-2 focus:ring-indigo-500
                        "
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={saveTarget} className="flex-1">
                Save
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  setTarget(goal!.target)
                  setEditMode(false)
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
