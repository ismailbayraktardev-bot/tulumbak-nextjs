import { KPIStatCard } from '@/components/admin/kpi-stat-card'
import { AdminDataTable } from '@/components/admin/admin-data-table'
import { Card, CardContent, CardHeader, CardTitle } from 'tulumbak-ui'

export default function AdminDashboard() {
  // Mock KPI data
  const kpiData = [
    {
      title: 'Toplam Sipariş',
      value: '1,234',
      delta: { value: 12.5, trend: 'up' as const },
      description: 'Bu ay'
    },
    {
      title: 'Toplam Gelir',
      value: '₺45,678',
      delta: { value: 8.2, trend: 'up' as const },
      description: 'Bu ay'
    },
    {
      title: 'Aktif Ürün',
      value: '156',
      delta: { value: 3.1, trend: 'up' as const },
      description: 'Toplam'
    },
    {
      title: 'Yeni Müşteri',
      value: '89',
      delta: { value: 15.3, trend: 'up' as const },
      description: 'Bu hafta'
    }
  ]

  // Mock table data
  const recentOrders = [
    { id: '1', customer: 'Ahmet Yılmaz', product: 'Tulumba Tatlısı', amount: '₺120', status: 'Teslim Edildi', date: '2024-10-21' },
    { id: '2', customer: 'Fatma Demir', product: 'Soğuk Baklava', amount: '₺390', status: 'Hazırlanıyor', date: '2024-10-21' },
    { id: '3', customer: 'Mehmet Kaya', product: 'Künefe', amount: '₺280', status: 'Yolda', date: '2024-10-20' },
    { id: '4', customer: 'Ayşe Özkan', product: 'Kazandibi', amount: '₺180', status: 'Teslim Edildi', date: '2024-10-20' },
    { id: '5', customer: 'Ali Çelik', product: 'Sütlaç', amount: '₺150', status: 'İptal', date: '2024-10-19' }
  ]

  const orderColumns = [
    { key: 'id', title: 'ID', sortable: true },
    { key: 'customer', title: 'Müşteri', sortable: true },
    { key: 'product', title: 'Ürün', sortable: false },
    { key: 'amount', title: 'Tutar', sortable: true },
    { key: 'status', title: 'Durum', sortable: true },
    { key: 'date', title: 'Tarih', sortable: true }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif font-bold text-tulumbak-slate">
          Dashboard
        </h1>
        <p className="text-gray-600 mt-1">
          Tulumbak yönetim paneline hoş geldiniz
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => (
          <KPIStatCard key={index} {...kpi} />
        ))}
      </div>

      {/* Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Son Siparişler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{order.customer}</p>
                    <p className="text-xs text-gray-500">{order.product}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{order.amount}</p>
                    <p className={`text-xs ${
                      order.status === 'Teslim Edildi' ? 'text-green-600' :
                      order.status === 'Hazırlanıyor' ? 'text-yellow-600' :
                      order.status === 'Yolda' ? 'text-blue-600' :
                      'text-red-600'
                    }`}>
                      {order.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hızlı Aksiyonlar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-tulumbak-amber hover:bg-tulumbak-amber/5 transition-colors">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🍰</span>
                  <div>
                    <p className="font-medium text-gray-900">Yeni Ürün Ekle</p>
                    <p className="text-sm text-gray-500">Ürün kataloğuna yeni ürün ekleyin</p>
                  </div>
                </div>
              </button>
              
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-tulumbak-amber hover:bg-tulumbak-amber/5 transition-colors">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📁</span>
                  <div>
                    <p className="font-medium text-gray-900">Kategori Yönetimi</p>
                    <p className="text-sm text-gray-500">Kategorileri düzenleyin</p>
                  </div>
                </div>
              </button>
              
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-tulumbak-amber hover:bg-tulumbak-amber/5 transition-colors">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📊</span>
                  <div>
                    <p className="font-medium text-gray-900">Raporları Görüntüle</p>
                    <p className="text-sm text-gray-500">Detaylı analiz raporları</p>
                  </div>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table Demo */}
      <div>
        <AdminDataTable
          data={recentOrders}
          columns={orderColumns}
          loading={false}
          pagination={{
            page: 1,
            perPage: 10,
            total: 50,
            onPageChange: (page) => console.log('Page changed:', page)
          }}
          actions={{
            onEdit: (row) => console.log('Edit:', row),
            onDelete: (row) => console.log('Delete:', row),
            onView: (row) => console.log('View:', row)
          }}
        />
      </div>
    </div>
  )
}
