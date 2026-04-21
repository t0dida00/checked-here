import { NextRequest, NextResponse } from 'next/server';

import type { ManualLocationSuggestion } from '@/lib/api';

interface MapboxContextItem {
  name?: string;
}

interface MapboxFeature {
  id?: string;
  geometry?: {
    coordinates?: [number, number];
  };
  properties?: {
    full_address?: string;
    name?: string;
    coordinates?: {
      longitude?: number;
      latitude?: number;
    };
    context?: {
      country?: MapboxContextItem;
      region?: MapboxContextItem;
      place?: MapboxContextItem;
      locality?: MapboxContextItem;
      neighborhood?: MapboxContextItem;
      district?: MapboxContextItem;
    };
  };
}

interface MapboxForwardResponse {
  features?: MapboxFeature[];
}

function toSuggestion(feature: MapboxFeature): ManualLocationSuggestion | null {
  const coordinates = feature.properties?.coordinates;
  const geometryCoordinates = feature.geometry?.coordinates;
  const lng = coordinates?.longitude ?? geometryCoordinates?.[0];
  const lat = coordinates?.latitude ?? geometryCoordinates?.[1];

  if (typeof lat !== 'number' || typeof lng !== 'number') return null;

  const context = feature.properties?.context;
  const city =
    context?.place?.name ||
    context?.locality?.name ||
    context?.neighborhood?.name ||
    feature.properties?.name ||
    'Unknown location';
  const country = context?.country?.name || 'Unknown country';
  const region = context?.region?.name || context?.district?.name || '';
  const label = feature.properties?.full_address || [city, region, country].filter(Boolean).join(', ');
  return {
    id: feature.id || `${lat},${lng},${label}`,
    label,
    city,
    country,
    continent: 'Unknown',
    coordinate: { lat, lng },
  };
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim();
  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }

  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!accessToken) {
    return NextResponse.json(
      { message: 'Missing Mapbox access token.' },
      { status: 500 },
    );
  }

  const url = new URL('https://api.mapbox.com/search/geocode/v6/forward');
  url.searchParams.set('q', query);
  url.searchParams.set('autocomplete', 'true');
  url.searchParams.set('limit', '5');
  url.searchParams.set('language', 'en');
  url.searchParams.set('types', 'address,street,neighborhood,locality,place,region,country');
  url.searchParams.set('access_token', accessToken);

  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    return NextResponse.json(
      { message: 'Location search failed.' },
      { status: response.status },
    );
  }

  const data = (await response.json()) as MapboxForwardResponse;
  const suggestions = (data.features || [])
    .map(toSuggestion)
    .filter((item): item is ManualLocationSuggestion => item !== null);

  return NextResponse.json(suggestions);
}
