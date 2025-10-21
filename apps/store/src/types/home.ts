// Home page specific types

export interface HeroContent {
  title: string;
  subtitle: string;
  cta: {
    label: string;
    href: string;
  };
  backgroundImage: string;
}

export interface NavigationItem {
  label: string;
  href: string;
}

export interface Review {
  id: string;
  rating: number;
  content: string;
  reviewer: {
    name: string;
  };
  date: string;
}

export interface OurStory {
  title: string;
  content: string;
  videoUrl?: string;
  videoAlt?: string;
}

export interface HomeSectionTitles {
  featuredDesserts: string;
  recentlyViewed: string;
  customerReviews: string;
  ourStory: string;
}