import { AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { MediaCard } from '../components/MediaCard';
import { PaginationBar } from '../components/PaginationBar';
import { TmdbSetupBanner } from '../components/TmdbSetupBanner';
import { SERIES_CATEGORIES } from '../constants/categories';
import { useMoviesit } from '../context/MoviesitContext';
import {
  type DiscoverSortOption,
  fetchAggregatedGroup,
  fetchCategoryDiscover,
} from '../services/tmdb';
import type { AllowedCategoryId, TmdbMediaItem } from '../types/media';

const SORT_OPTIONS: { id: DiscoverSortOption; label: string }[] = [
  { id: 'popular', label: 'Popular' },
  { id: 'trending', label: 'Trending' },
  { id: 'top_rated', label: 'Top Rated' },
  { id: 'upcoming', label: 'Upcoming' },
];

export function TvSeriesPage() {
  const { tmdbConfigured, tmdbRevision, categoryPreset, clearCategoryPreset } = useMoviesit();

  const [selectedCategory, setSelectedCategory] = useState<AllowedCategoryId | 'all'>('all');
  const [sort, setSort] = useState<DiscoverSortOption>('popular');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [items, setItems] = useState<TmdbMediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (categoryPreset && SERIES_CATEGORIES.some((c) => c.id === categoryPreset)) {
      setSelectedCategory(categoryPreset);
      setPage(1);
      clearCategoryPreset();
    }
  }, [categoryPreset, clearCategoryPreset]);

  useEffect(() => {
    if (!tmdbConfigured) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    const request =
      selectedCategory === 'all'
        ? fetchAggregatedGroup('all-series', sort, page)
        : fetchCategoryDiscover(
            selectedCategory,
            sort === 'trending' ? 'popular' : sort,
            page,
          );

    request
      .then((res) => {
        if (!cancelled) {
          setItems(res.items);
          setTotalPages(res.totalPages);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load TV series.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tmdbConfigured, tmdbRevision, selectedCategory, sort, page]);

  const handleCategoryChange = (cat: AllowedCategoryId | 'all') => {
    setSelectedCategory(cat);
    setPage(1);
    if (cat !== 'all' && sort === 'trending') {
      setSort('popular');
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-4 border-b border-zinc-800/80 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
            TV Series
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Korean Series and Anime Series curated automatically via TMDB.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1 rounded-xl border border-zinc-800 bg-[#111115] p-1">
          {SORT_OPTIONS.map((opt) => {
            if (opt.id === 'trending' && selectedCategory !== 'all') return null;
            const active = sort === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setSort(opt.id);
                  setPage(1);
                }}
                className={`min-h-[36px] whitespace-nowrap rounded-lg px-3 text-xs font-semibold transition-colors ${
                  active ? 'bg-[#e50914] text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => handleCategoryChange('all')}
          className={`min-h-[40px] whitespace-nowrap rounded-xl border px-4 text-xs font-semibold transition-colors ${
            selectedCategory === 'all'
              ? 'border-purple-500/60 bg-purple-600/20 text-white'
              : 'border-zinc-800 bg-[#111115] text-zinc-400 hover:border-zinc-700 hover:text-zinc-100'
          }`}
        >
          All Series Categories
        </button>

        {SERIES_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => handleCategoryChange(cat.id)}
            className={`min-h-[40px] whitespace-nowrap rounded-xl border px-4 text-xs font-semibold transition-colors ${
              selectedCategory === cat.id
                ? 'border-purple-500/60 bg-purple-600/20 text-white'
                : 'border-zinc-800 bg-[#111115] text-zinc-400 hover:border-zinc-700 hover:text-zinc-100'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {!tmdbConfigured ? (
        <TmdbSetupBanner contextLabel="Korean & Anime series" />
      ) : error ? (
        <div className="flex items-center gap-3 rounded-xl border border-[#e50914]/40 bg-[#e50914]/10 p-4 text-sm text-zinc-200">
          <AlertCircle className="h-5 w-5 shrink-0 text-[#ff4757]" aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i}>
              <div className="aspect-[2/3] w-full animate-pulse rounded-xl bg-zinc-900" />
              <div className="mt-2 h-4 w-4/5 animate-pulse rounded bg-zinc-900" />
              <div className="mt-1 h-3 w-3/5 animate-pulse rounded bg-zinc-900/70" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-[#111115] p-10 text-center">
          <p className="text-base font-semibold text-white">No series found for this filter</p>
          <p className="mt-1 text-sm text-zinc-400">
            Try switching the sort order or selecting another series category.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {items.map((item) => (
              <MediaCard key={`${item.mediaType}-${item.id}`} item={item} />
            ))}
          </div>
          <PaginationBar
            page={page}
            totalPages={totalPages}
            onPageChange={(next) => {
              setPage(next);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            loading={loading}
          />
        </>
      )}
    </div>
  );
}
