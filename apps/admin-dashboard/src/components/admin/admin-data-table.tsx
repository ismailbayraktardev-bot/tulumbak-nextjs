'use client'
import { ColumnDef, flexRender } from '@tanstack/react-table'
import { useDataTable } from './data-table/use-data-table'
import { Button, Input } from 'tulumbak-ui'
import { ChevronDown } from 'lucide-react'
import { AdminDataTableProps as AdminDataTableType } from 'tulumbak-shared'

type AdminDataTableProps<T = Record<string, unknown>> = AdminDataTableType<T>

export function AdminDataTable<T = Record<string, unknown>>({ 
  data, 
  columns, 
  loading = false
}: AdminDataTableProps<T>) {
  // Convert AdminDataTableColumn to ColumnDef
  const columnDefs: ColumnDef<T>[] = columns.map(col => ({
    accessorKey: col.key as string,
    header: col.title,
    enableSorting: col.sortable,
    cell: col.render ? info => col.render!(info.getValue(), info.row.original) : undefined,
  }))
  
  const table = useDataTable(data, columnDefs)
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tulumbak-amber"></div>
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="flex items-center justify-between">
        <Input
          placeholder="Ara..."
          onChange={(e) => table.setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
        
        {/* Column Visibility Dropdown - Simplified for now */}
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            Kolonlar <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} className="px-4 py-3 text-left">
                    {header.isPlaceholder ? null : (
                      <div 
                        className={header.column.getCanSort() ? 'cursor-pointer select-none' : ''}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: ' 🔼',
                          desc: ' 🔽',
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} / {table.getFilteredRowModel().rows.length} satır seçili
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Önceki
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Sonraki
          </Button>
        </div>
      </div>
    </div>
  )
}