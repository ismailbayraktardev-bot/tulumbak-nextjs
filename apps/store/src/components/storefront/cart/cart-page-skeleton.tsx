import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export function CartPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Page Header */}
      <div className="mb-8">
        <div className="h-8 w-32 bg-muted rounded animate-pulse mb-2"></div>
        <div className="h-4 w-64 bg-muted rounded animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items Skeleton */}
        <div className="lg:col-span-2 space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-muted rounded animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 bg-muted rounded animate-pulse"></div>
                    <div className="h-3 w-1/2 bg-muted rounded animate-pulse"></div>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
                    <div className="h-8 w-24 bg-muted rounded animate-pulse"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Cart Summary Skeleton */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="h-6 w-24 bg-muted rounded animate-pulse"></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-12 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <div className="h-5 w-16 bg-muted rounded animate-pulse"></div>
                  <div className="h-5 w-24 bg-muted rounded animate-pulse"></div>
                </div>
              </div>
              <div className="h-12 w-full bg-muted rounded animate-pulse"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
