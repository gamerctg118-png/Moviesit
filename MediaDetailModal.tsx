import {
  AlertCircle,
  Calendar,
  Check,
  Clock,
  Film,
  Heart,
  Play,
  Star,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useMoviesit } from '../context/MoviesitContext';
import {
  fetchMediaDetails,
  getBackdropUrl,
  getPosterUrl,
} from '../services/tmdb';
import type { TmdbMediaDetails } from '../types/media';
import { MediaCard } from './MediaCard';
import { PosterImage } from './PosterImage';

export function MediaDetailModal() {
  const {
    activeDetail,
    closeMediaDetails,
    isFavoriteKey,
    toggleFavorite,
  } = useMoviesit();

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [details, setDetails] = useState<TmdbMediaDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playingTrailerKey, setPlayingTrailerKey] = useState<string | null>(null);

  useEffect(() => {
    if (!activeDetail) {
      setDetails(null);
      setPlayingTrailerKey(null);
      return;
    }

    scrollRef.current?.scrollTo({ top: 0 });
    let cancelled = false;
    setLoading(true);
    setError(null);
    setPlayingTrailerKey(null);

    fetchMediaDetails(activeDetail.mediaType, activeDetail.id)
      .then((res) => {
        if (!cancelled) setDetails(res);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not load TMDB details.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMediaDetails();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      cancelled = true;
      window.removeEventListener('keydown', onKey);
    };
  }, [activeDetail, closeMediaDetails]);

  if (!activeDetail) return null;

  const favKey = `tmdb:${activeDetail.mediaType}:${activeDetail.id}`;
  const favored = isFavoriteKey(favKey);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-md sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Title details"
    >
      <div
        className="absolute inset-0"
        onClick={closeMediaDetails}
        aria-hidden="true"
      />

      <div className="relative z-10 flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-3xl border border-zinc-800 bg-[#0d0d11] shadow-2xl sm:rounded-2xl">
        <button
          type="button"
          onClick={closeMediaDetails}
          aria-label="Close details"
          className="absolute right-4 top-4 z-30 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-black/70 text-zinc-200 backdrop-blur-md transition-colors hover:bg-black hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e50914]"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <div ref={scrollRef} className="overflow-y-auto">
          {loading ? (
            <div className="p-8 sm:p-10">
              <div className="h-56 w-full animate-pulse rounded-xl bg-zinc-900" />
              <div className="mt-6 h-8 w-2/3 animate-pulse rounded bg-zinc-900" />
              <div className="mt-3 h-4 w-full animate-pulse rounded bg-zinc-900" />
              <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-zinc-900" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <AlertCircle className="mb-3 h-10 w-10 text-[#e50914]" aria-hidden="true" />
              <p className="text-base font-semibold text-white">Unable to load details</p>
              <p className="mt-1 text-sm text-zinc-400">{error}</p>
            </div>
          ) : details ? (
            <>
              {/* Backdrop / Trailer Header */}
              <div className="relative aspect-video max-h-[340px] w-full overflow-hidden bg-zinc-950">
                {playingTrailerKey ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${playingTrailerKey}?autoplay=1&rel=0`}
                    title={`${details.title} Official Trailer`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full border-0"
                  />
                ) : (
                  <>
                    <PosterImage
                      src={getBackdropUrl(details.backdropPath, 'w1280')}
                      alt={details.title}
                      aspect="backdrop"
                      className="h-full w-full"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d11] via-[#0d0d11]/40 to-transparent" />
                  </>
                )}
              </div>

              <div className="relative px-6 pb-8 pt-2 sm:px-8">
                <div className="flex flex-col gap-6 sm:flex-row">
                  <div className="-mt-16 hidden w-36 shrink-0 overflow-hidden rounded-xl border border-zinc-800 shadow-2xl sm:block">
                    <PosterImage
                      src={getPosterUrl(details.posterPath, 'w500')}
                      alt={details.title}
                      fallbackTitle={details.title}
                      className="aspect-[2/3] w-full"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 text-xs font-medium text-zinc-400 tabular-nums">
                      <span className="font-semibold text-purple-400">
                        {details.categoryLabel}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                        {details.releaseDate || 'TBA'}
                      </span>
                      {details.runtime ? (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                            {details.runtime} min
                          </span>
                        </>
                      ) : details.numberOfSeasons ? (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>
                            {details.numberOfSeasons}{' '}
                            {details.numberOfSeasons === 1 ? 'Season' : 'Seasons'}
                          </span>
                        </>
                      ) : null}
                      {details.voteAverage > 0 && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="inline-flex items-center gap-1 text-zinc-100">
                            <Star
                              className="h-3.5 w-3.5 fill-[#e50914] text-[#e50914]"
                              aria-hidden="true"
                            />
                            {details.voteAverage.toFixed(1)}
                          </span>
                        </>
                      )}
                    </p>

                    <h2 className="mt-1.5 font-display text-2xl font-bold text-white [text-wrap:balance] sm:text-3xl">
                      {details.title}
                    </h2>

                    {details.tagline && (
                      <p className="mt-1 text-sm italic text-zinc-400">{details.tagline}</p>
                    )}

                    {details.genres.length > 0 && (
                      <p className="mt-2.5 text-xs text-zinc-400">
                        {details.genres.map((g) => g.name).join(' · ')}
                      </p>
                    )}

                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      {details.trailers.length > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            setPlayingTrailerKey(
                              playingTrailerKey ? null : details.trailers[0].key,
                            )
                          }
                          className="flex min-h-[44px] items-center gap-2 whitespace-nowrap rounded-xl bg-[#e50914] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#c80812]"
                        >
                          <Play className="h-4 w-4 fill-current" aria-hidden="true" />
                          <span>
                            {playingTrailerKey ? 'Hide Trailer' : 'Watch Official Trailer'}
                          </span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          toggleFavorite({
                            key: favKey,
                            source: 'tmdb',
                            id: details.id,
                            mediaType: details.mediaType,
                            title: details.title,
                            overview: details.overview,
                            poster: getPosterUrl(details.posterPath, 'w500'),
                            backdrop: details.backdropPath,
                            year: details.releaseDate ? details.releaseDate.slice(0, 4) : 'TBA',
                            rating: details.voteAverage,
                            categoryLabel: details.categoryLabel,
                            language: details.originalLanguage,
                          })
                        }
                        className={`flex min-h-[44px] items-center gap-2 whitespace-nowrap rounded-xl border px-5 text-sm font-semibold transition-colors ${
                          favored
                            ? 'border-purple-500/60 bg-purple-600/20 text-white'
                            : 'border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800'
                        }`}
                      >
                        {favored ? (
                          <>
                            <Check className="h-4 w-4 text-purple-400" aria-hidden="true" />
                            <span>Saved in Favorites</span>
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
                </div>

                {details.overview && (
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-zinc-200">Synopsis</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-zinc-300">
                      {details.overview}
                    </p>
                  </div>
                )}

                <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-zinc-800/80 bg-zinc-950/80 p-3.5 text-xs text-zinc-400">
                  <Film className="mt-0.5 h-4 w-4 shrink-0 text-purple-400" aria-hidden="true" />
                  <span>
                    TMDB provides official metadata, cast details, ratings, and trailer embeds
                    only—never full movie video files. To stream personal MP4 files, add your own
                    videos in <strong className="text-zinc-200">My Videos</strong>.
                  </span>
                </div>

                {details.cast.length > 0 && (
                  <div className="mt-6">
                    <h3 className="mb-3 text-sm font-semibold text-zinc-200">Cast</h3>
                    <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-2">
                      {details.cast.map((person) => (
                        <div key={person.id} className="w-24 shrink-0">
                          <PosterImage
                            src={getPosterUrl(person.profilePath, 'w342')}
                            alt={person.name}
                            fallbackTitle={person.name}
                            className="aspect-[2/3] w-full rounded-lg border border-zinc-800"
                          />
                          <p className="mt-1.5 truncate text-xs font-medium text-zinc-200">
                            {person.name}
                          </p>
                          {person.character && (
                            <p className="truncate text-[11px] text-zinc-500">
                              {person.character}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {details.recommendations.length > 0 && (
                  <div className="mt-8 border-t border-zinc-800/80 pt-6">
                    <h3 className="mb-3 font-display text-base font-semibold text-white">
                      More in Curated Categories
                    </h3>
                    <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
                      {details.recommendations.slice(0, 8).map((rec) => (
                        <MediaCard key={`${rec.mediaType}-${rec.id}`} item={rec} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
