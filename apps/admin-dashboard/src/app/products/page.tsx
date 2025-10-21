import { AdminDataTable } from '@/components/admin/admin-data-table'
import { AdminDataTableColumn } from 'tulumbak-shared'
import { apiGet } from '@/lib/api'
import { Product, ApiResponse } from 'tulumbak-shared'
import { Badge, Button } from 'tulumbak-ui'
import Image from 'next/image'

export default async function ProductsPage() {
  // Live API data
  let products: Product[] = []
  try {
    const response = await apiGet<ApiResponse<Product[]>>('/products', 30)
    products = response.data || []
  } catch (error) {
    console.error('Ürünler yüklenirken hata:', error)
  }

  const columns: AdminDataTableColumn[] = [
    { 
      key: 'name' as const, 
      title: 'Ürün Adı', 
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <Image 
            src={row.image?.url || '/placeholder.jpg'} 
            alt="" 
            width={40} 
            height={40} 
            className="rounded" 
          />
          <span>{value}</span>
        </div>
      )
    },
    { key: 'category' as const, title: 'Kategori', sortable: true },
    { 
      key: 'price_from' as const, 
      title: 'Fiyat', 
      sortable: true,
      render: (value) => `₺${value}`
    },
    { key: 'stock' as const, title: 'Stok', sortable: true },
    { 
      key: 'status' as const, 
      title: 'Durum', 
      sortable: true,
      render: (value) => (
        <Badge variant={value === 'active' ? 'default' : 'secondary'}>
          {value === 'active' ? 'Aktif' : 'Pasif'}
        </Badge>
      )
    },
    { 
      key: 'id' as const, 
      title: 'Aksiyonlar', 
      sortable: false,
      render: () => (
        <Button variant="ghost" size="sm">
          Düzenle
        </Button>
      )
    }
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