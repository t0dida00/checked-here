import { promises as fs } from 'fs';
import path from 'path';

import type { CoordinateInput, CurrentLocationAnalysis, LocationsResponse } from '@/lib/api';

const locationsFilePath = path.join(process.cwd(), 'src', 'data', 'locations.json');
const defaultLogo = '/locations/new-york.svg';

async function readLocationsFile(): Promise<LocationsResponse> {
  const raw = await fs.readFile(locationsFilePath, 'utf8');
  return JSON.parse(raw) as LocationsResponse;
}

async function writeLocationsFile(data: LocationsResponse) {
  await fs.writeFile(locationsFilePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

export async function getStoredLocations(): Promise<LocationsResponse> {
  return readLocationsFile();
}

export async function analyzeCoordinateFromBackend(
  coordinate?: CoordinateInput,
): Promise<CurrentLocationAnalysis> {
  return {
    coordinate: coordinate || {
      lat: 65.01236,
      lng: 25.46816,
    },
    city: 'Oulu',
    locality: 'Oulu',
    country: 'Finland',
    countryCode: 'FI',
    continent: 'Europe',
  };
}

export async function saveCheckinToStore(
  analysis: CurrentLocationAnalysis,
): Promise<LocationsResponse> {
  const current = await readLocationsFile();
  const timestamp = new Date().toISOString();

  current.lastVisited = timestamp;
  current.locations.push({
    coordinate: analysis.coordinate,
    logo: defaultLogo,
    createdAt: timestamp,
    city: analysis.city,
    country: analysis.country,
    continent: analysis.continent,
  });

  await writeLocationsFile(current);
  return current;
}
