'use client';

import { useState } from 'react';
import Image from 'next/image';

export function ImageGallery({ images, title }: { images: string[]; title: string }) {
  const safeImages = images.length > 0 ? images : ['/placeholder.svg'];
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-bg">
        <Image
          src={safeImages[active]}
          alt={title}
          fill
          sizes="(min-width: 1024px) 480px, 100vw"
          className="object-contain p-6"
          unoptimized
          priority
        />
      </div>
      {safeImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {safeImages.map((src, i) => (
            <button
              key={src + i}
              onClick={() => setActive(i)}
              aria-label={`Show image ${i + 1} of ${safeImages.length}`}
              aria-current={i === active}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-md border bg-bg ${
                i === active ? 'border-accent' : 'border-border'
              }`}
            >
              <Image src={src} alt="" fill sizes="64px" className="object-contain p-1" unoptimized />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
