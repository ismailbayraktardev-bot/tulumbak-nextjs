import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-tulumbak-slate text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-serif font-bold text-tulumbak-amber mb-4">
              Tulumbak
            </h3>
            <p className="text-gray-300 mb-6 max-w-md">
              Türkiye&apos;nin en lezzetli tatlılarını evinize getiriyoruz. 
              Taze hazırlanmış, geleneksel tariflerle yapılmış tatlılarımızla 
              damak zevkinizi tatmin edin.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-tulumbak-amber transition-colors">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-300 hover:text-tulumbak-amber transition-colors">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.014 5.367 18.647.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.718-1.297c-.875.807-2.026 1.297-3.323 1.297s-2.448-.49-3.323-1.297c-.807-.875-1.297-2.026-1.297-3.323s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Hızlı Linkler</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-tulumbak-amber transition-colors">
                  Ana Sayfa
                </Link>
              </li>
              <li>
                <Link href="/kategori/tulumbalar" className="text-gray-300 hover:text-tulumbak-amber transition-colors">
                  Tulumbalar
                </Link>
              </li>
              <li>
                <Link href="/kategori/baklavalar" className="text-gray-300 hover:text-tulumbak-amber transition-colors">
                  Baklavalar
                </Link>
              </li>
              <li>
                <Link href="/kategori/sutlaclar" className="text-gray-300 hover:text-tulumbak-amber transition-colors">
                  Sütlaçlar
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">İletişim</h4>
            <ul className="space-y-2 text-gray-300">
              <li>📞 +90 (212) 555 0123</li>
              <li>✉️ info@tulumbak.com</li>
              <li>📍 İstanbul, Türkiye</li>
              <li>🕒 7/24 Teslimat</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-600 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; 2024 Tulumbak. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  )
}
