import { useMemo, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Eye } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { DataTable } from "@/components/shared/DataTable"
import { useTransactions } from "@/features/transactions/useTransactionsQuery"
import { useDataTableUrlState } from "@/hooks/use-data-table-url-state"
import { TransactionDetailDialog } from "@/components/transactions/TransactionDetailDialog"
import { formatRupiah } from "@/lib/formatters"
import type {
  Transaction,
  PaymentMethod,
  TransactionStatus,
} from "@/types/transaction.types"

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateStr))
}

export function TransactionsPage() {
  const { queryParams, getFilter, setFilter, tableProps } =
    useDataTableUrlState({
      defaultSortBy: "createdAt",
      defaultSortOrder: "desc",
      defaultPageSize: 10,
    })

  const status = getFilter("status")
  const paymentMethod = getFilter("paymentMethod")
  const startDate = getFilter("startDate")
  const endDate = getFilter("endDate")

  const { data: response, isLoading } = useTransactions({
    ...queryParams,
    status: status as TransactionStatus | undefined,
    paymentMethod: paymentMethod as PaymentMethod | undefined,
    startDate,
    endDate,
  })
  const transactions = response?.data ?? []
  const meta = response?.meta

  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleViewDetail = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setDialogOpen(true)
  }

  function sortableHeader(label: string, align: "left" | "right" = "left") {
    return ({ column }: any) => (
      <div className={align === "right" ? "flex w-full justify-end" : ""}>
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className={`h-8 ${align === "right" ? "-mr-3 justify-end text-right" : "-ml-3 justify-start text-left"} hover:bg-muted`}
        >
          {label}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    )
  }

  const columns: ColumnDef<Transaction>[] = useMemo(
    () => [
      {
        accessorKey: "invoiceNumber",
        header: sortableHeader("No. Invoice"),
        cell: ({ row }) => (
          <span className="font-medium">{row.original.invoiceNumber}</span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: sortableHeader("Tanggal"),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDate(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: "customerName",
        header: "Pelanggan",
        enableSorting: false,
        cell: ({ row }) => row.original.customerName ?? "-",
      },
      {
        id: "cashier",
        header: "Kasir",
        enableSorting: false,
        cell: ({ row }) => row.original.cashier.name,
      },
      {
        accessorKey: "paymentMethod",
        header: "Metode",
        enableSorting: false,
      },
      {
        accessorKey: "total",
        header: sortableHeader("Total", "right"),
        cell: ({ getValue }) => (
          <div className="text-right font-mono">
            {formatRupiah(Number(getValue()))}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        enableSorting: false,
        cell: ({ getValue }) => {
          const val = getValue() as string
          return (
            <Badge variant={val === "VOIDED" ? "destructive" : "default"}>
              {val === "VOIDED" ? "Void" : "Selesai"}
            </Badge>
          )
        },
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleViewDetail(row.original)}
          >
            <Eye className="h-4 w-4" />
          </Button>
        ),
      },
    ],
    []
  )

  const tableFilters = [
    {
      columnId: "status",
      label: "Status",
      options: [
        { label: "Selesai", value: "COMPLETED" },
        { label: "Void", value: "VOIDED" },
      ],
    },
    {
      columnId: "paymentMethod",
      label: "Metode",
      options: [
        { label: "Cash", value: "CASH" },
        { label: "Transfer", value: "TRANSFER" },
        { label: "QRIS", value: "QRIS" },
      ],
    },
  ]

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Riwayat Transaksi
        </h1>
        <p className="text-sm text-muted-foreground">
          Semua transaksi yang tercatat di sistem.
        </p>
      </div>

      <div className="flex items-end gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="startDate" className="text-xs">
            Dari Tanggal
          </Label>
          <Input
            id="startDate"
            type="date"
            value={startDate ?? ""}
            onChange={(e) =>
              setFilter("startDate", e.target.value || undefined)
            }
            className="w-40"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="endDate" className="text-xs">
            Sampai Tanggal
          </Label>
          <Input
            id="endDate"
            type="date"
            value={endDate ?? ""}
            onChange={(e) => setFilter("endDate", e.target.value || undefined)}
            className="w-40"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={transactions}
        isLoading={isLoading}
        emptyMessage="Tidak ada transaksi ditemukan."
        searchPlaceholder="Cari no. invoice atau nama pelanggan..."
        filters={tableFilters}
        filterValues={{ status, paymentMethod }}
        onFilterChange={setFilter}
        pageCount={meta?.totalPages ?? 0}
        totalItems={meta?.total ?? 0}
        {...tableProps}
      />

      <TransactionDetailDialog
        transaction={selectedTransaction}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  )
}
