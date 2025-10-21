'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { NavigationMenu } from './NavigationMenu';
import { SearchBar } from './SearchBar';
import { NavigationItem } from '@/types/home';

interface HomeHeaderProps {
  className?: string;
}

export function HomeHeader({ className = '' }: HomeHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems: NavigationItem[] = [
    { label: 'Baklava', href: '/kategori/baklavalar' },
    { label: 'Lokum', href: '/kategori/lokumlar' },
    { label: 'Künefe', href: '/kategori/kunefeler' },
    { label: 'Tatlılar', href: '/kategori/tatlilar' },
    { label: 'Hediye Kutuları', href: '/kategori/hediye-kutulari' }
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-10 bg-stitch-background-light shadow-sm">
      {/* Main Header */}
      <div className="px-4 sm:px-10 flex items-center justify-between py-4">
        {/* Logo */}
        <div className="flex items-center gap-4 text-stitch-primary">
          <div className="size-8">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z" fill="currentColor"></path>
            </svg>
          </div>
          <Link href="/" className="text-2xl font-bold leading-tight tracking-[-0.015em] text-stitch-text-primary">
            Tulumbak
          </Link>
        </div>

        {/* Search Bar - Hidden on mobile */}
        <div className="hidden md:flex flex-1 justify-center items-center px-4">
          <SearchBar />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <Link 
            href="/sepet" 
            className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Sepet"
          >
            <span className="material-symbols-outlined">shopping_cart</span>
          </Link>
          <Link 
            href="/hesabim" 
            className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Hesabım"
          >
            <span className="material-symbols-outlined">account_circle</span>
          </Link>
          <button
            onClick={toggleMobileMenu}
            className="md:hidden flex items-center justify-center p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Menu"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </div>

      {/* Navigation Menu */}
      <NavigationMenu 
        items={navigationItems}
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuClose={() => setIsMobileMenuOpen(false)}
      />
    </header>
  );
}