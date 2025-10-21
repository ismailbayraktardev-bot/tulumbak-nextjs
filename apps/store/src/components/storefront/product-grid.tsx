import { ProductGridProps } from 'tulumbak-shared'
import { ProductCard } from './product-card'

export function ProductGrid({ 
  products, 
  columns = { sm: 1, md: 2, lg: 3 } 
}: ProductGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2', 
    3: 'grid-cols-3',
    4: 'grid-cols-4'
  }

  return (
    <div className={`grid gap-8 ${gridCols[columns.sm as keyof typeof gridCols]} md:${gridCols[columns.md as keyof typeof gridCols]} lg:${gridCols[columns.lg as keyof typeof gridCols]}`}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
        />
      ))}
    </div>
  )
}
