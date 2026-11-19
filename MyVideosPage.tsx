import {
  Check,
  Code2,
  Copy,
  Download,
  FileVideo,
  Heart,
  Play,
  Plus,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { PosterImage } from '../components/PosterImage';
import { ALLOWED_CATEGORIES } from '../constants/categories';
import { useMoviesit } from '../context/MoviesitContext';
import {
  type StoredLocalVideo,
  deleteLocalDeviceVideo,
  downloadPersonalVideoOffline,
  formatBytes,
  listLocalDeviceVideos,
  listOfflineDownloads,
  saveLocalDeviceVideo,
} from '../services/offlineDb';
import { fetchPersonalVideosJson } from '../services/videosJson';
import type { PersonalVideo } from '../types/media';

const VAULT_ART = '/src/assets/images/moviesit_personal_vault_1795116699507.jpg';

export function MyVideosPage() {
  const { playPersonalVideo, openPlayer, isFavoriteKey, toggleFavorite } = useMoviesit();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [jsonVideos, setJsonVideos] = useState<PersonalVideo[]>([]);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [localVideos, setLocalVideos] = useState<StoredLocalVideo[]>([]);
  const [downloadedIds, setDownloadedIds] = useState<Set<string>>(new Set());
  const [downloadProgress, setDownloadProgress] = useState<Record<string, string>>({});
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showBuilder, setShowBuilder] = useState(false);

  // JSON Builder form state
  const [bId, setBId] = useState('my-video-01');
  const [bTitle, setBTitle] = useState('');
  const [bDesc, setBDesc] = useState('');
  const [bPoster, setBPoster] = useState('');
  const [bUrl, setBUrl] = useState('');
  const [bType, setBType] = useState('movie');
  const [bLang, setBLang] = useState('ml');
  const [bCat, setBCat] = useState('Malayalam Movies');
  const [bYear, setBYear] = useState('2025');
  const [copied, setCopied] = useState(false);

  const loadAll = async () => {
    const [jsonRes, localRes, offlineRes] = await Promise.all([
      fetchPersonalVideosJson(),
      listLocalDeviceVideos().catch(() => [] as StoredLocalVideo[]),
      listOfflineDownloads().catch(() => []),
    ]);
    setJsonVideos(jsonRes.videos);
    setJsonError(jsonRes.error);
    setLocalVideos(localRes);
    setDownloadedIds(new Set(offlineRes.map((o) => o.id)));
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleDownloadOffline = async (video: PersonalVideo) => {
    setActionMessage(null);
    setDownloadProgress((p) => ({ ...p, [video.id]: 'Starting...' }));
    try {
      await downloadPersonalVideoOffline(video, (loaded, total) => {
        const label = total
          ? `${Math.round((loaded / total) * 100)}%`
          : formatBytes(loaded);
        setDownloadProgress((p) => ({ ...p, [video.id]: label }));
      });
      setDownloadedIds((prev) => new Set(prev).add(video.id));
      setActionMessage(`Saved "${video.title}" to My Downloads for offline playback.`);
    } catch (err) {
      setActionMessage(
        err instanceof Error
          ? `Could not download "${video.title}": ${err.message}`
          : 'Download failed (check CORS headers on your video server).',
      );
    } finally {
      setDownloadProgress((p) => {
        const copy = { ...p };
        delete copy[video.id];
        return copy;
      });
    }
  };

  const handlePickLocalFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setActionMessage(null);

    const id = `local-${Date.now()}`;
    const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ');
    const entry: StoredLocalVideo = {
      id,
      title: cleanTitle,
      description: `Local video file (${formatBytes(file.size)}) stored in IndexedDB.`,
      poster: '',
      type: 'movie',
      language: 'en',
      category: 'Personal Device',
      year: new Date().getFullYear(),
      mimeType: file.type || 'video/mp4',
      sizeBytes: file.size,
      addedAt: Date.now(),
      blob: file,
    };

    try {
      await saveLocalDeviceVideo(entry);
      setLocalVideos(await listLocalDeviceVideos());
      setActionMessage(`Added "${cleanTitle}" to your device library.`);
    } catch (err) {
      setActionMessage(
        err instanceof Error ? err.message : 'Failed to store local video file.',
      );
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handlePlayLocal = (vid: StoredLocalVideo) => {
    const url = URL.createObjectURL(vid.blob);
    openPlayer({
      id: vid.id,
      title: vid.title,
      description: vid.description,
      poster: vid.poster,
      videoUrl: url,
      type: vid.type,
      language: vid.language,
      category: vid.category,
      year: vid.year,
      source: 'local-device',
    });
  };

  const handleDeleteLocal = async (id: string) => {
    await deleteLocalDeviceVideo(id);
    setLocalVideos(await listLocalDeviceVideos());
  };

  const allCategories = Array.from(
    new Set(jsonVideos.map((v) => v.category).filter(Boolean)),
  );

  const visibleJsonVideos =
    categoryFilter === 'all'
      ? jsonVideos
      : jsonVideos.filter((v) => v.category === categoryFilter);

  const generatedSnippet = JSON.stringify(
    {
      id: bId.trim() || 'my-video-01',
      title: bTitle.trim() || 'My Personal Film',
      description: bDesc.trim() || 'Owned or permitted MP4 stream.',
      poster: bPoster.trim() || '/posters/my-video.jpg',
      videoUrl: bUrl.trim() || 'https://your-server.example.com/video.mp4',
      type: bType,
      language: bLang,
      category: bCat,
      year: Number(bYear) || bYear,
    },
    null,
    2,
  );

  const handleCopySnippet = async () => {
    try {
      await navigator.clipboard.writeText(generatedSnippet);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-[#111115]">
        <div className="relative flex flex-col justify-between gap-6 p-6 sm:flex-row sm:items-end sm:p-8">
          <img
            src={VAULT_ART}
            alt="Personal film archive"
            referrerPolicy="no-referrer"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-30"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#09090b] via-[#09090b]/85 to-[#09090b]/60" />

          <div className="relative z-10 max-w-xl">
            <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
              My Videos
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-zinc-300">
              Stream your personal MP4 library directly from{' '}
              <code className="font-mono text-purple-300">/public/videos.json</code> or load local
              video files from your device into IndexedDB.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-2.5">
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/webm,video/*"
              onChange={handlePickLocalFile}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex min-h-[44px] items-center gap-2 whitespace-nowrap rounded-xl bg-[#e50914] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#c80812]"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Add Local MP4</span>
            </button>
            <button
              type="button"
              onClick={() => setShowBuilder((v) => !v)}
              className="flex min-h-[44px] items-center gap-2 whitespace-nowrap rounded-xl border border-zinc-700 bg-zinc-900/90 px-4 text-sm font-semibold text-zinc-100 hover:bg-zinc-800"
            >
              <Code2 className="h-4 w-4 text-purple-400" aria-hidden="true" />
              <span>{showBuilder ? 'Hide JSON Builder' : 'videos.json Builder'}</span>
            </button>
            <button
              type="button"
              onClick={loadAll}
              aria-label="Reload /videos.json"
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900/90 text-zinc-200 hover:bg-zinc-800"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      {actionMessage && (
        <div className="rounded-xl border border-purple-500/40 bg-purple-600/10 px-4 py-3 text-sm text-zinc-100">
          {actionMessage}
        </div>
      )}

      {jsonError && (
        <div className="rounded-xl border border-[#e50914]/40 bg-[#e50914]/10 px-4 py-3 text-sm text-zinc-200">
          {jsonError}
        </div>
      )}

      {/* Interactive videos.json Entry Builder */}
      {showBuilder && (
        <section className="rounded-2xl border border-zinc-800 bg-[#111115] p-6">
          <h2 className="font-display text-lg font-semibold text-white">
            Create a /public/videos.json Entry
          </h2>
          <p className="mt-1 text-xs text-zinc-400">
            Fill in your owned video details below, copy the generated JSON object, and paste it
            inside the array in <code className="font-mono text-zinc-200">public/videos.json</code>.
          </p>

          <div className="mt-5 grid gap-6 lg:grid-cols-2">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-medium text-zinc-400">id</span>
                <input
                  type="text"
                  value={bId}
                  onChange={(e) => setBId(e.target.value)}
                  className="mt-1 h-10 w-full rounded-lg border border-zinc-800 bg-black/60 px-3 text-sm text-white focus:border-purple-500 focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-zinc-400">title</span>
                <input
                  type="text"
                  value={bTitle}
                  onChange={(e) => setBTitle(e.target.value)}
                  placeholder="My Short Film"
                  className="mt-1 h-10 w-full rounded-lg border border-zinc-800 bg-black/60 px-3 text-sm text-white focus:border-purple-500 focus:outline-none"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-xs font-medium text-zinc-400">videoUrl (direct MP4)</span>
                <input
                  type="url"
                  value={bUrl}
                  onChange={(e) => setBUrl(e.target.value)}
                  placeholder="https://your-host.example.com/film.mp4"
                  className="mt-1 h-10 w-full rounded-lg border border-zinc-800 bg-black/60 px-3 text-sm text-white focus:border-purple-500 focus:outline-none"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-xs font-medium text-zinc-400">poster (URL or /path)</span>
                <input
                  type="text"
                  value={bPoster}
                  onChange={(e) => setBPoster(e.target.value)}
                  placeholder="/posters/film.jpg"
                  className="mt-1 h-10 w-full rounded-lg border border-zinc-800 bg-black/60 px-3 text-sm text-white focus:border-purple-500 focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-zinc-400">category</span>
                <select
                  value={bCat}
                  onChange={(e) => setBCat(e.target.value)}
                  className="mt-1 h-10 w-full rounded-lg border border-zinc-800 bg-black/60 px-3 text-sm text-white focus:border-purple-500 focus:outline-none"
                >
                  {ALLOWED_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.label}>
                      {c.label}
                    </option>
                  ))}
                  <option value="Personal">Personal</option>
                </select>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <label className="block">
                  <span className="text-xs font-medium text-zinc-400">type</span>
                  <select
                    value={bType}
                    onChange={(e) => setBType(e.target.value)}
                    className="mt-1 h-10 w-full rounded-lg border border-zinc-800 bg-black/60 px-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="movie">movie</option>
                    <option value="series">series</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-zinc-400">language</span>
                  <input
                    type="text"
                    value={bLang}
                    onChange={(e) => setBLang(e.target.value)}
                    className="mt-1 h-10 w-full rounded-lg border border-zinc-800 bg-black/60 px-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-zinc-400">year</span>
                  <input
                    type="text"
                    value={bYear}
                    onChange={(e) => setBYear(e.target.value)}
                    className="mt-1 h-10 w-full rounded-lg border border-zinc-800 bg-black/60 px-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                  />
                </label>
              </div>
              <label className="block sm:col-span-2">
                <span className="text-xs font-medium text-zinc-400">description</span>
                <textarea
                  rows={2}
                  value={bDesc}
                  onChange={(e) => setBDesc(e.target.value)}
                  placeholder="Short description of your video..."
                  className="mt-1 w-full rounded-lg border border-zinc-800 bg-black/60 p-3 text-sm text-white focus:border-purple-500 focus:outline-none"
                />
              </label>
            </div>

            <div className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-black/70 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-mono text-xs text-zinc-400">/public/videos.json</span>
                <button
                  type="button"
                  onClick={handleCopySnippet}
                  className="flex min-h-[36px] items-center gap-1.5 rounded-lg bg-zinc-900 px-3 text-xs font-semibold text-zinc-200 hover:bg-zinc-800"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-purple-400" aria-hidden="true" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Copy JSON</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-zinc-300">
                {`[\n${generatedSnippet
                  .split('\n')
                  .map((line) => `  ${line}`)
                  .join('\n')}\n]`}
              </pre>
            </div>
          </div>
        </section>
      )}

      {/* /videos.json Section */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold text-white">
              Catalog from /videos.json
            </h2>
            <p className="text-xs text-zinc-400">
              {jsonVideos.length} {jsonVideos.length === 1 ? 'video' : 'videos'} loaded
            </p>
          </div>

          {allCategories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCategoryFilter('all')}
                className={`min-h-[36px] rounded-lg border px-3 text-xs font-semibold ${
                  categoryFilter === 'all'
                    ? 'border-purple-500/60 bg-purple-600/20 text-white'
                    : 'border-zinc-800 bg-[#111115] text-zinc-400'
                }`}
              >
                All
              </button>
              {allCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`min-h-[36px] rounded-lg border px-3 text-xs font-semibold ${
                    categoryFilter === cat
                      ? 'border-purple-500/60 bg-purple-600/20 text-white'
                      : 'border-zinc-800 bg-[#111115] text-zinc-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {visibleJsonVideos.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800/80 bg-[#111115] p-8 text-center">
            <FileVideo className="mx-auto mb-3 h-9 w-9 text-zinc-600" aria-hidden="true" />
            <p className="font-display text-lg font-semibold text-white">
              Your /videos.json library is empty
            </p>
            <p className="mx-auto mt-1 max-w-lg text-sm text-zinc-400">
              Edit <code className="font-mono text-zinc-200">public/videos.json</code> with your
              own direct MP4 links, or click <strong className="text-zinc-200">Add Local MP4</strong>{' '}
              above to play local video files directly from your device.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleJsonVideos.map((vid) => {
              const favKey = `personal:${vid.id}`;
              const favored = isFavoriteKey(favKey);
              const isOffline = downloadedIds.has(vid.id);
              const progressLabel = downloadProgress[vid.id];

              return (
                <article
                  key={vid.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-[#111115]"
                >
                  <div className="relative aspect-video w-full bg-zinc-950">
                    <PosterImage
                      src={vid.poster}
                      alt={vid.title}
                      aspect="backdrop"
                      className="h-full w-full"
                    />
                    <button
                      type="button"
                      onClick={() => playPersonalVideo(vid)}
                      aria-label={`Play ${vid.title}`}
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
                        {vid.category} · {vid.language.toUpperCase()} · {vid.year || vid.type}
                      </p>
                      <h3 className="mt-1 font-display text-base font-semibold text-white">
                        {vid.title}
                      </h3>
                      {vid.description && (
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-400">
                          {vid.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-zinc-800/80 pt-3">
                      <button
                        type="button"
                        onClick={() => playPersonalVideo(vid)}
                        className="flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#e50914] px-3 text-xs font-semibold text-white hover:bg-[#c80812]"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                        <span>Play</span>
                      </button>

                      <button
                        type="button"
                        disabled={Boolean(progressLabel)}
                        onClick={() => handleDownloadOffline(vid)}
                        title="Download owned video for offline viewing"
                        className={`flex min-h-[40px] items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition-colors ${
                          isOffline
                            ? 'border-purple-500/50 bg-purple-600/20 text-purple-200'
                            : 'border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800'
                        }`}
                      >
                        <Download className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>
                          {progressLabel
                            ? progressLabel
                            : isOffline
                              ? 'Saved Offline'
                              : 'Save Offline'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          toggleFavorite({
                            key: favKey,
                            source: 'personal',
                            id: vid.id,
                            mediaType: 'personal',
                            title: vid.title,
                            overview: vid.description,
                            poster: vid.poster || null,
                            year: String(vid.year || 'Personal'),
                            categoryLabel: vid.category,
                            language: vid.language,
                            videoUrl: vid.videoUrl,
                          })
                        }
                        aria-label={favored ? 'Remove favorite' : 'Add favorite'}
                        className={`flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl border ${
                          favored
                            ? 'border-[#e50914]/60 bg-[#e50914]/15 text-[#ff4757]'
                            : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white'
                        }`}
                      >
                        <Heart
                          className={`h-4 w-4 ${favored ? 'fill-current' : ''}`}
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Local Device MP4s stored in IndexedDB */}
      {localVideos.length > 0 && (
        <section className="space-y-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-white">
              Local Device Videos (IndexedDB)
            </h2>
            <p className="text-xs text-zinc-400">
              Stored locally in your browser/app for instant offline HTML5 playback.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {localVideos.map((vid) => (
              <div
                key={vid.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-[#111115] p-4"
              >
                <button
                  type="button"
                  onClick={() => handlePlayLocal(vid)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#e50914] to-purple-600 text-white">
                    <Play className="h-5 w-5 fill-current" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{vid.title}</p>
                    <p className="truncate text-xs text-zinc-400 tabular-nums">
                      {formatBytes(vid.sizeBytes)} · {vid.mimeType}
                    </p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteLocal(vid.id)}
                  aria-label={`Delete ${vid.title}`}
                  className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-900 hover:text-[#ff4757]"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
