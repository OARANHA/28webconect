'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholder?: string;
  priority?: boolean;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
  placeholder,
  priority = false,
}) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className={`relative overflow-hidden ${isLoading ? 'animate-pulse bg-gray-200' : ''}`}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={() => setIsLoading(false)}
        onError={() => setIsLoading(false)}
        priority={priority}
        unoptimized // For external images
      />
      {isLoading && placeholder && (
        <div className="absolute inset-0 flex items-center justify-center">
          <img src={placeholder} alt="Placeholder" className="opacity-50" />
        </div>
      )}
    </div>
  );
};

export default LazyImage;