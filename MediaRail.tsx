import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';
import type { TmdbMediaItem } from '../types/media';
import { MediaCard } from './MediaCard';

interface MediaRailProps {
  title: string;
  subtitle?: string;
  items: TmdbMediaItem[];
  loading?: boolean;
  onSeeAll?: () => void;
}

export function MediaRail({
  title,
  subtitle,
  items,
  loading = false,
  onSeeAll,
}: MediaRailProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const scrollBy = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const distance = Math.max(320, el.clientWidth * 0.78);
    el.scrollBy({
      left: direction === 'left' ? -distance : distance,
      behavior: 'smooth',
    });
  };

  if (!loading && items.length === 0) {
    return null;
  }

  return (
    <section className="relative">
      <div className="mb-3.5 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h2 className="font-display text-lg font-semibold tracking-tight text-white sm:text-xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-0.5 truncate text-xs text-zinc-400">{subtitle}</p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {onSeeAll && (
            <button
              type="button"
              onClick={onSeeAll}
              className="min-h-[40px] whitespace-nowrap rounded-lg px-3 text-xs font-semibold text-zinc-300 transition-colors hover:bg-zinc-900 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e50914]"
            >
              View all
            </button>
          )}
          <div className="hidden items-center gap-1 sm:flex">
            <button
              type="button"
              onClick={() => scrollBy('left')}
              aria-label={`Scroll ${title} left`}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950/90 text-zinc-300 transition-colors hover:border-zinc-700 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e50914]"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => scrollBy('right')}
              aria-label={`Scroll ${title} right`}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950/90 text-zinc-300 transition-colors hover:border-zinc-700 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e50914]"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex gap-3.5 overflow-hidden">
          {Array.from({ length: 7 }).map((_, idx) => (
            <div key={idx} className="w-[148px] shrink-0 sm:w-[172px]">
              <div className="aspect-[2/3] w-full animate-pulse rounded-xl bg-zinc-900" />
              <div className="mt-2.5 h-4 w-4/5 animate-pulse rounded bg-zinc-900" />
              <div className="mt-1.5 h-3 w-3/5 animate-pulse rounded bg-zinc-900/70" />
            </div>
          ))}
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-3.5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0"
        >
          {items.map((item) => (
            <div key={`${item.mediaType}-${item.id}`} className="snap-start">
              <MediaCard item={item} compact />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
