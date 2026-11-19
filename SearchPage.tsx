import { AlertCircle, Play, Search as SearchIcon, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { MediaCard } from '../components/MediaCard';
import { PaginationBar } from '../components/PaginationBar';
import { PosterImage } from '../components/PosterImage';
import { TmdbSetupBanner } from '../components/TmdbSetupBanner';
import { ALLOWED_CATEGORIES } from '../constants/categories';
import { useMoviesit } from '../context/MoviesitContext';
import { searchTmdbAllowed } from '../services/tmdb';
import { fetchPersonalVideosJson } from '../services/videosJson';
import type { AllowedCategoryId, PersonalVideo, TmdbMediaItem } from '../types/media';

export function SearchPage() {
  const { tmdbConfigured, tmdbRevision, playPersonalVideo } = useMoviesit();

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<AllowedCategoryId | 'all'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [tmdbResults, setTmdbResults] = useState<TmdbMediaItem[]>([]);
  const [personalVideos, setPersonalVideos] = useState<PersonalVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPersonalVideosJson().then((res) => setPersonalVideos(res.videos));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!tmdbConfigured || !debouncedQuery) {
      setTmdbResults([]);
      setTotalPages(1);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    searchTmdbAllowed(debouncedQuery, categoryFilter, page)
      .then((res) => {
        if (!cancelled) {
          setTmdbResults(res.items);
          setTotalPages(res.totalPages);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Search failed.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tmdbConfigured, tmdbRevision, debouncedQuery, categoryFilter, page]);

  const matchingPersonal = debouncedQuery
    ? personalVideos.filter((v) => {
        const q = debouncedQuery.toLowerCase();
        const matchesText =
          v.title.toLowerCase().includes(q) ||
          v.description.toLowerCase().includes(q) ||
          v.category.toLowerCase().includes(q);
        if (!matchesText) return false;
        if (categoryFilter === 'all') return true;
        const catObj = ALLOWED_CATEGORIES.find((c) => c.id === categoryFilter);
        return catObj ? v.category.toLowerCase() === catObj.label.toLowerCase() : true;
      })
    : [];

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Search
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Search across curated TMDB categories and your personal /videos.json library.
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <SearchIcon
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Hindi, Malayalam, Tamil, Telugu, Korean, Anime titles..."
          aria-label="Search movies, series, anime, and personal videos"
          autoFocus
          className="h-12 w-full rounded-2xl border border-zinc-800 bg-[#111115] pl-12 pr-12 text-sm text-white placeholder:text-zinc-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 sm:text-base"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Strict 8-Category Filter Row */}
      <div className="scrollbar-hide -mx-4 flex items-center gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        <button
          type="button"
          onClick={() => {
            setCategoryFilter('all');
            setPage(1);
          }}
          className={`min-h-[38px] shrink-0 whitespace-nowrap rounded-xl border px-3.5 text-xs font-semibold transition-colors ${
            categoryFilter === 'all'
              ? 'border-purple-500/60 bg-purple-600/20 text-white'
              : 'border-zinc-800 bg-[#111115] text-zinc-400 hover:text-zinc-100'
          }`}
        >
          All Allowed Categories
        </button>
        {ALLOWED_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => {
              setCategoryFilter(cat.id);
              setPage(1);
            }}
            className={`min-h-[38px] shrink-0 whitespace-nowrap rounded-xl border px-3.5 text-xs font-semibold transition-colors ${
              categoryFilter === cat.id
                ? 'border-purple-500/60 bg-purple-600/20 text-white'
                : 'border-zinc-800 bg-[#111115] text-zinc-400 hover:text-zinc-100'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {!tmdbConfigured && <TmdbSetupBanner contextLabel="TMDB search results" />}

      {!debouncedQuery ? (
        <div className="rounded-2xl border border-zinc-800/80 bg-[#111115] p-8 text-center sm:p-12">
          <SearchIcon className="mx-auto mb-3 h-9 w-9 text-zinc-600" aria-hidden="true" />
          <p className="font-display text-lg font-semibold text-white">
            Type a title to search
          </p>
          <p className="mx-auto mt-1 max-w-md text-sm text-zinc-400">
            Results are automatically filtered to Hindi, Malayalam, Tamil, Telugu, Korean, and
            Anime releases—plus any matching videos from /videos.json.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {matchingPersonal.length > 0 && (
            <section>
              <h2 className="mb-3 font-display text-lg font-semibold text-white">
                Personal Library Matches
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {matchingPersonal.map((vid) => (
                  <button
                    key={vid.id}
                    type="button"
                    onClick={() => playPersonalVideo(vid)}
                    className="group text-left"
                  >
                    <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
                      <PosterImage
                        src={vid.poster}
                        alt={vid.title}
                        fallbackTitle={vid.title}
                        className="h-full w-full"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e50914] text-white">
                          <Play className="h-5 w-5 fill-current" aria-hidden="true" />
                        </span>
                      </div>
                    </div>
                    <p className="mt-2 truncate text-sm font-semibold text-white">
                      {vid.title}
                    </p>
                    <p className="truncate text-xs text-zinc-400">
                      {vid.year || 'Personal'} · {vid.category}
                    </p>
                  </button>
                ))}
              </div>
            </section>
          )}

          {tmdbConfigured && (
            <section>
              <h2 className="mb-3 font-display text-lg font-semibold text-white">
                TMDB Results
              </h2>

              {error ? (
                <div className="flex items-center gap-3 rounded-xl border border-[#e50914]/40 bg-[#e50914]/10 p-4 text-sm text-zinc-200">
                  <AlertCircle className="h-5 w-5 shrink-0 text-[#ff4757]" aria-hidden="true" />
                  <span>{error}</span>
                </div>
              ) : loading ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i}>
                      <div className="aspect-[2/3] w-full animate-pulse rounded-xl bg-zinc-900" />
                      <div className="mt-2 h-4 w-4/5 animate-pulse rounded bg-zinc-900" />
                    </div>
                  ))}
                </div>
              ) : tmdbResults.length === 0 ? (
                <div className="rounded-2xl border border-zinc-800 bg-[#111115] p-8 text-center">
                  <p className="text-base font-semibold text-white">
                    No matching titles in curated categories
                  </p>
                  <p className="mt-1 text-sm text-zinc-400">
                    TMDB results outside the 8 allowed categories are automatically hidden.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {tmdbResults.map((item) => (
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
            </section>
          )}
        </div>
      )}
    </div>
  );
}
