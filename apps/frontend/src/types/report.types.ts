export interface ReportFilter {
  startDate: string
  endDate: string
}

export interface ReportSummary {
  totalRevenue: number
  totalTransactions: number
  grossProfit: number
  period: { startDate: string; endDate: string }
}

export interface TopProduct {
  productId: string
  productName: string
  totalQuantity: number
  totalRevenue: number
}
