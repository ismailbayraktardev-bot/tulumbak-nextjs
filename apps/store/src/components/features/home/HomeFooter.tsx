'use client';

import React from 'react';
import Link from 'next/link';

interface HomeFooterProps {
  className?: string;
}

export function HomeFooter({ className = '' }: HomeFooterProps) {
  return (
    <footer className={`bg-stitch-background-light border-t border-gray-200 mt-10 ${className}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Brand Info */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-stitch-primary">
              <div className="size-8">
                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z" fill="currentColor"></path>
                </svg>
              </div>
              <h3 className="font-bold text-xl text-stitch-text-primary">Tulumbak</h3>
            </div>
            <p className="text-sm text-stitch-text-secondary">
              Otantik Türk Tatlıları, sevgiyle hazırlanmış.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-stitch-text-primary">Hızlı Linkler</h3>
            <Link href="/hakkimizda" className="text-sm text-stitch-text-secondary hover:text-stitch-primary transition-colors">
              Hakkımızda
            </Link>
            <Link href="/iletisim" className="text-sm text-stitch-text-secondary hover:text-stitch-primary transition-colors">
              İletişim
            </Link>
            <Link href="/gizlilik-politikasi" className="text-sm text-stitch-text-secondary hover:text-stitch-primary transition-colors">
              Gizlilik Politikası
            </Link>
            <Link href="/kullanim-kosullari" className="text-sm text-stitch-text-secondary hover:text-stitch-primary transition-colors">
              Kullanım Koşulları
            </Link>
          </div>

          {/* Shop Links */}
          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-stitch-text-primary">Mağaza</h3>
            <Link href="/kategori" className="text-sm text-stitch-text-secondary hover:text-stitch-primary transition-colors">
              Tüm Ürünler
            </Link>
            <Link href="/kategori/hediye-kutulari" className="text-sm text-stitch-text-secondary hover:text-stitch-primary transition-colors">
              Hediye Kutuları
            </Link>
            <Link href="/sss" className="text-sm text-stitch-text-secondary hover:text-stitch-primary transition-colors">
              Sıkça Sorulan Sorular
            </Link>
          </div>

          {/* Social Media */}
          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-stitch-text-primary">Bizi Takip Edin</h3>
            <div className="flex gap-4">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-stitch-text-secondary hover:text-stitch-primary transition-colors"
                aria-label="Facebook"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.323-1.325z"></path>
                </svg>
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-stitch-text-secondary hover:text-stitch-primary transition-colors"
                aria-label="Instagram"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.689-.073-4.948-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44 1.441-.645 1.441-1.44c0-.795-.645-1.44-1.441-1.44z"></path>
                </svg>
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-stitch-text-secondary hover:text-stitch-primary transition-colors"
                aria-label="Twitter"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616v.064c0 2.298 1.634 4.212 3.793 4.649-.65.177-1.336.216-2.027.189.58 1.867 2.268 3.228 4.267 3.265-1.79 1.403-4.062 2.24-6.522 2.24-.424 0-.84-.025-1.249-.073 2.308 1.483 5.068 2.348 8.04 2.348 9.638 0 14.921-7.98 14.921-14.921 0-.227-.005-.453-.014-.678.98-.713 1.832-1.6 2.524-2.61z"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-xs text-stitch-text-secondary mt-10 border-t border-gray-200 pt-8">
          © 2023 Tulumbak. Tüm hakları saklıdır.
        </div>
      </div>
    </footer>
  );
}