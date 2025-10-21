import { Card, CardContent, CardHeader, CardTitle, Button } from 'tulumbak-ui'
import { formatTL } from '@/lib/format'

export function CheckoutSummary() {
  // Mock sepet verileri
  const cartItems = [
    {
      id: '1',
      name: 'Tulumba Tatlısı',
      quantity: 2,
      price: 120,
      image: '/media/products/tulumba-tatlisi-1.jpg'
    },
    {
      id: '2',
      name: 'Soğuk Baklava (Fıstıklı)',
      quantity: 1,
      price: 390,
      image: '/media/products/soguk-baklava-fistikli-1.jpg'
    }
  ]

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const deliveryFee = 25
  const total = subtotal + deliveryFee

  return (
    <Card className="sticky top-4 sm:top-6 lg:top-8">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="text-lg sm:text-xl">Sipariş Özeti</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        {/* Mobile-first: Cart Items */}
        <div className="space-y-2 sm:space-y-3">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                  {item.name}
                </h4>
                <p className="text-xs text-gray-500">
                  Adet: {item.quantity}
                </p>
              </div>
              <div className="text-xs sm:text-sm font-medium text-gray-900 text-right">
                {formatTL(item.price * item.quantity)}
              </div>
            </div>
          ))}
        </div>

        {/* Mobile-first: Divider */}
        <div className="border-t border-gray-200"></div>

        {/* Mobile-first: Pricing */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-gray-600">Ara Toplam</span>
            <span className="text-gray-900">{formatTL(subtotal)}</span>
          </div>
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-gray-600">Teslimat Ücreti</span>
            <span className="text-gray-900">{formatTL(deliveryFee)}</span>
          </div>
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-gray-600">KDV</span>
            <span className="text-gray-900">Dahil</span>
          </div>
        </div>

        {/* Mobile-first: Divider */}
        <div className="border-t border-gray-200"></div>

        {/* Mobile-first: Total */}
        <div className="flex justify-between text-base sm:text-lg font-semibold">
          <span>Toplam</span>
          <span className="text-tulumbak-amber">{formatTL(total)}</span>
        </div>

        {/* Mobile-first: Promo Code */}
        <div className="space-y-2">
          <label className="block text-xs sm:text-sm font-medium text-gray-700">
            İndirim Kodu
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Kod girin"
              className="flex-1 px-2 sm:px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm h-9 sm:h-10"
            />
            <Button variant="outline" size="sm" className="h-9 sm:h-10 px-2 sm:px-3 text-xs sm:text-sm">
              Uygula
            </Button>
          </div>
        </div>

        {/* Mobile-first: Delivery Info */}
        <div className="bg-tulumbak-beige p-2 sm:p-3 rounded-lg">
          <h4 className="text-xs sm:text-sm font-medium text-tulumbak-slate mb-1">
            Teslimat Bilgileri
          </h4>
          <p className="text-xs text-gray-600">
            İstanbul içi 2-4 saat, diğer şehrilere 1-2 gün içinde teslimat.
          </p>
        </div>

        {/* Mobile-first: Security Info */}
        <div className="flex items-center space-x-1 sm:space-x-2 text-xs text-gray-500">
          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <span className="hidden sm:inline">Güvenli ödeme garantisi</span>
          <span className="sm:hidden">Güvenli ödeme</span>
        </div>
      </CardContent>
    </Card>
  )
}
