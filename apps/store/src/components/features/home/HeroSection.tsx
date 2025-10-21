'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HeroContent } from '@/types/home';

interface HeroSectionProps {
  content: HeroContent;
  className?: string;
}

export function HeroSection({ content, className = '' }: HeroSectionProps) {
  return (
    <div className={`relative flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat items-center justify-center p-4 @[480px]:gap-8 @[480px]:rounded-xl ${className}`}
         style={{
           backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.5) 100%), url(${content.backgroundImage})`
         }}
    >
      {/* Hero Content */}
      <div className="flex flex-col gap-2 text-center max-w-xl">
        <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em] @[480px]:text-5xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em]">
          {content.title}
        </h1>
        <h2 className="text-white text-sm font-normal leading-normal @[480px]:text-base @[480px]:font-normal @[480px]:leading-normal">
          {content.subtitle}
        </h2>
      </div>

      {/* CTA Button */}
      <Link
        href={content.cta.href}
        className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 @[480px]:h-12 @[480px]:px-5 bg-stitch-primary text-white text-sm font-bold leading-normal tracking-[0.015em] @[480px]:text-base @[480px]:font-bold @[480px]:leading-normal @[480px]:tracking-[0.015em] hover:bg-opacity-90 transition-colors"
      >
        <span className="truncate">{content.cta.label}</span>
      </Link>
    </div>
  );
}