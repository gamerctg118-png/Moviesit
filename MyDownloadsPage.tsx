import { HardDrive, Play, ShieldCheck, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PosterImage } from '../components/PosterImage';
import { useMoviesit } from '../context/MoviesitContext';
import {
  clearOfflineDownloads,
  deleteOfflineDownload,
  formatBytes,
  getStorageQuotaSummary,
  listOfflineDownloads,
} from '../services/offlineDb';
import type { OfflineDownloadEntry } from '../types/media';

const OFFLINE_VAULT_ART = '/src/assets/images/moviesit_offline_vault_1795116699114.jpg';

export function MyDownloadsPage() {
  const { openPlayer, navigate } = useMoviesit();
  const [downloads, setDownloads] = useState<OfflineDownloadEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [quota, setQuota] = useState({ usageBytes: 0, quotaBytes: 0 });

  const refresh = async () => {
    setLoading(true);
    try {
      const [items, storageInfo] = await Promise.all([
        listOfflineDownloads(),
        getStorageQuotaSummary(),
      ]);
      setDownloads(items);
      setQuota(storageInfo);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const handlePlayOffline = (entry: OfflineDownloadEntry) => {
    const blobUrl = URL.createObjectURL(entry.blob);
    openPlayer({
      id: entry.id,
      title: entry.title,
      description: entry.description,
      poster: entry.poster,
      videoUrl: blobUrl,
      type: entry.type,
      language: entry.language,
      category: entry.category,
      year: entry.year,
      source: 'offline-db',
    });
  };

  const handleDelete = async (id: string) => {
    await deleteOfflineDownload(id);
    await refresh();
  };

  const handleClearAll = async () => {
    await clearOfflineDownloads();
    await refresh();
  };

  const totalOfflineBytes = downloads.reduce((sum, d) => sum + (d.sizeBytes || 0), 0);

  return (
    <div className="space-y-6 pb-10">
      {/* Banner */}
      <section className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-[#111115]">
        <div className="relative flex flex-col justify-between gap-6 p-6 sm:flex-row sm:items-end sm:p-8">
          <img
            src={OFFLINE_VAULT_ART}
            alt="Offline storage vault"
            referrerPolicy="no-referrer"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-35"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#09090b] via-[#09090b]/85 to-[#09090b]/60" />

          <div className="relative z-10 max-w-xl">
            <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
              My Downloads
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-zinc-300">
              Videos saved to IndexedDB for offline HTML5 playback without an internet connection.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-3">
            <div className="rounded-xl border border-zinc-800 bg-black/70 px-4 py-2.5 text-right backdrop-blur-md">
              <p className="text-[11px] font-medium text-zinc-400">Offline Vault Used</p>
              <p className="font-mono text-sm font-semibold text-white tabular-nums">
                {formatBytes(totalOfflineBytes)}
                {quota.quotaBytes > 0 ? ` / ${formatBytes(quota.quotaBytes)}` : ''}
              </p>
            </div>
            {downloads.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="flex min-h-[44px] items-center gap-1.5 whitespace-nowrap rounded-xl border border-zinc-700 bg-zinc-900/90 px-4 text-xs font-semibold text-zinc-200 hover:border-[#e50914]/50 hover:text-white"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Ownership & Permission Notice */}
      <div className="flex items-start gap-3 rounded-xl border border-zinc-800/80 bg-[#111115] p-4 text-xs leading-relaxed text-zinc-400">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-purple-400" aria-hidden="true" />
        <span>
          Download only videos that you own or have explicit permission to distribute. TMDB does not
          provide downloadable movie video files; offline storage applies strictly to your personal{' '}
          <strong className="text-zinc-200">My Videos</strong> library.
        </span>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-2xl bg-zinc-900" />
          ))}
        </div>
      ) : downloads.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-[#111115] p-10 text-center">
          <HardDrive className="mx-auto mb-3 h-9 w-9 text-zinc-600" aria-hidden="true" />
          <p className="font-display text-lg font-semibold text-white">No offline downloads yet</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-zinc-400">
            Save any owned video from My Videos to watch offline on the web or Android.
          </p>
          <button
            type="button"
            onClick={() => navigate('my-videos')}
            className="mt-5 inline-flex min-h-[44px] items-center rounded-xl bg-[#e50914] px-5 text-sm font-semibold text-white hover:bg-[#c80812]"
          >
            Go to My Videos
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {downloads.map((entry) => (
            <article
              key={entry.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-[#111115]"
            >
              <div className="relative aspect-video w-full bg-zinc-950">
                <PosterImage
                  src={entry.poster}
                  alt={entry.title}
                  aspect="backdrop"
                  className="h-full w-full"
                />
                <button
                  type="button"
                  onClick={() => handlePlayOffline(entry)}
                  aria-label={`Play offline: ${entry.title}`}
                  className="absolute inset-0 flex items-center justify-center bg-black/35 transition-colors hover:bg-black/50"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e50914] text-white shadow-xl">
                    <Play className="h-5 w-5 fill-current" aria-hidden="true" />
                  </span>
                </button>
              </div>

              <div className="flex flex-1 flex-col justify-between p-4">
                <div>
                  <p className="text-xs font-medium text-purple-400 tabular-nums">
                    {entry.category} · {formatBytes(entry.sizeBytes)}
                  </p>
                  <h2 className="mt-1 font-display text-base font-semibold text-white">
                    {entry.title}
                  </h2>
                  {entry.description && (
                    <p className="mt-1 line-clamp-2 text-xs text-zinc-400">
                      {entry.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-2 border-t border-zinc-800/80 pt-3">
                  <button
                    type="button"
                    onClick={() => handlePlayOffline(entry)}
                    className="flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#e50914] px-3 text-xs font-semibold text-white hover:bg-[#c80812]"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                    <span>Play Offline</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(entry.id)}
                    aria-label={`Delete ${entry.title} from offline storage`}
                    className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-[#e50914]/60 hover:text-[#ff4757]"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
