# Globe View

Globe View is a full-stack travel map app with an interactive 3D globe on the frontend and an Express API on the backend. It lets a user explore visited places, highlight countries on a rotating globe, reverse-geocode coordinates into place details, and save new check-ins.

## Project structure

```text
checkedhere/
|- frontend/  # Next.js + TypeScript + Mapbox globe UI
|- backend/   # Express API + JSON file persistence
```

## What the app does

- Renders an interactive Mapbox globe with dark/light themes
- Shows visited countries, city markers, and a journey line between check-ins
- Lists saved locations by continent, country, and city
- Reverse-geocodes coordinates through the backend using Mapbox
- Analyzes landmark images through Hugging Face, then converts the result into a location
- Persists saved check-ins in JSON files

## Tech stack

- Frontend: Next.js 14, React 18, TypeScript, Sass, React Query, Mapbox GL
- Backend: Node.js, Express, CORS, Compression, Morgan, Nodemon
- External services: Mapbox Geocoding API, Hugging Face Router

## Quick start

### 1. Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. Configure environment

Create `backend/.env` from `backend/.env.example`.

Required backend values:

- `PORT=5000`
- `CORS_ORIGIN=http://localhost:3000`
- `MAPBOX_ACCESS_TOKEN=your_mapbox_token`
- `HF_TOKEN=your_huggingface_token`
- `HF_VISION_MODEL=Qwen/Qwen3-VL-8B-Instruct`

Create `frontend/.env.local` with:

```env
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
```

### 3. Run both apps

In one terminal:

```bash
cd backend
npm run dev
```

In another terminal:

```bash
cd frontend
npm run dev
```

Open `http://localhost:3000`.

## Runtime notes

- The frontend currently fetches `locations`, coordinate analysis, image analysis, and check-in creation directly from the backend via `NEXT_PUBLIC_BACKEND_API_URL`.
- The frontend also contains some Next.js API routes under `frontend/src/app/api`. They are useful as local helpers, but they are not the main runtime path for the current UI.
- Saved location data is file-based:
  - Backend store: `backend/src/data/locations.json`
  - Frontend local store/helper data: `frontend/src/data/locations.json`

## Main backend endpoints

- `GET /api/v1/health`
- `GET /api/v1/locations`
- `POST /api/v1/checkin/analyze`
- `POST /api/v1/checkin/image-analyze`
- `POST /api/v1/checkin`

## Scripts

### Backend

- `npm run dev` - start with nodemon
- `npm start` - start with Node.js

### Frontend

- `npm run dev` - start Next.js dev server on port 3000
- `npm run build` - production build
- `npm run start` - start production server
- `npm run lint` - run Next lint

## Additional docs

- Backend setup: [backend/README.md](backend/README.md)
- Frontend setup: [frontend/README.md](frontend/README.md)
