/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AnimatePresence, motion } from 'motion/react';
import { MediaDetailModal } from './components/MediaDetailModal';
import { Navigation } from './components/Navigation';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { MoviesitProvider, useMoviesit } from './context/MoviesitContext';
import { AnimePage } from './pages/AnimePage';
import { FavoritesPage } from './pages/FavoritesPage';
import { HomePage } from './pages/HomePage';
import { MoviesPage } from './pages/MoviesPage';
import { MyDownloadsPage } from './pages/MyDownloadsPage';
import { MyVideosPage } from './pages/MyVideosPage';
import { SearchPage } from './pages/SearchPage';
import { SettingsPage } from './pages/SettingsPage';
import { TvSeriesPage } from './pages/TvSeriesPage';

function MoviesitShell() {
  const { activePage } = useMoviesit();

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <HomePage />;
      case 'movies':
        return <MoviesPage />;
      case 'tv-series':
        return <TvSeriesPage />;
      case 'anime':
        return <AnimePage />;
      case 'search':
        return <SearchPage />;
      case 'favorites':
        return <FavoritesPage />;
      case 'my-videos':
        return <MyVideosPage />;
      case 'my-downloads':
        return <MyDownloadsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100">
      <Navigation />

      <main className="min-h-screen px-4 pb-24 pt-5 sm:px-6 lg:pl-72 lg:pr-8 lg:pb-12 lg:pt-8">
        <div className="mx-auto max-w-[1440px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <MediaDetailModal />
      <VideoPlayerModal />
    </div>
  );
}

export default function App() {
  return (
    <MoviesitProvider>
      <MoviesitShell />
    </MoviesitProvider>
  );
}
