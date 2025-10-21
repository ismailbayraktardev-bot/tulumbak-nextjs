import { AdminDataTable } from '@/components/admin/admin-data-table'
import { AdminDataTableColumn } from 'tulumbak-shared'
import { apiGet } from '@/lib/api'
import { Category, ApiResponse } from 'tulumbak-shared'
import { Badge, Button } from 'tulumbak-ui'

export default async function CategoriesPage() {
  // Live API data
  let categories: Category[] = []
  try {
    const response = await apiGet<ApiResponse<Category[]>>('/categories', 30)
    categories = response.data || []
  } catch (error) {
    console.error('Kategoriler yüklenirken hata:', error)
  }

  const columns: AdminDataTableColumn[] = [
    { key: 'id' as const, title: 'ID', sortable: true },
    { key: 'name' as const, title: 'Kategori Adı', sortable: true },
    { key: 'slug' as const, title: 'Slug', sortable: true },
    { 
      key: 'products' as const, 
      title: 'Ürün Sayısı', 
      sortable: true,
      render: (value) => value || '0'
    },
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