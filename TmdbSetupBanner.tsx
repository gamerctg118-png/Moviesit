import { KeyRound, Settings } from 'lucide-react';
import { useState } from 'react';
import { useMoviesit } from '../context/MoviesitContext';
import { testTmdbCredential } from '../services/tmdb';

export function TmdbSetupBanner({ contextLabel }: { contextLabel: string }) {
  const { updateSettings, navigate } = useMoviesit();
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = apiKey.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    try {
      await testTmdbCredential(trimmed);
      updateSettings({ tmdbApiKey: trimmed });
      setApiKey('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to verify TMDB key.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-[#111115] p-6 sm:p-8">
      <div className="max-w-2xl">
        <div className="flex items-center gap-2.5 text-purple-400">
          <KeyRound className="h-5 w-5" aria-hidden="true" />
          <span className="text-sm font-semibold">TMDB API Key Required</span>
        </div>
        <h2 className="mt-2 font-display text-xl font-bold text-white sm:text-2xl">
          Connect TMDB to load {contextLabel}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          Moviesit fetches real-time posters, descriptions, ratings, and categories directly from
          The Movie Database (TMDB). Add <code className="font-mono text-zinc-200">VITE_TMDB_API_KEY</code> to
          your <code className="font-mono text-zinc-200">.env</code> file or paste your key below to store it
          locally on this device.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3 sm:flex-row">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="TMDB v3 API Key or v4 Read Access Token"
            aria-label="TMDB API Key"
            className="h-11 flex-1 rounded-xl border border-zinc-700 bg-black/60 px-4 text-sm text-white placeholder:text-zinc-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
          <button
            type="submit"
            disabled={loading || !apiKey.trim()}
            className="flex h-11 items-center justify-center whitespace-nowrap rounded-xl bg-[#e50914] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#c80812] disabled:opacity-50"
          >
            {loading ? 'Connecting...' : 'Save & Load'}
          </button>
          <button
            type="button"
            onClick={() => navigate('settings')}
            className="flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-zinc-700 bg-zinc-900 px-4 text-sm font-medium text-zinc-200 hover:bg-zinc-800"
          >
            <Settings className="h-4 w-4" aria-hidden="true" />
            <span>Settings</span>
          </button>
        </form>

        {error && <p className="mt-3 text-xs font-medium text-[#ff4757]">{error}</p>}
      </div>
    </div>
  );
}
