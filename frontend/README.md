# Frontend

Next.js app for Globe View. It renders the interactive globe, displays the visited-location tree, and calls the backend API for location data and check-in actions.

## Stack

- Next.js 14 App Router
- React 18
- TypeScript
- Sass modules
- React Query
- Mapbox GL
- Axios

## Folder overview

```text
frontend/
|- public/locations/         # marker images/logos
|- src/app/                  # App Router pages and API routes
|- src/components/           # globe UI, controls, locations panel
|- src/hooks/                # React Query hooks
|- src/lib/                  # API clients and Mapbox helpers
|- src/providers/            # app providers
|- src/data/locations.json   # local helper data for Next routes
```

## Setup

Install dependencies:

```bash
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
```

## Environment variables

- `NEXT_PUBLIC_BACKEND_API_URL`: backend base URL used by the frontend Axios client
- `NEXT_PUBLIC_MAPBOX_TOKEN`: public Mapbox token used by the globe and the local search route

## Run

Development:

```bash
npm run dev
```

Production build:

```bash
npm run build
npm run start
```

Default local URL: `http://localhost:3000`

## Main pages

- `/` redirects to `/globe`
- `/globe` renders the full interactive map experience

## Main features

- 3D globe rendering with Mapbox `globe` projection
- Auto-rotation with manual start/stop controls
- Dark and light theme switching
- Hover highlighting for country boundaries
- Marker pins for visited cities
- Journey line connecting saved locations
- Sidebar grouped by continent, country, and city
- Search/filter within the visited-location panel
- Fly-to interactions when a location is selected

## Data flow

The current UI primarily uses the backend directly:

- `fetchLocations()` -> `GET {NEXT_PUBLIC_BACKEND_API_URL}/locations`
- `analyzeCoordinates()` -> `POST {NEXT_PUBLIC_BACKEND_API_URL}/checkin/analyze`
- `analyzeSightImage()` -> `POST {NEXT_PUBLIC_BACKEND_API_URL}/checkin/image-analyze`
- `createCheckin()` -> `POST {NEXT_PUBLIC_BACKEND_API_URL}/checkin`

React Query is used for location fetching and caching.

## Local Next.js API routes

The app also contains API routes under `src/app/api`:

- `/api/locations`
- `/api/location-search`
- `/api/checkin`

Notes:

- `/api/location-search` performs forward geocoding against Mapbox.
- `/api/locations` and `/api/checkin` currently use local file helpers in `src/lib/server/locations-store.ts`.
- These routes exist in the repo, but the main UI currently reads and writes through the backend API instead.

## Key files

- `src/app/globe/page.tsx`
- `src/components/GlobeMap/index.tsx`
- `src/components/LocationsPanel/index.tsx`
- `src/lib/api.ts`
- `src/lib/mapbox.ts`

## Scripts

- `npm run dev` - start Next.js on port 3000
- `npm run build` - build for production
- `npm run start` - start the production server
- `npm run lint` - run Next lint

## Current limitations

- No automated tests are set up yet
- The main runtime depends on the backend being available
- Some local Next API routes and local JSON storage still look like helper or transitional code paths
