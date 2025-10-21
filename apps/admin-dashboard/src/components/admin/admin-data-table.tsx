import { Card, CardContent, CardHeader, CardTitle } from 'tulumbak-ui'
import { AdminDataTable as AdminDataTableType } from 'tulumbak-shared'

interface AdminDataTableProps<T = any> extends AdminDataTableType<T> {}

export function AdminDataTable<T = any>({ 
  data, 
  columns, 
  loading = false, 
  pagination, 
  actions 
}: AdminDataTableProps<T>) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tulumbak-amber"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Veri Tablosu</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-gray-500">
          <p>AdminDataTable bileşeni henüz implement edilmedi.</p>
          <p className="text-sm mt-2">
            FE-02'de TanStack Table entegrasyonu yapılacak.
          </p>
          <div className="mt-4 text-xs text-gray-400">
            <p>Props: {data.length} satır, {columns.length} kolon</p>
            {pagination && <p>Sayfa: {pagination.page} / {pagination.total}</p>}
            {actions && <p>Aksiyonlar: {Object.keys(actions).join(', ')}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
