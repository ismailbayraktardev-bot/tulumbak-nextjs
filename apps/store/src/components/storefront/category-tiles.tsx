import Link from 'next/link'
import { CategoryTilesProps } from 'tulumbak-shared'

export function CategoryTiles({ items }: CategoryTilesProps) {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif font-bold text-tulumbak-slate mb-4">
            Kategorilerimiz
          </h2>
          <p className="text-lg text-gray-600">
            En lezzetli tatlılarımızı keşfedin
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="group relative overflow-hidden rounded-2xl bg-white shadow-card hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="aspect-category">
                <img
                  src={item.image.src}
                  alt={item.image.alt || item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-xl font-serif font-bold text-white mb-2">
                  {item.title}
                </h3>
                <div className="flex items-center text-white/90 group-hover:text-white transition-colors">
                  <span className="text-sm">Keşfet</span>
                  <svg
                    className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
