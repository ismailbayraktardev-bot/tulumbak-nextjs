'use client'

import { useState } from 'react'
import { Button, Input, Card, CardContent, CardHeader, CardTitle } from 'tulumbak-ui'

export function CheckoutForm() {
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    {
      title: 'İletişim Bilgileri',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ad *
              </label>
              <Input placeholder="Adınız" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Soyad *
              </label>
              <Input placeholder="Soyadınız" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-posta *
            </label>
            <Input type="email" placeholder="ornek@email.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefon *
            </label>
            <Input placeholder="+90 (5XX) XXX XX XX" />
          </div>
        </div>
      )
    },
    {
      title: 'Teslimat Adresi',
      content: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adres Başlığı *
            </label>
            <Input placeholder="Ev, İş, vb." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adres *
            </label>
            <textarea 
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              rows={3}
              placeholder="Mahalle, sokak, bina no, daire no..."
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                İl *
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                <option>İstanbul</option>
                <option>Ankara</option>
                <option>İzmir</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                İlçe *
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                <option>Kadıköy</option>
                <option>Beşiktaş</option>
                <option>Şişli</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Posta Kodu
              </label>
              <Input placeholder="34000" />
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Teslimat Zamanı',
      content: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teslimat Tarihi *
            </label>
            <Input type="date" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teslimat Saati *
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
              <option>09:00 - 12:00</option>
              <option>12:00 - 15:00</option>
              <option>15:00 - 18:00</option>
              <option>18:00 - 21:00</option>
            </select>
          </div>
          <div className="bg-tulumbak-beige p-4 rounded-lg">
            <h4 className="font-medium text-tulumbak-slate mb-2">Teslimat Notu</h4>
            <p className="text-sm text-gray-600">
              Ürünlerimiz soğuk zincir korunarak teslim edilir. 
              Belirtilen saatte evde olmanızı rica ederiz.
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'Fatura Bilgileri',
      content: (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="same-address" className="rounded" />
            <label htmlFor="same-address" className="text-sm text-gray-700">
              Fatura adresi teslimat adresi ile aynı
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Firma Adı
              </label>
              <Input placeholder="Firma adı (isteğe bağlı)" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vergi No
              </label>
              <Input placeholder="Vergi numarası (isteğe bağlı)" />
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Ödeme',
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <label className="flex items-center space-x-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-tulumbak-amber">
              <input type="radio" name="payment" value="card" className="text-tulumbak-amber" />
              <div>
                <div className="font-medium">Kredi/Banka Kartı</div>
                <div className="text-sm text-gray-500">Visa, Mastercard, American Express</div>
              </div>
            </label>
            <label className="flex items-center space-x-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-tulumbak-amber">
              <input type="radio" name="payment" value="cash" className="text-tulumbak-amber" />
              <div>
                <div className="font-medium">Kapıda Ödeme</div>
                <div className="text-sm text-gray-500">Nakit veya kart ile teslimatta ödeme</div>
              </div>
            </label>
          </div>
          <div className="bg-tulumbak-beige p-4 rounded-lg">
            <h4 className="font-medium text-tulumbak-slate mb-2">Güvenli Ödeme</h4>
            <p className="text-sm text-gray-600">
              Tüm ödemeleriniz SSL sertifikası ile korunmaktadır. 
              Kart bilgileriniz saklanmaz.
            </p>
          </div>
        </div>
      )
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>{steps[currentStep].title}</CardTitle>
      </CardHeader>
      <CardContent>
        {steps[currentStep].content}
        
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            Geri
          </Button>
          
          <Button
            className="bg-tulumbak-amber hover:bg-tulumbak-amber/90"
            onClick={() => {
              if (currentStep < steps.length - 1) {
                setCurrentStep(currentStep + 1)
              } else {
                // Siparişi tamamla
                alert('Sipariş tamamlandı! (Demo)')
              }
            }}
          >
            {currentStep === steps.length - 1 ? 'Siparişi Tamamla' : 'İleri'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
