'use client'

import { useCurrentUser } from '@/store/auth-store'
import { User, Mail, Phone, Calendar, MapPin, ShoppingBag } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from 'tulumbak-ui'

export function UserDashboard() {
  const user = useCurrentUser()

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Lütfen giriş yapın.</p>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* User Information Card */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Kişisel Bilgiler
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <span className="text-lg font-medium">
                  {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {user.first_name} {user.last_name}
                </h3>
                <p className="text-sm text-gray-500 capitalize">
                  {user.role === 'customer' ? 'Müşteri' : user.role}
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{user.email}</span>
              </div>

              {user.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{user.phone}</span>
                </div>
              )}

              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">
                  Katılım: {formatDate(user.created_at)}
                </span>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-gray-600">
                  {user.is_active ? 'Aktif' : 'Pasif'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Actions */}
      <div className="lg:col-span-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Siparişlerim</h3>
                  <p className="text-sm text-gray-500">Geçmiş ve aktif siparişlerinizi görüntüleyin</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-600">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Adreslerim</h3>
                  <p className="text-sm text-gray-500">Teslimat adreslerinizi yönetin</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Hesap Ayarları</h3>
                  <p className="text-sm text-gray-500">Kişisel bilgilerinizi güncelleyin</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Bildirimler</h3>
                  <p className="text-sm text-gray-500">E-posta ve SMS bildirimlerini yönetin</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Hesap Özeti</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">0</div>
                <div className="text-sm text-gray-500">Toplam Sipariş</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">₺0</div>
                <div className="text-sm text-gray-500">Toplam Harcama</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24))}
                </div>
                <div className="text-sm text-gray-500">Gündür Hesaplı</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}