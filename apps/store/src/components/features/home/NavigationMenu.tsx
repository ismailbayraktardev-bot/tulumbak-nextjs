'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { NavigationItem } from '@/types/home';

interface NavigationMenuProps {
  items: NavigationItem[];
  isMobileMenuOpen: boolean;
  onMobileMenuClose: () => void;
}

export function NavigationMenu({ items, isMobileMenuOpen, onMobileMenuClose }: NavigationMenuProps) {
  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (isMobileMenuOpen) {
        onMobileMenuClose();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMobileMenuOpen) {
        onMobileMenuClose();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isMobileMenuOpen, onMobileMenuClose]);

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex justify-center items-center border-t border-gray-200 py-3">
        <ul className="flex items-center gap-8">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="text-sm font-medium text-stitch-text-primary hover:text-stitch-primary transition-colors"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile Navigation - Slide-in Drawer */}
      {isMobileMenuOpen && (
        <>
          {/* Overlay */}
          <div 
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onMobileMenuClose}
          />
          
          {/* Mobile Menu */}
          <nav className="md:hidden fixed top-0 left-0 w-64 h-full bg-stitch-background-light shadow-lg z-50 transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-2 text-stitch-primary">
                  <div className="size-8">
                    <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z" fill="currentColor"></path>
                    </svg>
                  </div>
                  <span className="text-xl font-bold text-stitch-text-primary">Tulumbak</span>
                </div>
                <button
                  onClick={onMobileMenuClose}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Menu kapat"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* Mobile Menu Items */}
              <div className="flex-1 overflow-y-auto py-4">
                <ul className="flex flex-col gap-2 px-4">
                  {items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="block py-3 px-4 text-sm font-medium text-stitch-text-primary hover:bg-gray-100 hover:text-stitch-primary rounded-lg transition-colors"
                        onClick={onMobileMenuClose}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Mobile Menu Footer */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex gap-4">
                  <Link
                    href="/sepet"
                    className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100 transition-colors"
                    onClick={onMobileMenuClose}
                  >
                    <span className="material-symbols-outlined">shopping_cart</span>
                  </Link>
                  <Link
                    href="/hesabim"
                    className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100 transition-colors"
                    onClick={onMobileMenuClose}
                  >
                    <span className="material-symbols-outlined">account_circle</span>
                  </Link>
                </div>
              </div>
            </div>
          </nav>
        </>
      )}
    </>
  );
}