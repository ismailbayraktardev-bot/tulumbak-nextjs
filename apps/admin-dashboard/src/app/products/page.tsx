import { AdminDataTable } from '@/components/admin/admin-data-table'
import { Button } from 'tulumbak-ui'

export default function ProductsPage() {
  // Mock product data
  const products = [
    { id: '1', name: 'Tulumba Tatlısı', category: 'Tulumbalar', price: '₺120', stock: '50', status: 'Aktif', created: '2024-10-21' },
    { id: '2', name: 'Soğuk Baklava', category: 'Baklavalar', price: '₺390', stock: '25', status: 'Aktif', created: '2024-10-20' },
    { id: '3', name: 'Künefe', category: 'Tulumbalar', price: '₺280', stock: '30', status: 'Aktif', created: '2024-10-19' },
    { id: '4', name: 'Kazandibi', category: 'Sütlaçlar', price: '₺180', stock: '0', status: 'Pasif', created: '2024-10-18' },
  ]

  const columns = [
    { key: 'id', title: 'ID', sortable: true },
    { key: 'name', title: 'Ürün Adı', sortable: true },
    { key: 'category', title: 'Kategori', sortable: true },
    { key: 'price', title: 'Fiyat', sortable: true },
    { key: 'stock', title: 'Stok', sortable: true },
    { key: 'status', title: 'Durum', sortable: true },
    { key: 'created', title: 'Oluşturulma', sortable: true }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-bold text-tulumbak-slate">
            Ürünler
          </h1>
          <p className="text-gray-600 mt-1">
            Ürün kataloğunuzu yönetin
          </p>
        </div>
        <Button className="bg-tulumbak-amber hover:bg-tulumbak-amber/90">
          + Yeni Ürün
        </Button>
      </div>

      <AdminDataTable
        data={products}
        columns={columns}
        loading={false}
        pagination={{
          page: 1,
          perPage: 10,
          total: products.length,
          onPageChange: (page) => console.log('Page changed:', page)
        }}
        actions={{
          onEdit: (row) => console.log('Edit product:', row),
          onDelete: (row) => console.log('Delete product:', row),
          onView: (row) => console.log('View product:', row)
        }}
      />
    </div>
  )
}
