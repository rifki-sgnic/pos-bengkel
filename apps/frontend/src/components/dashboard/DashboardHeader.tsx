import { Calendar } from "lucide-react"
import { Input } from "@/components/ui/input"

interface DashboardHeaderProps {
  userName: string | undefined
  startDate: string
  endDate: string
  onStartDateChange: (value: string) => void
  onEndDateChange: (value: string) => void
}

export function DashboardHeader({
  userName,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="bg-linear-to-r from-foreground to-foreground/75 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
          Halo, {userName ?? "Owner"}!
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Berikut ringkasan performa bisnis dan operasional bengkel Anda saat ini.
        </p>
      </div>

      <div className="flex max-w-fit items-center gap-3 rounded-2xl border bg-card p-3 shadow-sm">
        <div className="flex items-center gap-1.5 px-1 text-xs font-semibold text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Filter Tanggal:</span>
        </div>
        <div className="flex items-center gap-2">
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="h-9 w-36 rounded-xl border-none bg-muted/50 text-center text-xs font-medium shadow-none focus-visible:ring-0"
          />
          <span className="text-xs font-medium text-muted-foreground">s/d</span>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="h-9 w-36 rounded-xl border-none bg-muted/50 text-center text-xs font-medium shadow-none focus-visible:ring-0"
          />
        </div>
      </div>
    </div>
  )
}
