import { Heart, Play, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { PosterImage } from '../components/PosterImage';
import { useMoviesit } from '../context/MoviesitContext';
import { clearFavorites, removeFavorite } from '../services/storage';
import type { FavoriteItem } from '../types/media';

type FavFilter = 'all' | 'movie' | 'tv' | 'personal';

export function FavoritesPage() {
  const { favorites, openMediaDetails, openPlayer, navigate } = useMoviesit();
  const [filter, setFilter] = useState<FavFilter>('all');

  const filtered = favorites.filter((item) => {
    if (filter === 'all') return true;
    return item.mediaType === filter;
  });

  const handleOpen = (item: FavoriteItem) => {
    if (item.source === 'tmdb' && (item.mediaType === 'movie' || item.mediaType === 'tv')) {
      openMediaDetails(item.mediaType, Number(item.id));
    } else if (item.videoUrl) {
      openPlayer({
        id: String(item.id),
        title: item.title,
        description: item.overview,
        poster: item.poster || '',
        videoUrl: item.videoUrl,
        type: 'movie',
        language: item.language,
        category: item.categoryLabel,
        year: item.year,
        source: 'videos-json',
      });
    } else {
      navigate('my-videos');
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-4 border-b border-zinc-800/80 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Favorites
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Saved locally on your device via LocalStorage.
          </p>
        </div>

        {favorites.length > 0 && (
          <button
            type="button"
            onClick={() => clearFavorites()}
            className="flex min-h-[40px] items-center gap-2 self-start whitespace-nowrap rounded-xl border border-zinc-800 bg-[#111115] px-4 text-xs font-semibold text-zinc-300 transition-colors hover:border-[#e50914]/50 hover:text-white sm:self-auto"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(
          [
            { id: 'all', label: 'All Saved' },
            { id: 'movie', label: 'Movies' },
            { id: 'tv', label: 'TV Series' },
            { id: 'personal', label: 'My Videos' },
          ] as { id: FavFilter; label: string }[]
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={`min-h-[40px] whitespace-nowrap rounded-xl border px-4 text-xs font-semibold transition-colors ${
              filter === tab.id
                ? 'border-purple-500/60 bg-purple-600/20 text-white'
                : 'border-zinc-800 bg-[#111115] text-zinc-400 hover:text-zinc-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-[#111115] p-10 text-center">
          <Heart className="mx-auto mb-3 h-9 w-9 text-zinc-600" aria-hidden="true" />
          <p className="font-display text-lg font-semibold text-white">No favorites yet</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-zinc-400">
            Tap the heart icon on any movie, series, anime, or personal video to save it here for
            quick access.
          </p>
          <button
            type="button"
            onClick={() => navigate('home')}
            className="mt-5 inline-flex min-h-[44px] items-center rounded-xl bg-[#e50914] px-5 text-sm font-semibold text-white hover:bg-[#c80812]"
          >
            Explore Catalog
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filtered.map((item) => (
            <article key={item.key} className="group relative flex flex-col">
              <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 transition-transform duration-200 group-hover:-translate-y-1 group-hover:border-purple-500/50">
                <button
                  type="button"
                  onClick={() => handleOpen(item)}
                  className="block h-full w-full text-left"
                >
                  <PosterImage
                    src={item.poster}
                    alt={item.title}
                    fallbackTitle={item.title}
                    className="h-full w-full"
                  />
                  {item.source === 'personal' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e50914] text-white">
                        <Play className="h-5 w-5 fill-current" aria-hidden="true" />
                      </span>
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => removeFavorite(item.key)}
                  aria-label={`Remove ${item.title} from favorites`}
                  className="absolute right-1.5 top-1.5 flex min-h-[44px] min-w-[44px] items-center justify-center"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e50914] text-white shadow">
                    <Heart className="h-4 w-4 fill-current" aria-hidden="true" />
                  </span>
                </button>

                {typeof item.rating === 'number' && item.rating > 0 && (
                  <div className="pointer-events-none absolute bottom-2.5 left-2.5 flex items-center gap-1 text-xs font-semibold text-white tabular-nums drop-shadow">
                    <Star className="h-3.5 w-3.5 fill-[#e50914] text-[#e50914]" aria-hidden="true" />
                    <span>{item.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleOpen(item)}
                className="mt-2.5 line-clamp-1 text-left text-sm font-semibold text-zinc-100 hover:text-[#ff4757]"
              >
                {item.title}
              </button>
              <p className="mt-0.5 truncate text-xs text-zinc-400 tabular-nums">
                {item.year} · {item.categoryLabel}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
