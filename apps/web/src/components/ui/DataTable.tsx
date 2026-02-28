import { useState, useMemo } from 'react'
import { ChevronDown, ChevronUp, Search } from 'lucide-react'

export type SortDirection = 'asc' | 'desc' | null

export interface Column<T> {
  key: string
  title: string
  titleAr?: string
  sortable?: boolean
  render?: (value: any, row: T, index: number) => React.ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  searchable?: boolean
  searchPlaceholder?: string
  searchPlaceholderAr?: string
  emptyMessage?: string
  emptyMessageAr?: string
  pageSize?: number
  onRowClick?: (row: T, index: number) => void
  rowClassName?: (row: T, index: number) => string | undefined
  idKey?: string
}

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
        </td>
      ))}
    </tr>
  )
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  searchable = true,
  searchPlaceholder = 'Search...',
  searchPlaceholderAr = 'بحث...',
  emptyMessage = 'No data found',
  emptyMessageAr = 'لا توجد بيانات',
  pageSize = 20,
  onRowClick,
  rowClassName,
  idKey = 'id',
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)
  const [currentPage, setCurrentPage] = useState(1)

  // Filter and sort data
  const processedData = useMemo(() => {
    let result = [...data]

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter((row) =>
        columns.some((col) => {
          const value = row[col.key]
          return (
            value !== undefined &&
            value !== null &&
            String(value).toLowerCase().includes(query)
          )
        })
      )
    }

    // Sort
    if (sortColumn && sortDirection) {
      result.sort((a, b) => {
        const aVal = a[sortColumn]
        const bVal = b[sortColumn]

        if (aVal === bVal) return 0
        if (aVal === undefined || aVal === null) return 1
        if (bVal === undefined || bVal === null) return -1

        const comparison = String(aVal).localeCompare(String(bVal))
        return sortDirection === 'asc' ? comparison : -comparison
      })
    }

    return result
  }, [data, searchQuery, sortColumn, sortDirection, columns])

  // Pagination
  const totalPages = Math.ceil(processedData.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const paginatedData = processedData.slice(startIndex, startIndex + pageSize)

  const handleSort = (columnKey: string) => {
    const column = columns.find((col) => col.key === columnKey)
    if (!column?.sortable) return

    if (sortColumn === columnKey) {
      if (sortDirection === 'asc') {
        setSortDirection('desc')
      } else if (sortDirection === 'desc') {
        setSortColumn(null)
        setSortDirection(null)
      }
    } else {
      setSortColumn(columnKey)
      setSortDirection('asc')
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="w-full" dir="rtl">
      {/* Search */}
      {searchable && (
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={searchPlaceholderAr}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full bg-white">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  onClick={() => handleSort(column.key)}
                  className={`px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100 transition-colors select-none' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.titleAr || column.title}</span>
                    {column.sortable && (
                      <span className="flex flex-col">
                        <ChevronUp
                          className={`w-3 h-3 ${
                            sortColumn === column.key && sortDirection === 'asc'
                              ? 'text-[#2563eb]'
                              : 'text-gray-400'
                          }`}
                        />
                        <ChevronDown
                          className={`w-3 h-3 -mt-1.5 ${
                            sortColumn === column.key && sortDirection === 'desc'
                              ? 'text-[#2563eb]'
                              : 'text-gray-400'
                          }`}
                        />
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              Array.from({ length: pageSize }).map((_, i) => (
                <SkeletonRow key={i} cols={columns.length} />
              ))
            ) : paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-gray-500 font-cairo"
                >
                  <div className="flex flex-col items-center gap-3">
                    <span className="text-4xl">📭</span>
                    <p className="text-lg">{emptyMessageAr}</p>
                    <p className="text-sm text-gray-400">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => {
                const globalIndex = startIndex + index
                const rowClasses = rowClassName?.(row, globalIndex)
                return (
                  <tr
                    key={row[idKey] ?? globalIndex}
                    onClick={() => onRowClick?.(row, globalIndex)}
                    className={`hover:bg-gray-50 transition-colors ${
                      onRowClick ? 'cursor-pointer' : ''
                    } ${rowClasses || ''}`}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`px-4 py-3 text-sm text-gray-700 font-cairo ${
                          column.className || ''
                        }`}
                      >
                        {column.render
                          ? column.render(row[column.key], row, globalIndex)
                          : row[column.key]}
                      </td>
                    ))}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && processedData.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-2">
          <div className="text-sm text-gray-600 font-cairo">
            عرض {startIndex + 1} - {Math.min(startIndex + pageSize, processedData.length)} من{' '}
            {processedData.length}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-cairo disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              السابق
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              const showPage =
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)

              if (!showPage) {
                if (
                  (page === currentPage - 2 && page > 1) ||
                  (page === currentPage + 2 && page < totalPages)
                ) {
                  return (
                    <span key={page} className="px-2 text-gray-400">
                      ...
                    </span>
                  )
                }
                return null
              }

              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-cairo transition-colors ${
                    currentPage === page
                      ? 'bg-[#2563eb] text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              )
            })}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-cairo disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              التالي
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
