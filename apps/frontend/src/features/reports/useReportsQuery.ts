import { useQuery } from "@tanstack/react-query"
import { reportsApi } from "./reportsApi"
import type { ReportFilter } from "@/types/report.types"

export function useReportSummary(filters: ReportFilter) {
  return useQuery({
    queryKey: ["reports", "summary", filters],
    queryFn: () => reportsApi.getSummary(filters),
  })
}

export function useTopProducts(filters: ReportFilter & { limit?: number }) {
  return useQuery({
    queryKey: ["reports", "top-products", filters],
    queryFn: () => reportsApi.getTopProducts(filters),
  })
}
