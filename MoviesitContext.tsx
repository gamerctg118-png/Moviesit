import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  getFavorites,
  getSettings,
  getWatchHistory,
  saveSettings,
  toggleFavorite as toggleFavoriteStorage,
} from '../services/storage';
import { hasTmdbCredential } from '../services/tmdb';
import type {
  AllowedCategoryId,
  AppPage,
  AppSettings,
  FavoriteItem,
  MediaType,
  PersonalVideo,
  WatchHistoryEntry,
} from '../types/media';

export interface ActivePlayerPayload {
  id: string;
  title: string;
  description: string;
  poster: string;
  videoUrl: string;
  type: string;
  language: string;
  category: string;
  year: string | number;
  source: 'videos-json' | 'local-device' | 'offline-db';
  startAtSeconds?: number;
}

export interface ActiveDetailPayload {
  mediaType: MediaType;
  id: number;
}

interface MoviesitContextValue {
  activePage: AppPage;
  navigate: (page: AppPage, categoryPreset?: AllowedCategoryId) => void;
  categoryPreset: AllowedCategoryId | null;
  clearCategoryPreset: () => void;
  favorites: FavoriteItem[];
  isFavoriteKey: (key: string) => boolean;
  toggleFavorite: (item: Omit<FavoriteItem, 'addedAt'>) => boolean;
  watchHistory: WatchHistoryEntry[];
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => void;
  tmdbConfigured: boolean;
  tmdbRevision: number;
  bumpTmdbRevision: () => void;
  activeDetail: ActiveDetailPayload | null;
  openMediaDetails: (mediaType: MediaType, id: number) => void;
  closeMediaDetails: () => void;
  activePlayer: ActivePlayerPayload | null;
  openPlayer: (payload: ActivePlayerPayload) => void;
  closePlayer: () => void;
  playPersonalVideo: (video: PersonalVideo, startAtSeconds?: number) => void;
}

const MoviesitContext = createContext<MoviesitContextValue | null>(null);

export function MoviesitProvider({ children }: { children: React.ReactNode }) {
  const [activePage, setActivePage] = useState<AppPage>('home');
  const [categoryPreset, setCategoryPreset] = useState<AllowedCategoryId | null>(null);
  const [favorites, setFavorites] = useState<FavoriteItem[]>(() => getFavorites());
  const [watchHistory, setWatchHistory] = useState<WatchHistoryEntry[]>(() => getWatchHistory());
  const [settings, setSettings] = useState<AppSettings>(() => getSettings());
  const [tmdbRevision, setTmdbRevision] = useState(0);
  const [activeDetail, setActiveDetail] = useState<ActiveDetailPayload | null>(null);
  const [activePlayer, setActivePlayer] = useState<ActivePlayerPayload | null>(null);

  useEffect(() => {
    const onFavs = () => setFavorites(getFavorites());
    const onHistory = () => setWatchHistory(getWatchHistory());
    const onSettings = () => {
      setSettings(getSettings());
      setTmdbRevision((n) => n + 1);
    };

    window.addEventListener('moviesit:favorites-updated', onFavs);
    window.addEventListener('moviesit:history-updated', onHistory);
    window.addEventListener('moviesit:settings-updated', onSettings);
    return () => {
      window.removeEventListener('moviesit:favorites-updated', onFavs);
      window.removeEventListener('moviesit:history-updated', onHistory);
      window.removeEventListener('moviesit:settings-updated', onSettings);
    };
  }, []);

  const navigate = useCallback((page: AppPage, preset?: AllowedCategoryId) => {
    setActivePage(page);
    setCategoryPreset(preset ?? null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const clearCategoryPreset = useCallback(() => setCategoryPreset(null), []);

  const isFavoriteKey = useCallback(
    (key: string) => favorites.some((f) => f.key === key),
    [favorites],
  );

  const toggleFavorite = useCallback((item: Omit<FavoriteItem, 'addedAt'>) => {
    const result = toggleFavoriteStorage(item);
    setFavorites(result.favorites);
    return result.added;
  }, []);

  const updateSettings = useCallback((partial: Partial<AppSettings>) => {
    const next = saveSettings(partial);
    setSettings(next);
    setTmdbRevision((n) => n + 1);
  }, []);

  const bumpTmdbRevision = useCallback(() => {
    setTmdbRevision((n) => n + 1);
  }, []);

  const openMediaDetails = useCallback((mediaType: MediaType, id: number) => {
    setActiveDetail({ mediaType, id });
  }, []);

  const closeMediaDetails = useCallback(() => {
    setActiveDetail(null);
  }, []);

  const openPlayer = useCallback((payload: ActivePlayerPayload) => {
    setActivePlayer(payload);
  }, []);

  const closePlayer = useCallback(() => {
    setActivePlayer(null);
  }, []);

  const playPersonalVideo = useCallback(
    (video: PersonalVideo, startAtSeconds?: number) => {
      setActivePlayer({
        id: video.id,
        title: video.title,
        description: video.description,
        poster: video.poster,
        videoUrl: video.videoUrl,
        type: video.type,
        language: video.language,
        category: video.category,
        year: video.year,
        source: video.source === 'local-device' ? 'local-device' : 'videos-json',
        startAtSeconds,
      });
    },
    [],
  );

  return (
    <MoviesitContext.Provider
      value={{
        activePage,
        navigate,
        categoryPreset,
        clearCategoryPreset,
        favorites,
        isFavoriteKey,
        toggleFavorite,
        watchHistory,
        settings,
        updateSettings,
        tmdbConfigured: hasTmdbCredential(),
        tmdbRevision,
        bumpTmdbRevision,
        activeDetail,
        openMediaDetails,
        closeMediaDetails,
        activePlayer,
        openPlayer,
        closePlayer,
        playPersonalVideo,
      }}
    >
      {children}
    </MoviesitContext.Provider>
  );
}

export function useMoviesit(): MoviesitContextValue {
  const ctx = useContext(MoviesitContext);
  if (!ctx) {
    throw new Error('useMoviesit must be used inside MoviesitProvider');
  }
  return ctx;
}
