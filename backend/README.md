# Backend

Express API for Globe View. It serves visited locations, reverse-geocodes coordinates with Mapbox, analyzes uploaded landmark images with Hugging Face, and saves new check-ins into a local JSON file.

## Stack

- Node.js
- Express



## Setup

Install dependencies:

```bash
npm install
```

Create `backend/.env` from `.env.example`:

```env
PORT=5000
CORS_ORIGIN=http://localhost:3000
MAPBOX_ACCESS_TOKEN=
HF_TOKEN=
HF_VISION_MODEL=Qwen/Qwen3-VL-8B-Instruct
```

## Environment variables

- `PORT`: backend server port
- `CORS_ORIGIN`: allowed frontend origin
- `MAPBOX_ACCESS_TOKEN`: required for reverse geocoding coordinates
- `HF_TOKEN`: required for image-based location analysis
- `HF_VISION_MODEL`: Hugging Face vision model name

## Run

Development:

```bash
npm run dev
```

Production:

```bash
npm start
```

Default local URL: `http://localhost:5000`

## API endpoints

### `GET /`

Returns a simple status payload and points to `/api/v1`.

### `GET /api/v1`

Returns the API welcome message and a short endpoint list.

### `GET /api/v1/health`

Health check endpoint.

Example response:

```json
{
  "success": true,
  "message": "API v1 is healthy",
  "timestamp": "2026-04-22T12:00:00.000Z"
}
```

### `GET /api/v1/locations`

Returns the saved locations document from `src/data/locations.json`.

### `POST /api/v1/checkin/analyze`

Reverse-geocodes coordinates into a location payload.

Request body:

```json
{
  "coordinate": {
    "lat": 48.8584,
    "lng": 2.2945
  }
}
```

### `POST /api/v1/checkin/image-analyze`

Analyzes a `data:image/...` payload with Hugging Face, extracts coordinates from the model output, then reverse-geocodes that coordinate with Mapbox.

Request body:

```json
{
  "imageDataUrl": "data:image/jpeg;base64,..."
}
```

### `POST /api/v1/checkin`

Appends a new location entry to `src/data/locations.json`.

Request body:

```json
{
  "analysis": {
    "coordinate": { "lat": 48.8584, "lng": 2.2945 },
    "city": "Paris",
    "country": "France",
    "countryCode": "FR",
    "flag": "https://flagcdn.com/fr.svg",
    "continent": "Europe"
  }
}
```

## Persistence

Location data is stored in:

- `src/data/locations.json`

The backend reads and writes that file through `src/models/location.model.js`.

## Important behavior

- Reverse geocoding fails with a server error if `MAPBOX_ACCESS_TOKEN` is missing.
- Image analysis fails with a server error if `HF_TOKEN` is missing.
- Image analysis expects a base64 data URL, not a raw file upload.
- New check-ins are appended to the JSON file; there is no database layer yet.

## Scripts

- `npm run dev` - start with nodemon
- `npm start` - start with Node.js

## Current limitations

- No automated tests are set up yet
- No authentication or multi-user storage yet
- Persistence is file-based, so it is best suited for local development or demos
