import { Skeleton } from 'tulumbak-ui'

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
      <Skeleton className="aspect-product w-full" />
      <div className="p-6 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  )
}

export function PDPImageSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="aspect-square w-full rounded-2xl" />
      <div className="grid grid-cols-4 gap-2">
        <Skeleton className="aspect-square rounded-lg" />
        <Skeleton className="aspect-square rounded-lg" />
        <Skeleton className="aspect-square rounded-lg" />
        <Skeleton className="aspect-square rounded-lg" />
      </div>
    </div>
  )
}

export function CategoryTileSkeleton() {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white shadow-card">
      <Skeleton className="aspect-category w-full" />
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <Skeleton className="h-6 w-32 mb-2" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  )
}

export function FilterBarSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-card p-6 space-y-6">
      <Skeleton className="h-6 w-20" />
      <div className="space-y-4">
        <Skeleton className="h-4 w-16" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-4 w-20" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
      <Skeleton className="h-8 w-full" />
    </div>
  )
}
