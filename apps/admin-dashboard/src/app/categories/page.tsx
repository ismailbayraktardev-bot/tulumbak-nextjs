import { AdminDataTable } from '@/components/admin/admin-data-table'
import { Button } from 'tulumbak-ui'

export default function CategoriesPage() {
  // Mock category data
  const categories = [
    { id: '1', name: 'Tulumbalar', slug: 'tulumbalar', products: '12', status: 'Aktif', created: '2024-10-21' },
    { id: '2', name: 'Baklavalar', slug: 'baklavalar', products: '8', status: 'Aktif', created: '2024-10-20' },
    { id: '3', name: 'Sütlaçlar', slug: 'sutlaclar', products: '5', status: 'Aktif', created: '2024-10-19' },
    { id: '4', name: 'Künefeler', slug: 'kunefeler', products: '3', status: 'Pasif', created: '2024-10-18' },
  ]

  const columns = [
    { key: 'id', title: 'ID', sortable: true },
    { key: 'name', title: 'Kategori Adı', sortable: true },
    { key: 'slug', title: 'Slug', sortable: true },
    { key: 'products', title: 'Ürün Sayısı', sortable: true },
    { key: 'status', title: 'Durum', sortable: true },
    { key: 'created', title: 'Oluşturulma', sortable: true }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-bold text-tulumbak-slate">
            Kategoriler
          </h1>
          <p className="text-gray-600 mt-1">
            Ürün kategorilerinizi yönetin
          </p>
        </div>
        <Button className="bg-tulumbak-amber hover:bg-tulumbak-amber/90">
          + Yeni Kategori
        </Button>
      </div>

      <AdminDataTable
        data={categories}
        columns={columns}
        loading={false}
        pagination={{
          page: 1,
          perPage: 10,
          total: categories.length,
          onPageChange: (page) => console.log('Page changed:', page)
        }}
        actions={{
          onEdit: (row) => console.log('Edit category:', row),
          onDelete: (row) => console.log('Delete category:', row),
          onView: (row) => console.log('View category:', row)
        }}
      />
    </div>
  )
}
