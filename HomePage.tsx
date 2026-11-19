import { AlertCircle, ChevronRight, Play, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { HeroBanner } from '../components/HeroBanner';
import { MediaRail } from '../components/MediaRail';
import { PosterImage } from '../components/PosterImage';
import { ALLOWED_CATEGORIES } from '../constants/categories';
import { useMoviesit } from '../context/MoviesitContext';
import { getOfflineDownload } from '../services/offlineDb';
import { removeWatchHistoryItem } from '../services/storage';
import { fetchHomeFeeds } from '../services/tmdb';
import { fetchPersonalVideosJson } from '../services/videosJson';
import type { CategoryDefinition, PersonalVideo, TmdbMediaItem, WatchHistoryEntry } from '../types/media';

interface HomeFeedsState {
  trendingMovies: TmdbMediaItem[];
  popularMovies: TmdbMediaItem[];
  topRatedMovies: TmdbMediaItem[];
  upcomingMovies: TmdbMediaItem[];
  trendingSeries: TmdbMediaItem[];
  popularSeries: TmdbMediaItem[];
}

export function HomePage() {
  const {
    tmdbConfigured,
    tmdbRevision,
    navigate,
    watchHistory,
    playPersonalVideo,
    openPlayer,
  } = useMoviesit();

  const [feeds, setFeeds] = useState<HomeFeedsState>({
    trendingMovies: [],
    popularMovies: [],
    topRatedMovies: [],
    upcomingMovies: [],
    trendingSeries: [],
    popularSeries: [],
  });
  const [personalVideos, setPersonalVideos] = useState<PersonalVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPersonalVideosJson().then((res) => setPersonalVideos(res.videos));
  }, []);

  useEffect(() => {
    if (!tmdbConfigured) {
      setFeeds({
        trendingMovies: [],
        popularMovies: [],
        topRatedMovies: [],
        upcomingMovies: [],
        trendingSeries: [],
        popularSeries: [],
      });
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchHomeFeeds()
      .then((res) => {
        if (!cancelled) setFeeds(res);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load TMDB feeds.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tmdbConfigured, tmdbRevision]);

  const handleCategoryJump = (cat: CategoryDefinition) => {
    if (cat.group === 'anime') {
      navigate('anime', cat.id);
    } else if (cat.mediaType === 'tv') {
      navigate('tv-series', cat.id);
    } else {
      navigate('movies', cat.id);
    }
  };

  const handleResumeHistory = async (entry: WatchHistoryEntry) => {
    if (entry.source === 'offline-db' || entry.source === 'local-device') {
      const offline = await getOfflineDownload(entry.id).catch(() => null);
      if (offline) {
        const blobUrl = URL.createObjectURL(offline.blob);
        openPlayer({
          id: offline.id,
          title: offline.title,
          description: offline.description,
          poster: offline.poster,
          videoUrl: blobUrl,
          type: offline.type,
          language: offline.language,
          category: offline.category,
          year: offline.year,
          source: 'offline-db',
          startAtSeconds: entry.positionSeconds,
        });
        return;
      }
    }

    if (entry.videoUrl) {
      openPlayer({
        id: entry.id,
        title: entry.title,
        description: entry.description,
        poster: entry.poster,
        videoUrl: entry.videoUrl,
        type: entry.type,
        language: entry.language,
        category: entry.category,
        year: entry.year,
        source: 'videos-json',
        startAtSeconds: entry.positionSeconds,
      });
    } else {
      navigate('my-videos');
    }
  };

  const featuredSpotlight = [
    ...feeds.trendingMovies.slice(0, 4),
    ...feeds.trendingSeries.slice(0, 2),
  ];

  return (
    <div className="space-y-8 pb-8">
      <HeroBanner featuredItems={featuredSpotlight} tmdbConfigured={tmdbConfigured} />

      {/* Strictly the 8 Allowed Categories */}
      <section aria-label="Curated Categories">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold tracking-tight text-white">
            Browse by Category
          </h2>
          <span className="text-xs text-zinc-500">8 curated collections</span>
        </div>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8">
          {ALLOWED_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryJump(cat)}
              className="group flex min-h-[56px] flex-col justify-between rounded-xl border border-zinc-800/80 bg-[#111115] p-3 text-left transition-all hover:border-purple-500/50 hover:bg-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e50914]"
            >
              <span className="text-xs font-medium text-zinc-400">
                {cat.mediaType === 'movie' ? 'Film' : 'Series'} · {cat.languageName}
              </span>
              <span className="mt-1 flex items-center justify-between gap-1 text-sm font-semibold text-zinc-100 group-hover:text-white">
                <span className="truncate">{cat.label}</span>
                <ChevronRight
                  className="h-3.5 w-3.5 shrink-0 text-zinc-500 transition-transform group-hover:translate-x-0.5 group-hover:text-[#e50914]"
                  aria-hidden="true"
                />
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Continue Watching (LocalStorage Watch History) */}
      {watchHistory.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold tracking-tight text-white">
              Continue Watching
            </h2>
            <span className="text-xs text-zinc-400">Saved on device</span>
          </div>
          <div className="scrollbar-hide -mx-4 flex gap-3.5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
            {watchHistory.slice(0, 8).map((entry) => {
              const pct =
                entry.durationSeconds > 0
                  ? Math.min(100, Math.round((entry.positionSeconds / entry.durationSeconds) * 100))
                  : 0;
              return (
                <div
                  key={entry.id}
                  className="group relative w-60 shrink-0 overflow-hidden rounded-xl border border-zinc-800 bg-[#111115]"
                >
                  <button
                    type="button"
                    onClick={() => handleResumeHistory(entry)}
                    className="block w-full text-left focus:outline-none"
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-zinc-950">
                      <PosterImage
                        src={entry.poster}
                        alt={entry.title}
                        aspect="backdrop"
                        className="h-full w-full"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/35 opacity-90 transition-opacity group-hover:bg-black/50">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e50914] text-white shadow-lg">
                          <Play className="h-4 w-4 fill-current" aria-hidden="true" />
                        </span>
                      </div>
                      <div className="absolute inset-x-0 bottom-0 h-1 bg-zinc-800">
                        <div
                          className="h-full bg-gradient-to-r from-[#e50914] to-purple-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <div className="p-3 pr-10">
                      <p className="truncate text-sm font-semibold text-white">
                        {entry.title}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-zinc-400 tabular-nums">
                        {pct}% watched · {entry.category}
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeWatchHistoryItem(entry.id)}
                    aria-label={`Remove ${entry.title} from watch history`}
                    className="absolute bottom-2.5 right-2 flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Personal Videos Preview if populated */}
      {personalVideos.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold tracking-tight text-white">
                From My Videos
              </h2>
              <p className="text-xs text-zinc-400">Loaded from /videos.json</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('my-videos')}
              className="min-h-[40px] rounded-lg px-3 text-xs font-semibold text-zinc-300 hover:bg-zinc-900 hover:text-white"
            >
              Open Library
            </button>
          </div>
          <div className="scrollbar-hide -mx-4 flex gap-3.5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
            {personalVideos.slice(0, 8).map((vid) => (
              <button
                key={vid.id}
                type="button"
                onClick={() => playPersonalVideo(vid)}
                className="group w-[148px] shrink-0 text-left sm:w-[172px]"
              >
                <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 transition-transform duration-200 group-hover:-translate-y-1 group-hover:border-purple-500/60">
                  <PosterImage
                    src={vid.poster}
                    alt={vid.title}
                    fallbackTitle={vid.title}
                    className="h-full w-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e50914] text-white shadow-lg">
                      <Play className="h-5 w-5 fill-current" aria-hidden="true" />
                    </span>
                  </div>
                </div>
                <p className="mt-2 truncate text-sm font-semibold text-white">{vid.title}</p>
                <p className="truncate text-xs text-zinc-400 tabular-nums">
                  {vid.year || 'Personal'} · {vid.category}
                </p>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* TMDB Error State */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-[#e50914]/40 bg-[#e50914]/10 p-4 text-sm text-zinc-200">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#ff4757]" aria-hidden="true" />
          <div>
            <p className="font-semibold text-white">TMDB API error</p>
            <p className="mt-0.5 text-zinc-300">{error}</p>
          </div>
        </div>
      )}

      {/* TMDB Automatic Feeds */}
      {tmdbConfigured && (
        <div className="space-y-9">
          <MediaRail
            title="Trending Movies"
            subtitle="Weekly trending across Hindi, Malayalam, Tamil, Telugu, Korean & Anime"
            items={feeds.trendingMovies}
            loading={loading}
            onSeeAll={() => navigate('movies')}
          />

          <MediaRail
            title="Popular Movies"
            subtitle="Most watched titles in your curated regional & anime categories"
            items={feeds.popularMovies}
            loading={loading}
            onSeeAll={() => navigate('movies')}
          />

          <MediaRail
            title="Trending TV Series"
            subtitle="Korean dramas and Anime series trending this week"
            items={feeds.trendingSeries}
            loading={loading}
            onSeeAll={() => navigate('tv-series')}
          />

          <MediaRail
            title="Top-Rated Movies"
            subtitle="Highest rated films by TMDB audience score"
            items={feeds.topRatedMovies}
            loading={loading}
            onSeeAll={() => navigate('movies')}
          />

          <MediaRail
            title="Popular TV Series"
            subtitle="Korean Series & Anime Series favorites"
            items={feeds.popularSeries}
            loading={loading}
            onSeeAll={() => navigate('tv-series')}
          />

          <MediaRail
            title="Upcoming Movies"
            subtitle="Upcoming releases in Hindi, South Indian, Korean & Anime cinema"
            items={feeds.upcomingMovies}
            loading={loading}
            onSeeAll={() => navigate('movies')}
          />
        </div>
      )}
    </div>
  );
}
