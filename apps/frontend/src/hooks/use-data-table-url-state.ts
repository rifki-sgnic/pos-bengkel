import { useCallback, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { useDebouncedValue } from "./use-debounced-value"

interface UseDataTableUrlStateOptions {
  /** Prefix buat query param, biar gak bentrok kalau ada >1 tabel di 1 halaman. Contoh: "trx" -> ?trx_page=2 */
  namespace?: string
  defaultSortBy: string
  defaultSortOrder?: "asc" | "desc"
  defaultPageSize?: number
  searchDebounceMs?: number
}
export function useDataTableUrlState({
  namespace,
  defaultSortBy,
  defaultSortOrder = "asc",
  defaultPageSize = 10,
  searchDebounceMs = 350,
}: UseDataTableUrlStateOptions) {
  const [searchParams, setSearchParams] = useSearchParams()
  const key = (name: string) => (namespace ? `${namespace}_${name}` : name)

  // Baca semua state dari URL
  const search = searchParams.get(key("search")) ?? ""
  const sortBy = searchParams.get(key("sortBy")) ?? defaultSortBy
  const sortOrder =
    (searchParams.get(key("sortOrder")) as "asc" | "desc") ?? defaultSortOrder
  const pageIndex = Math.max(
    0,
    Number(searchParams.get(key("page")) ?? "1") - 1
  )
  const pageSize = Number(
    searchParams.get(key("limit")) ?? String(defaultPageSize)
  )

  // Semua filter dropdown lain (type, categoryId, dll) disimpen generic di sini
  const getFilter = useCallback(
    (columnId: string) => searchParams.get(key(`f_${columnId}`)) ?? undefined,
    [searchParams, namespace]
  )

  // Local state buat search input, biar responsif (gak nunggu debounce buat nampilin ketikan)
  const [searchInput, setSearchInput] = useState(search)
  const debouncedSearch = useDebouncedValue(searchInput, searchDebounceMs)

  useEffect(() => {
    setSearchInput(search)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const patch = useCallback(
    (
      updates: Record<string, string | number | undefined>,
      resetPage = false
    ) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          Object.entries(updates).forEach(([k, v]) => {
            const paramKey = key(k)
            if (v === undefined || v === "") next.delete(paramKey)
            else next.set(paramKey, String(v))
          })
          if (resetPage) next.delete(key("page"))
          return next
        },
        { replace: true }
      )
    },
    [setSearchParams, namespace]
  )

  useEffect(() => {
    if (debouncedSearch !== search) {
      patch({ search: debouncedSearch }, true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  const setFilter = useCallback(
    (columnId: string, value: string | undefined) => {
      patch({ [`f_${columnId}`]: value }, true)
    },
    [patch]
  )

  const setSorting = useCallback(
    (next: { id: string; desc: boolean }[]) => {
      const first = next[0]
      if (!first) return
      patch({ sortBy: first.id, sortOrder: first.desc ? "desc" : "asc" })
    },
    [patch]
  )

  const setPagination = useCallback(
    (next: { pageIndex: number; pageSize: number }) => {
      patch({ page: next.pageIndex + 1, limit: next.pageSize })
    },
    [patch]
  )

  // Params siap pakai buat dikirim ke API/query hook
  const queryParams = useMemo(
    () => ({
      page: pageIndex + 1,
      limit: pageSize,
      search: search || undefined,
      sortBy,
      sortOrder,
    }),
    [pageIndex, pageSize, search, sortBy, sortOrder]
  )

  // Props yang tinggal di-spread langsung ke <DataTable />
  const tableProps = {
    manual: true as const,
    searchValue: searchInput,
    onSearchChange: setSearchInput,
    sorting: [{ id: sortBy, desc: sortOrder === "desc" }],
    onSortingChange: setSorting,
    pagination: { pageIndex, pageSize },
    onPaginationChange: setPagination,
  }

  return { queryParams, getFilter, setFilter, tableProps }
}
