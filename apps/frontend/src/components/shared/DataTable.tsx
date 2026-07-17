import {
  type ColumnDef,
  type PaginationState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  X,
} from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useCallback, useState } from "react"

interface FilterOption {
  label: string
  value: string
}

interface FilterConfig {
  columnId: string
  label: string
  options: FilterOption[]
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  isLoading?: boolean
  emptyMessage?: string
  searchPlaceholder?: string
  filters?: FilterConfig[]
  pageSizeOptions?: number[]

  /**
   * Kalau true: semua state (search, filter, sort, pagination) dikontrol
   * dari parent dan setiap perubahan memicu request baru ke backend.
   * Kalau false/undefined: semua diproses di client dari `data` yang ada (behavior lama).
   */
  manual?: boolean

  // ---- Hanya dipakai kalau manual = true ----
  searchValue?: string
  onSearchChange?: (value: string) => void

  filterValues?: Record<string, string | undefined>
  onFilterChange?: (columnId: string, value: string | undefined) => void

  sorting?: SortingState
  onSortingChange?: (sorting: SortingState) => void

  pagination?: PaginationState
  onPaginationChange?: (pagination: PaginationState) => void

  pageCount?: number
  totalItems?: number

  // ---- Hanya dipakai kalau manual = false (client-side) ----
  searchColumnId?: string
  globalSearchFields?: string[]
  defaultPageSize?: number
}

type ColumnFilterEntry = { id: string; value: unknown }

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  emptyMessage = "Tidak ada data.",
  searchPlaceholder = "Cari...",
  filters = [],
  pageSizeOptions = [5, 10, 25, 50],
  manual = false,

  searchValue,
  onSearchChange,
  filterValues = {},
  onFilterChange,
  sorting: sortingProp,
  onSortingChange: onSortingChangeProp,
  pagination: paginationProp,
  onPaginationChange: onPaginationChangeProp,
  pageCount,
  totalItems,

  searchColumnId,
  globalSearchFields = [],
  defaultPageSize = 10,
}: DataTableProps<TData, TValue>) {
  // ---- State internal, cuma dipakai kalau manual = false ----
  const [internalSorting, setInternalSorting] = useState<SortingState>([])
  const [internalColumnFilters, setInternalColumnFilters] = useState<
    ColumnFilterEntry[]
  >([])
  const [internalGlobalFilter, setInternalGlobalFilter] = useState("")
  const [internalPagination, setInternalPagination] = useState<PaginationState>(
    {
      pageIndex: 0,
      pageSize: defaultPageSize,
    }
  )

  const getNestedValue = (obj: any, path: string): any => {
    if (!path) return undefined
    return path.split(".").reduce((acc, part) => acc && acc[part], obj)
  }

  const customGlobalFilterFn = useCallback(
    (row: any, columnId: string, filterValue: string) => {
      const query = filterValue.toLowerCase().trim()
      if (!query) return true

      if (globalSearchFields.length > 0) {
        return globalSearchFields.some((field) => {
          const val = getNestedValue(row.original, field)
          return (
            val !== undefined &&
            val !== null &&
            String(val).toLowerCase().includes(query)
          )
        })
      }

      return String(row.getValue(columnId)).toLowerCase().includes(query)
    },
    [globalSearchFields]
  )

  const sorting = manual ? (sortingProp ?? []) : internalSorting
  const pagination = manual
    ? (paginationProp ?? { pageIndex: 0, pageSize: defaultPageSize })
    : internalPagination

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination,
      ...(manual
        ? {}
        : {
            columnFilters: internalColumnFilters,
            globalFilter: internalGlobalFilter,
          }),
    },
    onSortingChange: (updater) => {
      const next = typeof updater === "function" ? updater(sorting) : updater
      if (manual) onSortingChangeProp?.(next)
      else setInternalSorting(next)
    },
    onPaginationChange: (updater) => {
      const next = typeof updater === "function" ? updater(pagination) : updater
      if (manual) onPaginationChangeProp?.(next)
      else setInternalPagination(next)
    },
    onColumnFiltersChange: manual ? undefined : setInternalColumnFilters,
    onGlobalFilterChange: manual ? undefined : setInternalGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    globalFilterFn: customGlobalFilterFn,
    ...(manual
      ? {
          manualPagination: true,
          manualSorting: true,
          manualFiltering: true,
          pageCount: pageCount ?? -1,
        }
      : {
          getPaginationRowModel: getPaginationRowModel(),
          getSortedRowModel: getSortedRowModel(),
          getFilteredRowModel: getFilteredRowModel(),
        }),
  })

  // ---- Search value & handler, beda sumber tergantung mode ----
  const currentSearchValue = manual
    ? (searchValue ?? "")
    : searchColumnId
      ? ((table.getColumn(searchColumnId)?.getFilterValue() as string) ?? "")
      : internalGlobalFilter

  const handleSearchChange = (value: string) => {
    if (manual) {
      onSearchChange?.(value)
      return
    }
    if (searchColumnId) {
      table.getColumn(searchColumnId)?.setFilterValue(value)
    } else {
      setInternalGlobalFilter(value)
    }
  }

  // ---- Filter dropdown value & handler, beda sumber tergantung mode ----
  const getFilterValue = (columnId: string): string => {
    if (manual) return filterValues[columnId] ?? "ALL"
    return (table.getColumn(columnId)?.getFilterValue() as string) ?? "ALL"
  }

  const handleFilterChange = (columnId: string, value: string) => {
    const resolved = value === "ALL" ? undefined : value
    if (manual) {
      onFilterChange?.(columnId, resolved)
      return
    }
    table.getColumn(columnId)?.setFilterValue(resolved)
  }

  const hasActiveFilters = React.useMemo(() => {
    if (manual) {
      return (
        Boolean(currentSearchValue) || Object.values(filterValues).some(Boolean)
      )
    }
    return internalColumnFilters.length > 0 || Boolean(internalGlobalFilter)
  }, [
    manual,
    currentSearchValue,
    filterValues,
    internalColumnFilters,
    internalGlobalFilter,
  ])

  const clearAllFilters = () => {
    if (manual) {
      onSearchChange?.("")
      filters.forEach((f) => onFilterChange?.(f.columnId, undefined))
      return
    }
    table.resetColumnFilters()
    setInternalGlobalFilter("")
  }

  const displayTotal = manual
    ? (totalItems ?? 0)
    : table.getFilteredRowModel().rows.length
  const pageIndex = pagination.pageIndex
  const pageSize = pagination.pageSize
  const startIndex = displayTotal > 0 ? pageIndex * pageSize + 1 : 0
  const endIndex = Math.min(startIndex + pageSize - 1, displayTotal)

  return (
    <div className="space-y-4">
      {/* Top Bar: Search & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative w-full max-w-sm">
            <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={currentSearchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pr-8 pl-9"
            />
            {currentSearchValue && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute top-2.5 right-2.5 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-muted"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {filters.map((filter) => (
            <div key={filter.columnId} className="min-w-36">
              <Select
                value={getFilterValue(filter.columnId)}
                onValueChange={(val) =>
                  handleFilterChange(filter.columnId, val)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={`Semua ${filter.label}`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua {filter.label}</SelectItem>
                  {filter.options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Reset Filter
              <X className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 self-end text-sm text-muted-foreground sm:self-auto">
          <span>Baris per halaman:</span>
          <Select
            value={String(pageSize)}
            onValueChange={(val) => {
              const next = { pageIndex: 0, pageSize: Number(val) }
              if (manual) onPaginationChangeProp?.(next)
              else setInternalPagination(next)
            }}
          >
            <SelectTrigger size="sm" className="w-16">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="px-3">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-28 text-center text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="h-5 w-5 animate-spin rounded-full border-b-2 border-primary" />
                    <span>Memuat data...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="transition-colors hover:bg-muted/20"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-3 py-2.5">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {displayTotal > 0 && (
        <div className="flex flex-col gap-3 px-1 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div>
            Menampilkan{" "}
            <span className="font-medium text-foreground">{startIndex}</span> -{" "}
            <span className="font-medium text-foreground">{endIndex}</span> dari{" "}
            <span className="font-medium text-foreground">{displayTotal}</span>{" "}
            data
          </div>

          <div className="flex items-center gap-1.5 self-center sm:self-auto">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Halaman pertama</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Halaman sebelumnya</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <span className="mx-2 text-xs">
              Halaman{" "}
              <span className="font-medium text-foreground">
                {pageIndex + 1}
              </span>{" "}
              dari{" "}
              <span className="font-medium text-foreground">
                {table.getPageCount() || 1}
              </span>
            </span>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Halaman berikutnya</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Halaman terakhir</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
