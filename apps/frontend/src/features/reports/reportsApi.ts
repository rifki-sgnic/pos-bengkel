import { api } from "@/lib/axios"
import type {
  ReportFilter,
  ReportSummary,
  TopProduct,
} from "@/types/report.types"

export const reportsApi = {
  async getSummary(filters: ReportFilter): Promise<ReportSummary> {
    const response = await api.get("/reports/summary", { params: filters })
    return response.data.data
  },

  async getTopProducts(
    filters: ReportFilter & { limit?: number }
  ): Promise<TopProduct[]> {
    const response = await api.get("/reports/top-products", { params: filters })
    return response.data.data
  },
}
