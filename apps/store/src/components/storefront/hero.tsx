import { Button } from 'tulumbak-ui'
import { HeroProps } from 'tulumbak-shared'

export function Hero({ title, subtitle, cta, image }: HeroProps) {
  return (
    <section className="relative bg-gradient-to-r from-tulumbak-beige to-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-serif font-bold text-tulumbak-slate">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xl text-gray-600 max-w-lg">
                  {subtitle}
                </p>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-tulumbak-amber hover:bg-tulumbak-amber/90 text-white"
                asChild
              >
                <a href={cta.href}>
                  {cta.label}
                </a>
              </Button>
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="aspect-hero rounded-2xl overflow-hidden shadow-card">
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-tulumbak-amber/20 rounded-full blur-xl"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-tulumbak-amber/10 rounded-full blur-2xl"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
