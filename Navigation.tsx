import {
  Clapperboard,
  Download,
  Film,
  Heart,
  Home,
  Menu,
  Search,
  Settings,
  Sparkles,
  Tv,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useMoviesit } from '../context/MoviesitContext';
import type { AppPage } from '../types/media';

interface NavItem {
  id: AppPage;
  label: string;
  icon: typeof Home;
  group: 'discover' | 'library';
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home, group: 'discover' },
  { id: 'movies', label: 'Movies', icon: Film, group: 'discover' },
  { id: 'tv-series', label: 'TV Series', icon: Tv, group: 'discover' },
  { id: 'anime', label: 'Anime', icon: Sparkles, group: 'discover' },
  { id: 'search', label: 'Search', icon: Search, group: 'discover' },
  { id: 'favorites', label: 'Favorites', icon: Heart, group: 'library' },
  { id: 'my-videos', label: 'My Videos', icon: Clapperboard, group: 'library' },
  { id: 'my-downloads', label: 'My Downloads', icon: Download, group: 'library' },
  { id: 'settings', label: 'Settings', icon: Settings, group: 'library' },
];

const MOBILE_PRIMARY_TABS: { id: AppPage; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'movies', label: 'Movies', icon: Film },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'my-videos', label: 'My Videos', icon: Clapperboard },
];

const MOBILE_MORE_ITEMS = NAV_ITEMS.filter(
  (item) => !MOBILE_PRIMARY_TABS.some((tab) => tab.id === item.id),
);

export function Navigation() {
  const { activePage, navigate, favorites } = useMoviesit();
  const [moreOpen, setMoreOpen] = useState(false);

  const discoverItems = NAV_ITEMS.filter((i) => i.group === 'discover');
  const libraryItems = NAV_ITEMS.filter((i) => i.group === 'library');
  const isMoreActive = MOBILE_MORE_ITEMS.some((i) => i.id === activePage);

  const handleNav = (page: AppPage) => {
    navigate(page);
    setMoreOpen(false);
  };

  return (
    <>
      {/* Desktop Sidebar Rail */}
      <aside
        aria-label="Primary navigation"
        className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-zinc-800/80 bg-[#09090b]/95 px-4 py-6 backdrop-blur-xl lg:flex"
      >
        <button
          type="button"
          onClick={() => handleNav('home')}
          className="mb-8 flex items-center gap-2.5 px-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e50914] rounded-lg"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#e50914] to-purple-600 text-white shadow-lg shadow-[#e50914]/25">
            <Clapperboard className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="font-display text-2xl font-bold tracking-tight text-white whitespace-nowrap">
            Movies<span className="text-[#e50914]">it</span>
          </span>
        </button>

        <div className="flex flex-1 flex-col justify-between overflow-y-auto pr-1">
          <div className="space-y-6">
            <div>
              <p className="mb-2 px-3 text-xs font-semibold text-zinc-500">
                Discover
              </p>
              <ul className="space-y-1">
                {discoverItems.map((item) => {
                  const Icon = item.icon;
                  const active = activePage === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => handleNav(item.id)}
                        className={`flex min-h-[44px] w-full items-center gap-3 whitespace-nowrap rounded-xl px-3 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e50914] ${
                          active
                            ? 'bg-gradient-to-r from-[#e50914]/20 to-purple-600/15 text-white ring-1 ring-[#e50914]/40'
                            : 'text-zinc-400 hover:bg-zinc-900/80 hover:text-zinc-100'
                        }`}
                      >
                        <Icon
                          className={`h-4 w-4 shrink-0 ${
                            active ? 'text-[#ff3b47]' : 'text-zinc-500'
                          }`}
                          aria-hidden="true"
                        />
                        <span>{item.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              <p className="mb-2 px-3 text-xs font-semibold text-zinc-500">
                Personal Library
              </p>
              <ul className="space-y-1">
                {libraryItems.map((item) => {
                  const Icon = item.icon;
                  const active = activePage === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => handleNav(item.id)}
                        className={`flex min-h-[44px] w-full items-center justify-between gap-3 whitespace-nowrap rounded-xl px-3 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e50914] ${
                          active
                            ? 'bg-gradient-to-r from-[#e50914]/20 to-purple-600/15 text-white ring-1 ring-purple-500/40'
                            : 'text-zinc-400 hover:bg-zinc-900/80 hover:text-zinc-100'
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <Icon
                            className={`h-4 w-4 shrink-0 ${
                              active ? 'text-purple-400' : 'text-zinc-500'
                            }`}
                            aria-hidden="true"
                          />
                          <span>{item.label}</span>
                        </span>
                        {item.id === 'favorites' && favorites.length > 0 && (
                          <span className="text-xs text-zinc-500 tabular-nums">
                            {favorites.length}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="mt-6 border-t border-zinc-800/80 pt-4 px-2">
            <p className="text-xs text-zinc-500 leading-relaxed">
              TMDB metadata &amp; personal MP4 library. All data stored locally on device.
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile Compact Top Header (48px) */}
      <header className="sticky top-0 z-30 flex h-12 items-center justify-between border-b border-zinc-800/80 bg-[#09090b]/90 px-4 backdrop-blur-md pt-safe lg:hidden">
        <button
          type="button"
          onClick={() => handleNav('home')}
          className="flex min-h-[44px] items-center gap-2 whitespace-nowrap focus:outline-none"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-[#e50914] to-purple-600 text-white">
            <Clapperboard className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-white">
            Movies<span className="text-[#e50914]">it</span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleNav('settings')}
          aria-label="Open Settings"
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-zinc-300 hover:text-white"
        >
          <Settings className="h-5 w-5" aria-hidden="true" />
        </button>
      </header>

      {/* Mobile Bottom Tab Bar (56px) */}
      <nav
        aria-label="Mobile navigation"
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-800/80 bg-[#09090b]/95 backdrop-blur-md pb-safe lg:hidden"
      >
        <div className="grid h-14 grid-cols-5 items-center">
          {MOBILE_PRIMARY_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activePage === tab.id && !moreOpen;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleNav(tab.id)}
                className={`flex min-h-[44px] flex-col items-center justify-center gap-0.5 transition-colors ${
                  active ? 'text-[#ff3b47]' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span className="text-[10px] font-medium tracking-tight whitespace-nowrap">
                  {tab.label}
                </span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setMoreOpen((v) => !v)}
            className={`flex min-h-[44px] flex-col items-center justify-center gap-0.5 transition-colors ${
              moreOpen || isMoreActive ? 'text-purple-400' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
            <span className="text-[10px] font-medium tracking-tight whitespace-nowrap">
              More
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile More Bottom Sheet */}
      {moreOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setMoreOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <div className="absolute bottom-0 left-0 right-0 rounded-t-3xl border-t border-zinc-800 bg-[#111115] px-5 pb-8 pt-3 pb-safe shadow-2xl">
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-zinc-700" />
            <div className="mb-3 flex items-center justify-between">
              <span className="font-display text-base font-semibold text-white">
                More Sections
              </span>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                aria-label="Close"
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {MOBILE_MORE_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNav(item.id)}
                    className={`flex min-h-[48px] items-center justify-between rounded-xl px-4 text-sm font-medium transition-colors ${
                      active
                        ? 'bg-gradient-to-r from-[#e50914]/20 to-purple-600/20 text-white ring-1 ring-purple-500/40'
                        : 'bg-zinc-900/60 text-zinc-200 hover:bg-zinc-900'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-purple-400" aria-hidden="true" />
                      <span>{item.label}</span>
                    </span>
                    {item.id === 'favorites' && favorites.length > 0 && (
                      <span className="text-xs text-zinc-400 tabular-nums">
                        {favorites.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
