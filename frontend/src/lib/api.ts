import axios from 'axios';

export interface LocationItem {
  coordinate: { lat: number; lng: number };
  logo: string;
  createdAt: string;
  city: string;
  country: string;
  continent: string;
}

export interface LocationsResponse {
  id: string;
  userId: string;
  lastVisited: string;
  locations: LocationItem[];
}

export interface CoordinateInput {
  lat: number;
  lng: number;
}

export interface CurrentLocationAnalysis {
  coordinate: CoordinateInput;
  city: string;
  locality: string;
  country: string;
  countryCode: string;
  continent: string;
  continentCode?: string;
  principalSubdivision?: string;
  postcode?: string;
  plusCode?: string;
}

export interface ManualLocationSuggestion {
  id: string;
  label: string;
  city: string;
  country: string;
  continent: string;
  coordinate: CoordinateInput;
}

const apiClient = axios.create({ baseURL: '/api' });

export async function fetchLocations(): Promise<LocationsResponse> {
  const { data } = await apiClient.get<LocationsResponse>('/locations');
  return data;
}

export async function analyzeCoordinates(
  coordinate: CoordinateInput,
): Promise<CurrentLocationAnalysis> {
  const { data } = await apiClient.post<Partial<CurrentLocationAnalysis>>(
    '/checkin',
    { coordinate },
  );

  return {
    coordinate: data.coordinate || coordinate,
    city: data.city || 'Unknown location',
    locality: data.locality || data.city || '',
    country: data.country || 'Unknown country',
    countryCode: data.countryCode || '',
    continent: data.continent || 'Unknown continent',
    continentCode: data.continentCode,
    principalSubdivision: data.principalSubdivision,
    postcode: data.postcode,
    plusCode: data.plusCode,
  };
}

export async function createCheckin(
  analysis: CurrentLocationAnalysis,
): Promise<LocationsResponse> {
  const { data } = await apiClient.post<LocationsResponse>('/checkin', {
    analysis,
  });

  return data;
}

export async function searchLocations(
  query: string,
): Promise<ManualLocationSuggestion[]> {
  const { data } = await apiClient.get<ManualLocationSuggestion[]>('/location-search', {
    params: { q: query },
  });

  return data;
}
