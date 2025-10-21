'use client';

import React from 'react';
import Image from 'next/image';
import { OurStory as OurStoryType } from '@/types/home';

interface OurStoryProps {
  content: OurStoryType;
  className?: string;
}

export function OurStory({ content, className = '' }: OurStoryProps) {
  return (
    <section className={`grid md:grid-cols-2 gap-8 items-center p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto py-16 ${className}`}>
      {/* Video/Image */}
      <div className="rounded-xl overflow-hidden aspect-video relative">
        {content.videoUrl ? (
          <video
            className="w-full h-full object-cover"
            controls
            poster={content.videoUrl}
            aria-label={content.videoAlt || "Bizim Hikayemiz"}
          >
            <source src={content.videoUrl} type="video/mp4" />
            Tarayıcınız video etiketini desteklemiyor.
          </video>
        ) : (
          <div className="w-full h-full bg-stitch-background-light flex items-center justify-center">
            <div className="text-center p-8">
              <div className="mb-4">
                <span className="material-symbols-outlined text-6xl text-stitch-primary">
                  play_circle
                </span>
              </div>
              <p className="text-stitch-text-primary font-medium">
                Yakında video eklenecek
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Story Content */}
      <div className="flex flex-col gap-4">
        <h2 className="text-stitch-text-primary text-3xl font-bold leading-tight tracking-[-0.015em]">
          {content.title}
        </h2>
        <p className="text-stitch-text-secondary text-base font-normal leading-normal">
          {content.content}
        </p>
      </div>
    </section>
  );
}