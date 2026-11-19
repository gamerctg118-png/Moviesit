import { Check, Heart, Info, KeyRound, Play, Star } from 'lucide-react';
import { useState } from 'react';
import { useMoviesit } from '../context/MoviesitContext';
import { getBackdropUrl, getPosterUrl, testTmdbCredential } from '../services/tmdb';
import type { TmdbMediaItem } from '../types/media';

interface HeroBannerProps {
  featuredItems: TmdbMediaItem[];
  tmdbConfigured: boolean;
}

const FALLBACK_HERO_ART = '/src/assets/images/moviesit_hero_backdrop_1795116699649.jpg';

export function HeroBanner({ featuredItems, tmdbConfigured }: HeroBannerProps) {
  const { openMediaDetails, isFavoriteKey, toggleFavorite, updateSettings, navigate } =
    useMoviesit();
  const [activeIndex, setActiveIndex] = useState(0);
  const [quickKey, setQuickKey] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  const handleQuickConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = quickKey.trim();
    if (!trimmed) return;
    setConnecting(true);
    setConnectError(null);
    try {
      await testTmdbCredential(trimmed);
      updateSettings({ tmdbApiKey: trimmed });
      setQuickKey('');
    } catch (err) {
      setConnectError(
        err instanceof Error ? err.message : 'Invalid TMDB API key or token.',
      );
    } finally {
      setConnecting(false);
    }
  };

  if (!tmdbConfigured || featuredItems.length === 0) {
    return (
      <section className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-[#111115]">
        <div className="relative min-h-[380px] w-full sm:min-h-[440px]">
          <img
            src={FALLBACK_HERO_ART}
            alt="Moviesit cinema projection backdrop"
            referrerPolicy="no-referrer"
            className="absolute inset-0 h-full w-full object-cover opacity-75"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#09090b] via-[#09090b]/85 to-[#09090b]/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent" />

          <div className="relative z-10 flex h-full min-h-[380px] max-w-2xl flex-col justify-end p-6 sm:min-h-[440px] sm:p-10">
            <p className="text-xs font-semibold tracking-wide text-purple-400">
              Curated Cinema Discovery &amp; Personal Streaming
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-white [text-wrap:balance] sm:text-5xl">
              Stream your own videos. Discover curated regional &amp; anime cinema.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-300 sm:text-base">
              Connect your free TMDB API key to automatically load Hindi, Malayalam, Tamil,
              Telugu, Korean, and Anime titles—or jump directly to your personal MP4 library.
            </p>

            {!tmdbConfigured && (
              <form
                onSubmit={handleQuickConnect}
                className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center"
              >
                <div className="relative flex-1">
                  <KeyRound
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
                    aria-hidden="true"
                  />
                  <input
                    type="password"
                    value={quickKey}
                    onChange={(e) => setQuickKey(e.target.value)}
                    placeholder="Paste TMDB API Key (v3) or Read Token (v4)"
                    aria-label="TMDB API Key"
                    className="h-11 w-full rounded-xl border border-zinc-700/90 bg-black/70 pl-10 pr-4 text-sm text-white placeholder:text-zinc-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={connecting || !quickKey.trim()}
                  className="flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#e50914] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#c80812] disabled:opacity-50"
                >
                  {connecting ? 'Verifying...' : 'Connect TMDB'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('my-videos')}
                  className="flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-zinc-700 bg-zinc-900/80 px-5 text-sm font-semibold text-zinc-100 transition-colors hover:border-purple-500/60 hover:bg-zinc-900"
                >
                  <Play className="h-4 w-4 fill-current" aria-hidden="true" />
                  <span>My Videos</span>
                </button>
              </form>
            )}

            {connectError && (
              <p className="mt-2.5 text-xs font-medium text-[#ff4757]">{connectError}</p>
            )}
          </div>
        </div>
      </section>
    );
  }

  const safeIdx = activeIndex % featuredItems.length;
  const current = featuredItems[safeIdx];
  const backdropUrl = getBackdropUrl(current.backdropPath, 'w1280');
  const posterUrl = getPosterUrl(current.posterPath, 'w500');
  const year = current.releaseDate ? current.releaseDate.slice(0, 4) : 'TBA';
  const favKey = `tmdb:${current.mediaType}:${current.id}`;
  const favored = isFavoriteKey(favKey);

  return (
    <section className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-[#111115]">
      <div className="relative min-h-[400px] w-full sm:min-h-[480px]">
        {backdropUrl ? (
          <img
            src={backdropUrl}
            alt={current.title}
            referrerPolicy="no-referrer"
            className="absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-500"
          />
        ) : (
          <img
            src={FALLBACK_HERO_ART}
            alt={current.title}
            referrerPolicy="no-referrer"
            className="absolute inset-0 h-full w-full object-cover opacity-70"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-r from-[#09090b] via-[#09090b]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/30 to-transparent" />

        <div className="relative z-10 flex min-h-[400px] flex-col justify-end p-6 sm:min-h-[480px] sm:p-10">
          <div className="max-w-2xl">
            <p className="flex flex-wrap items-center gap-2 text-xs font-medium text-zinc-300 tabular-nums sm:text-sm">
              <span className="font-semibold text-purple-400">{current.categoryLabel}</span>
              <span aria-hidden="true">·</span>
              <span>{year}</span>
              {current.voteAverage > 0 && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1 text-zinc-100">
                    <Star
                      className="h-3.5 w-3.5 fill-[#e50914] text-[#e50914]"
                      aria-hidden="true"
                    />
                    {current.voteAverage.toFixed(1)}
                  </span>
                </>
              )}
            </p>

            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-white [text-wrap:balance] sm:text-5xl">
              {current.title}
            </h1>

            {current.overview && (
              <p className="mt-3 line-clamp-3 max-w-xl text-sm leading-relaxed text-zinc-300 sm:text-base">
                {current.overview}
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => openMediaDetails(current.mediaType, current.id)}
                className="flex min-h-[44px] items-center gap-2 whitespace-nowrap rounded-xl bg-[#e50914] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#e50914]/25 transition-colors hover:bg-[#c80812] focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <Info className="h-4 w-4" aria-hidden="true" />
                <span>Details &amp; Trailer</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  toggleFavorite({
                    key: favKey,
                    source: 'tmdb',
                    id: current.id,
                    mediaType: current.mediaType,
                    title: current.title,
                    overview: current.overview,
                    poster: posterUrl,
                    backdrop: current.backdropPath,
                    year,
                    rating: current.voteAverage,
                    categoryLabel: current.categoryLabel,
                    language: current.originalLanguage,
                  })
                }
                className={`flex min-h-[44px] items-center gap-2 whitespace-nowrap rounded-xl border px-5 py-2.5 text-sm font-semibold backdrop-blur-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${
                  favored
                    ? 'border-purple-500/60 bg-purple-600/20 text-white'
                    : 'border-zinc-700 bg-zinc-900/75 text-zinc-100 hover:border-zinc-600 hover:bg-zinc-900'
                }`}
              >
                {favored ? (
                  <>
                    <Check className="h-4 w-4 text-purple-400" aria-hidden="true" />
                    <span>In Favorites</span>
                  </>
                ) : (
                  <>
                    <Heart className="h-4 w-4" aria-hidden="true" />
                    <span>Add to Favorites</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {featuredItems.length > 1 && (
            <div className="mt-6 flex items-center gap-2">
              {featuredItems.slice(0, 6).map((item, idx) => (
                <button
                  key={`${item.mediaType}-${item.id}`}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  aria-label={`Show spotlight ${idx + 1}: ${item.title}`}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === safeIdx
                      ? 'w-8 bg-[#e50914]'
                      : 'w-2.5 bg-zinc-600 hover:bg-zinc-400'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
