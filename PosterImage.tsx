import { Film } from 'lucide-react';
import { useState } from 'react';

interface PosterImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fallbackTitle?: string;
  aspect?: 'poster' | 'backdrop' | 'square';
}

export function PosterImage({
  src,
  alt,
  className = '',
  fallbackTitle,
  aspect = 'poster',
}: PosterImageProps) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#18181b] via-[#12101a] to-[#09090b] p-4 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(147,51,234,0.16),transparent_60%),radial-gradient(circle_at_bottom_left,rgba(229,9,20,0.14),transparent_60%)]" />
        <Film className="relative mb-2 h-8 w-8 text-zinc-600" aria-hidden="true" />
        {fallbackTitle && aspect !== 'backdrop' && (
          <span className="relative line-clamp-3 text-xs font-medium text-zinc-400">
            {fallbackTitle}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-zinc-900 ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-zinc-900" aria-hidden="true" />
      )}
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={`h-full w-full object-cover transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
}
