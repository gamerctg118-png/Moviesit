import { Heart, Star } from 'lucide-react';
import { useMoviesit } from '../context/MoviesitContext';
import { getPosterUrl } from '../services/tmdb';
import type { TmdbMediaItem } from '../types/media';
import { PosterImage } from './PosterImage';

interface MediaCardProps {
  item: TmdbMediaItem;
  compact?: boolean;
}

export function MediaCard({ item, compact = false }: MediaCardProps) {
  const { openMediaDetails, isFavoriteKey, toggleFavorite } = useMoviesit();
  const favKey = `tmdb:${item.mediaType}:${item.id}`;
  const favored = isFavoriteKey(favKey);
  const posterUrl = getPosterUrl(item.posterPath, 'w500');
  const year = item.releaseDate ? item.releaseDate.slice(0, 4) : 'TBA';

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite({
      key: favKey,
      source: 'tmdb',
      id: item.id,
      mediaType: item.mediaType,
      title: item.title,
      overview: item.overview,
      poster: posterUrl,
      backdrop: item.backdropPath,
      year,
      rating: item.voteAverage,
      categoryLabel: item.categoryLabel,
      language: item.originalLanguage,
    });
  };

  return (
    <article
      className={`group relative flex flex-col ${
        compact ? 'w-[148px] sm:w-[172px] shrink-0' : 'w-full'
      }`}
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-950 transition-transform duration-200 ease-out group-hover:-translate-y-1 group-hover:border-purple-500/50 group-hover:shadow-[0_12px_32px_-8px_rgba(147,51,234,0.28)]">
        <button
          type="button"
          onClick={() => openMediaDetails(item.mediaType, item.id)}
          className="block h-full w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e50914]"
          aria-label={`View details for ${item.title}`}
        >
          <PosterImage
            src={posterUrl}
            alt={item.title}
            fallbackTitle={item.title}
            className="h-full w-full"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-70 transition-opacity duration-200 group-hover:opacity-90" />
        </button>

        <button
          type="button"
          onClick={handleToggleFavorite}
          aria-label={favored ? `Remove ${item.title} from favorites` : `Add ${item.title} to favorites`}
          className="absolute right-1.5 top-1.5 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-white transition-transform duration-150 active:scale-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e50914]"
        >
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-colors ${
              favored
                ? 'bg-[#e50914] text-white'
                : 'bg-black/55 text-zinc-200 hover:bg-black/80'
            }`}
          >
            <Heart className={`h-4 w-4 ${favored ? 'fill-current' : ''}`} aria-hidden="true" />
          </span>
        </button>

        {item.voteAverage > 0 && (
          <div className="pointer-events-none absolute bottom-2.5 left-2.5 flex items-center gap-1 text-xs font-semibold text-zinc-100 tabular-nums drop-shadow">
            <Star className="h-3.5 w-3.5 fill-[#e50914] text-[#e50914]" aria-hidden="true" />
            <span>{item.voteAverage.toFixed(1)}</span>
          </div>
        )}
      </div>

      <div className="mt-2.5 px-0.5">
        <button
          type="button"
          onClick={() => openMediaDetails(item.mediaType, item.id)}
          className="line-clamp-1 w-full text-left text-sm font-semibold text-zinc-100 transition-colors hover:text-[#ff4757] focus:outline-none focus-visible:underline"
        >
          {item.title}
        </button>
        <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-zinc-400 tabular-nums">
          <span>{year}</span>
          <span aria-hidden="true">·</span>
          <span className="truncate">{item.categoryLabel}</span>
        </p>
      </div>
    </article>
  );
}
