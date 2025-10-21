import { HomeHeader } from '@/components/features/home/HomeHeader';
import { HeroSection } from '@/components/features/home/HeroSection';
import { FeaturedDesserts } from '@/components/features/home/FeaturedDesserts';
import { RecentlyViewed } from '@/components/features/home/RecentlyViewed';
import { CustomerReviews } from '@/components/features/home/CustomerReviews';
import { OurStory } from '@/components/features/home/OurStory';
import { HomeFooter } from '@/components/features/home/HomeFooter';
import { 
  mockHeroContent, 
  mockCustomerReviews, 
  mockOurStory, 
  mockRecentlyViewedHome,
  getMockFeaturedProducts 
} from '@/lib/mock-data';

export default function Home() {
  // Get featured products
  const featuredProducts = getMockFeaturedProducts(6);

  return (
    <div className="min-h-screen bg-stitch-background-light font-display text-stitch-text-primary">
      {/* Header */}
      <HomeHeader />

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <div className="py-10">
          <div className="@[480px]:p-4">
            <HeroSection content={mockHeroContent} />
          </div>
        </div>

        {/* Featured Desserts */}
        <FeaturedDesserts 
          products={featuredProducts}
          title="Öne Çıkan Tatlılar"
        />

        {/* Recently Viewed */}
        <RecentlyViewed 
          products={mockRecentlyViewedHome}
          title="Son Görüntülenenler"
        />

        {/* Customer Reviews */}
        <CustomerReviews 
          reviews={mockCustomerReviews}
          title="Müşteriler Ne Diyor"
        />

        {/* Our Story */}
        <OurStory content={mockOurStory} />
      </main>

      {/* Footer */}
      <HomeFooter />
    </div>
  );
}
