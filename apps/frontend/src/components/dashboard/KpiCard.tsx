import { ArrowUpRight, type LucideIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface KpiCardProps {
  title: string
  value: string | number
  subtext: string
  icon: LucideIcon
  isLoading: boolean
  accentColor: "emerald" | "blue" | "indigo"
}

export function KpiCard({
  title,
  value,
  subtext,
  icon: Icon,
  isLoading,
  accentColor,
}: KpiCardProps) {
  const colorMap = {
    emerald: {
      border: "hover:border-emerald-500/20",
      bgIcon: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-500/20",
      pillBg: "bg-emerald-500/10 text-emerald-500",
      accentBar: "bg-emerald-500",
    },
    blue: {
      border: "hover:border-blue-500/20",
      bgIcon: "bg-blue-500/10 text-blue-600 dark:text-blue-400 dark:bg-blue-500/20",
      pillBg: "bg-blue-500/10 text-blue-500 dark:text-blue-400",
      accentBar: "bg-blue-500",
    },
    indigo: {
      border: "hover:border-indigo-500/20",
      bgIcon: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 dark:bg-indigo-500/20",
      pillBg: "bg-indigo-500/10 text-indigo-500 dark:text-indigo-400",
      accentBar: "bg-indigo-500",
    },
  }

  const activeColor = colorMap[accentColor]

  return (
    <Card className={`group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${activeColor.border}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          {title}
        </CardTitle>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${activeColor.bgIcon}`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <p className="text-3xl font-extrabold tracking-tight">
          {isLoading ? (
            <span className="inline-block h-8 w-32 animate-pulse rounded-md bg-muted" />
          ) : (
            value
          )}
        </p>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className={`flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-medium ${activeColor.pillBg}`}>
            {accentColor === "emerald" && <ArrowUpRight className="h-3 w-3" />}
            {accentColor === "emerald" ? "Aktif" : accentColor === "blue" ? "Invoice" : "Profit"}
          </span>
          <span>{subtext}</span>
        </div>
      </CardContent>
      <div className={`absolute inset-x-0 bottom-0 h-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${activeColor.accentBar}`} />
    </Card>
  )
}
