import { CheckCircle2, KeyRound, Smartphone, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useMoviesit } from '../context/MoviesitContext';
import { clearOfflineDownloads } from '../services/offlineDb';
import { clearFavorites, clearWatchHistory } from '../services/storage';
import { getTmdbCredentialSource, testTmdbCredential } from '../services/tmdb';

export function SettingsPage() {
  const { settings, updateSettings, favorites, watchHistory } = useMoviesit();

  const [apiKeyInput, setApiKeyInput] = useState(settings.tmdbApiKey);
  const [testing, setTesting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const credentialSource = getTmdbCredentialSource();

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = apiKeyInput.trim();

    if (!trimmed) {
      updateSettings({ tmdbApiKey: '' });
      setStatusMessage({
        type: 'success',
        text: 'Cleared local TMDB override. Falling back to VITE_TMDB_API_KEY if set.',
      });
      return;
    }

    setTesting(true);
    setStatusMessage(null);
    try {
      await testTmdbCredential(trimmed);
      updateSettings({ tmdbApiKey: trimmed });
      setStatusMessage({
        type: 'success',
        text: 'TMDB connection verified and saved locally.',
      });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'TMDB verification failed.',
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-8 pb-12">
      <div className="border-b border-zinc-800/80 pb-5">
        <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Settings
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Manage TMDB credentials, playback behavior, local device storage, and Android readiness.
        </p>
      </div>

      {/* TMDB API Configuration */}
      <section className="rounded-2xl border border-zinc-800 bg-[#111115] p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-white">
              <KeyRound className="h-5 w-5 text-purple-400" aria-hidden="true" />
              <span>TMDB API Configuration</span>
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Current source:{' '}
              <span className="font-medium text-zinc-200">
                {credentialSource === 'env'
                  ? 'Environment Variable (VITE_TMDB_API_KEY)'
                  : credentialSource === 'settings'
                    ? 'Saved in LocalStorage'
                    : 'Not configured'}
              </span>
            </p>
          </div>
          {credentialSource !== 'none' && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              <span>Connected</span>
            </span>
          )}
        </div>

        <form onSubmit={handleSaveKey} className="mt-5 space-y-3">
          <label className="block">
            <span className="text-xs font-medium text-zinc-400">
              Local TMDB API Key (v3) or Read Access Token (v4)
            </span>
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="Leave blank to use VITE_TMDB_API_KEY from .env"
              className="mt-1.5 h-11 w-full rounded-xl border border-zinc-700 bg-black/60 px-4 text-sm text-white placeholder:text-zinc-500 focus:border-purple-500 focus:outline-none"
            />
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={testing}
              className="flex min-h-[44px] items-center rounded-xl bg-[#e50914] px-5 text-sm font-semibold text-white hover:bg-[#c80812] disabled:opacity-50"
            >
              {testing ? 'Verifying...' : 'Verify & Save Key'}
            </button>
            {settings.tmdbApiKey && (
              <button
                type="button"
                onClick={() => {
                  setApiKeyInput('');
                  updateSettings({ tmdbApiKey: '' });
                  setStatusMessage({
                    type: 'success',
                    text: 'Removed saved local TMDB key.',
                  });
                }}
                className="flex min-h-[44px] items-center rounded-xl border border-zinc-700 bg-zinc-900 px-4 text-sm font-medium text-zinc-200 hover:bg-zinc-800"
              >
                Clear Local Key
              </button>
            )}
          </div>

          {statusMessage && (
            <p
              className={`text-xs font-medium ${
                statusMessage.type === 'success' ? 'text-emerald-400' : 'text-[#ff4757]'
              }`}
            >
              {statusMessage.text}
            </p>
          )}
        </form>
      </section>

      {/* Playback Preferences */}
      <section className="rounded-2xl border border-zinc-800 bg-[#111115] p-6">
        <h2 className="font-display text-lg font-semibold text-white">Playback Preferences</h2>
        <div className="mt-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-zinc-100">Auto-resume Watch History</p>
            <p className="text-xs text-zinc-400">
              Automatically resume personal videos from your last saved timestamp.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={settings.autoResumePlayback}
            onClick={() => updateSettings({ autoResumePlayback: !settings.autoResumePlayback })}
            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
              settings.autoResumePlayback ? 'bg-[#e50914]' : 'bg-zinc-700'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                settings.autoResumePlayback ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </section>

      {/* Local Storage & IndexedDB Management */}
      <section className="rounded-2xl border border-zinc-800 bg-[#111115] p-6">
        <h2 className="font-display text-lg font-semibold text-white">Device Storage &amp; Data</h2>
        <p className="mt-1 text-xs text-zinc-400">
          Moviesit runs without a backend or user accounts. All data lives on your device.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => clearFavorites()}
            className="flex min-h-[48px] items-center justify-between rounded-xl border border-zinc-800 bg-black/50 px-4 text-left text-xs font-medium text-zinc-200 hover:border-zinc-700"
          >
            <span>Clear Favorites ({favorites.length})</span>
            <Trash2 className="h-4 w-4 text-zinc-500" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => clearWatchHistory()}
            className="flex min-h-[48px] items-center justify-between rounded-xl border border-zinc-800 bg-black/50 px-4 text-left text-xs font-medium text-zinc-200 hover:border-zinc-700"
          >
            <span>Clear Watch History ({watchHistory.length})</span>
            <Trash2 className="h-4 w-4 text-zinc-500" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => clearOfflineDownloads()}
            className="flex min-h-[48px] items-center justify-between rounded-xl border border-zinc-800 bg-black/50 px-4 text-left text-xs font-medium text-zinc-200 hover:border-zinc-700"
          >
            <span>Purge Offline Vault</span>
            <Trash2 className="h-4 w-4 text-zinc-500" aria-hidden="true" />
          </button>
        </div>
      </section>

      {/* Capacitor Android Info */}
      <section className="rounded-2xl border border-zinc-800 bg-[#111115] p-6">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-white">
          <Smartphone className="h-5 w-5 text-purple-400" aria-hidden="true" />
          <span>Android Packaging (Capacitor)</span>
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-300">
          This project is configured with <code className="font-mono text-zinc-100">capacitor.config.ts</code>{' '}
          (<code className="font-mono text-purple-300">com.moviesit.app</code>). To build an Android APK:
        </p>
        <pre className="mt-3 overflow-x-auto rounded-xl border border-zinc-800 bg-black/70 p-4 font-mono text-xs leading-relaxed text-zinc-300">
{`npm run build
npx cap add android
npx cap sync android
npx cap open android`}
        </pre>
      </section>
    </div>
  );
}
