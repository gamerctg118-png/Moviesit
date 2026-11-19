import {
  AlertCircle,
  Info,
  Maximize,
  Minimize,
  Pause,
  PictureInPicture2,
  Play,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useMoviesit } from '../context/MoviesitContext';
import { getWatchProgress, upsertWatchHistory } from '../services/storage';

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

export function VideoPlayerModal() {
  const { activePlayer, closePlayer, settings } = useMoviesit();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastSavedRef = useRef<number>(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedEnd, setBufferedEnd] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const [videoError, setVideoError] = useState<string | null>(null);

  useEffect(() => {
    if (!activePlayer) return;
    setVideoError(null);
    setCurrentTime(0);
    setDuration(0);
    setBufferedEnd(0);
    setIsPlaying(false);
    lastSavedRef.current = 0;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !document.fullscreenElement) {
        closePlayer();
      } else if (e.key === ' ' && document.activeElement?.tagName !== 'BUTTON') {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePlayer?.id, activePlayer?.videoUrl]);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  if (!activePlayer) return null;

  const saveProgress = (pos: number, dur: number) => {
    if (!activePlayer || !Number.isFinite(dur) || dur <= 0) return;
    upsertWatchHistory({
      id: activePlayer.id,
      title: activePlayer.title,
      poster: activePlayer.poster,
      videoUrl: activePlayer.source === 'videos-json' ? activePlayer.videoUrl : undefined,
      source: activePlayer.source,
      category: activePlayer.category,
      language: activePlayer.language,
      year: activePlayer.year,
      type: activePlayer.type,
      description: activePlayer.description,
      positionSeconds: pos,
      durationSeconds: dur,
    });
  };

  const handleLoadedMetadata = () => {
    const el = videoRef.current;
    if (!el) return;
    setDuration(el.duration || 0);

    let resumeTime = activePlayer.startAtSeconds ?? 0;
    if (resumeTime <= 0 && settings.autoResumePlayback) {
      const saved = getWatchProgress(activePlayer.id);
      if (saved && saved.positionSeconds > 5 && saved.positionSeconds < (el.duration || 0) - 10) {
        resumeTime = saved.positionSeconds;
      }
    }
    if (resumeTime > 0 && resumeTime < (el.duration || 0)) {
      el.currentTime = resumeTime;
      setCurrentTime(resumeTime);
    }

    el.play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  };

  const handleTimeUpdate = () => {
    const el = videoRef.current;
    if (!el) return;
    const pos = el.currentTime || 0;
    const dur = el.duration || 0;
    setCurrentTime(pos);
    if (el.buffered.length > 0) {
      setBufferedEnd(el.buffered.end(el.buffered.length - 1));
    }

    if (Math.abs(pos - lastSavedRef.current) >= 3) {
      lastSavedRef.current = pos;
      saveProgress(pos, dur);
    }
  };

  const togglePlay = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      el.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      el.pause();
      setIsPlaying(false);
      saveProgress(el.currentTime || 0, el.duration || 0);
    }
  };

  const seekBy = (delta: number) => {
    const el = videoRef.current;
    if (!el) return;
    const next = Math.min(Math.max(0, (el.currentTime || 0) + delta), el.duration || 0);
    el.currentTime = next;
    setCurrentTime(next);
  };

  const handleSeekInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const el = videoRef.current;
    if (!el) return;
    const next = Number(e.target.value);
    el.currentTime = next;
    setCurrentTime(next);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const el = videoRef.current;
    const val = Number(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    if (el) {
      el.volume = val;
      el.muted = val === 0;
    }
  };

  const toggleMute = () => {
    const el = videoRef.current;
    if (!el) return;
    const nextMuted = !isMuted;
    el.muted = nextMuted;
    setIsMuted(nextMuted);
    if (!nextMuted && volume === 0) {
      setVolume(0.75);
      el.volume = 0.75;
    }
  };

  const cyclePlaybackRate = () => {
    const rates = [0.75, 1, 1.25, 1.5, 2];
    const next = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    setPlaybackRate(next);
    if (videoRef.current) {
      videoRef.current.playbackRate = next;
    }
  };

  const togglePictureInPicture = async () => {
    const el = videoRef.current;
    if (!el || !document.pictureInPictureEnabled) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await el.requestPictureInPicture();
      }
    } catch {
      // ignore PiP errors
    }
  };

  const toggleFullscreen = async () => {
    const target = containerRef.current;
    if (!target) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await target.requestFullscreen();
      }
    } catch {
      // ignore fullscreen errors
    }
  };

  const progressPct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const bufferedPct = duration > 0 ? Math.min(100, (bufferedEnd / duration) * 100) : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-0 backdrop-blur-md sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Playing ${activePlayer.title}`}
    >
      <div className="flex h-full w-full max-w-6xl flex-col overflow-hidden bg-[#09090b] sm:h-auto sm:max-h-[92vh] sm:rounded-2xl sm:border sm:border-zinc-800">
        {/* Player Header */}
        <div className="flex items-center justify-between gap-4 border-b border-zinc-800/80 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <h2 className="truncate font-display text-base font-semibold text-white sm:text-lg">
              {activePlayer.title}
            </h2>
            <p className="truncate text-xs text-zinc-400">
              {activePlayer.category} · {activePlayer.language.toUpperCase()} · {activePlayer.year || 'Personal'}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setShowInfo((v) => !v)}
              aria-label="Toggle video details"
              className={`flex min-h-[40px] items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition-colors ${
                showInfo
                  ? 'bg-purple-600/20 text-purple-300 ring-1 ring-purple-500/40'
                  : 'bg-zinc-900 text-zinc-300 hover:text-white'
              }`}
            >
              <Info className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Info</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (videoRef.current) {
                  saveProgress(videoRef.current.currentTime || 0, videoRef.current.duration || 0);
                }
                closePlayer();
              }}
              aria-label="Close video player"
              className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Main Video Surface + Custom Controls */}
        <div className="flex-1 overflow-y-auto">
          <div
            ref={containerRef}
            className="relative flex aspect-video w-full flex-col justify-end bg-black"
          >
            <video
              ref={videoRef}
              src={activePlayer.videoUrl}
              poster={activePlayer.poster || undefined}
              playsInline
              onClick={togglePlay}
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => {
                setIsPlaying(false);
                saveProgress(duration, duration);
              }}
              onError={() =>
                setVideoError(
                  'Unable to play this video URL. Ensure it is a valid direct MP4/WebM file and allows cross-origin playback.',
                )
              }
              className="h-full w-full cursor-pointer object-contain"
            />

            {videoError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 p-6 text-center">
                <AlertCircle className="mb-3 h-10 w-10 text-[#e50914]" aria-hidden="true" />
                <p className="max-w-md text-sm font-medium text-zinc-200">{videoError}</p>
              </div>
            )}

            {/* Controls Overlay */}
            <div className="bg-gradient-to-t from-black/95 via-black/75 to-transparent px-4 pb-3 pt-10">
              {/* Seek Slider */}
              <div className="relative mb-2 flex h-5 items-center">
                <div className="pointer-events-none absolute left-0 right-0 h-1.5 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="absolute inset-y-0 left-0 bg-zinc-600/70"
                    style={{ width: `${bufferedPct}%` }}
                  />
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#e50914] to-purple-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <input
                  type="range"
                  min={0}
                  max={duration || 0}
                  step={0.5}
                  value={currentTime}
                  onChange={handleSeekInput}
                  aria-label="Seek video position"
                  className="relative z-10 h-5 w-full cursor-pointer appearance-none bg-transparent accent-[#e50914]"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    type="button"
                    onClick={togglePlay}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                    className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg text-white hover:bg-white/10"
                  >
                    {isPlaying ? (
                      <Pause className="h-5 w-5 fill-current" aria-hidden="true" />
                    ) : (
                      <Play className="h-5 w-5 fill-current" aria-hidden="true" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => seekBy(-10)}
                    aria-label="Rewind 10 seconds"
                    className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg text-zinc-200 hover:bg-white/10 hover:text-white"
                  >
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    onClick={() => seekBy(10)}
                    aria-label="Forward 10 seconds"
                    className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg text-zinc-200 hover:bg-white/10 hover:text-white"
                  >
                    <RotateCw className="h-4 w-4" aria-hidden="true" />
                  </button>

                  <div className="ml-1 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={toggleMute}
                      aria-label={isMuted ? 'Unmute' : 'Mute'}
                      className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg text-zinc-200 hover:bg-white/10 hover:text-white"
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Volume2 className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      aria-label="Volume"
                      className="hidden w-20 cursor-pointer accent-purple-500 sm:block"
                    />
                  </div>

                  <span className="ml-2 text-xs font-medium text-zinc-300 tabular-nums">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={cyclePlaybackRate}
                    aria-label={`Playback speed ${playbackRate}x`}
                    className="min-h-[36px] rounded-lg border border-zinc-700/80 bg-zinc-900/80 px-2.5 font-mono text-xs font-medium text-zinc-200 hover:border-purple-500/60 hover:text-white tabular-nums"
                  >
                    {playbackRate}x
                  </button>

                  {typeof document !== 'undefined' && document.pictureInPictureEnabled && (
                    <button
                      type="button"
                      onClick={togglePictureInPicture}
                      aria-label="Picture in Picture"
                      className="hidden min-h-[40px] min-w-[40px] items-center justify-center rounded-lg text-zinc-200 hover:bg-white/10 hover:text-white sm:flex"
                    >
                      <PictureInPicture2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={toggleFullscreen}
                    aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                    className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg text-zinc-200 hover:bg-white/10 hover:text-white"
                  >
                    {isFullscreen ? (
                      <Minimize className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Maximize className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {showInfo && (
            <div className="border-t border-zinc-800/80 bg-[#111115] p-5 sm:p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-display text-lg font-semibold text-white">
                  {activePlayer.title}
                </h3>
                <span className="text-xs text-zinc-400">
                  {activePlayer.type} · {activePlayer.category} · {activePlayer.language.toUpperCase()}
                  {activePlayer.year ? ` · ${activePlayer.year}` : ''}
                </span>
              </div>
              {activePlayer.description ? (
                <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                  {activePlayer.description}
                </p>
              ) : (
                <p className="mt-2 text-sm text-zinc-500">
                  Playing direct HTML5 media stream. Watch position is saved automatically in your browser.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
