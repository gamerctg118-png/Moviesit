# Moviesit

Moviesit is a dark-mode movie discovery and personal video streaming platform built with React, TypeScript, Tailwind CSS, the TMDB API, IndexedDB offline storage, and Capacitor for Android.

## Key Features

- **Curated Cinema Discovery (TMDB API)**: Automatically fetches trending, popular, top-rated, and upcoming titles filtered strictly to eight categories:
  - Hindi Movies
  - Malayalam Movies
  - Tamil Movies
  - Telugu Movies
  - Korean Movies
  - Korean Series
  - Anime Movies
  - Anime Series
- **Personal Video Library (`/videos.json`)**: Stream your own MP4/WebM videos by editing `public/videos.json` or adding local video files directly from your device.
- **Custom HTML5 Video Player**: Play, pause, seek, volume control, playback speed (`0.75x`–`2x`), Picture-in-Picture, fullscreen, and automatic watch-progress resume via `localStorage`.
- **Offline Downloads (IndexedDB)**: Save videos that you own or have permission to distribute for offline playback in **My Downloads**.
- **No Backend, No Accounts**: All favorites, watch history, settings, and offline files stay strictly on your device.

---

## 1. Getting Started (Web)

### Step 1: Install dependencies

```bash
npm install
```

### Step 2: Add your TMDB API Key

Moviesit uses the TMDB API for live movie and series metadata, posters, and official trailers.

1. Create a free account at [themoviedb.org](https://www.themoviedb.org/).
2. Go to **Settings -> API** and copy your **API Key (v3 auth)** or **API Read Access Token (v4 auth)**.
3. Create a `.env` file in the project root (copy `.env.example`):

```env
VITE_TMDB_API_KEY="your_tmdb_api_key_here"
```

> **Tip:** You can also enter or update your TMDB API key anytime inside the **Settings** page of the running app (saved locally in `localStorage`).

### Step 3: Run the development server

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 2. Adding Your Own Videos (`/public/videos.json`)

Moviesit loads your personal video catalog from `/videos.json` (located at `public/videos.json` in the source code).

Open `public/videos.json` and add entries matching this schema:

```json
[
  {
    "id": "my-film-01",
    "title": "My Short Film",
    "description": "A brief summary of my personal video project.",
    "poster": "/posters/my-film-01.jpg",
    "videoUrl": "https://your-own-host.example.com/videos/my-film-01.mp4",
    "type": "movie",
    "language": "ml",
    "category": "Malayalam Movies",
    "year": 2025
  }
]
```

### Supported Fields
- `id`: Unique string identifier
- `title`: Display title
- `description`: Synopsis or notes
- `poster`: Image path (placed in `public/`) or HTTPS image URL
- `videoUrl`: Direct MP4/WebM URL that you own or have permission to stream
- `type`: `"movie"` or `"series"`
- `language`: Language code or name (e.g. `"hi"`, `"ml"`, `"ta"`, `"te"`, `"ko"`, `"ja"`, `"en"`)
- `category`: One of the 8 Moviesit categories (or a custom label)
- `year`: Release year (number or string)

You can also use the **JSON Entry Builder** and **Add Local Device Video** tools inside the **My Videos** page.

---

## 3. Building for Android with Capacitor

Moviesit is preconfigured with `capacitor.config.ts` (`appId: com.moviesit.app`).

### Prerequisites
- [Node.js 20+](https://nodejs.org/)
- [Android Studio](https://developer.android.com/studio) with Android SDK installed

### Steps

1. Build the production web bundle:
   ```bash
   npm run build
   ```
2. Add the Android platform (first time only):
   ```bash
   npx cap add android
   ```
3. Sync web assets and `public/videos.json` into the Android project:
   ```bash
   npx cap sync android
   ```
4. Open the Android project in Android Studio to run on an emulator or build an APK/AAB:
   ```bash
   npx cap open android
   ```

Whenever you update `public/videos.json` or application code, run `npm run cap:sync` before building in Android Studio.

---

## 4. Content & Copyright Notice

- **TMDB Metadata Only**: TMDB provides movie/TV metadata, posters, ratings, and official trailer links only. TMDB does **not** host or provide full movie video files.
- **Personal & Permitted Videos Only**: Only stream or download videos into **My Downloads** that you personally own, created, or have explicit permission to distribute.
