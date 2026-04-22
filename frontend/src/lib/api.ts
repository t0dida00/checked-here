import axios from 'axios';

export interface LocationItem {
  coordinate: { lat: number; lng: number };
  logo: string;
  countryCode: string;
  flag: string;
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
  flag: string;
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

interface CheckinResponse {
  isSuccess: boolean;
  status: number;
  data: LocationItem;
}

interface AnalysisResponse {
  isSuccess: boolean;
  status: number;
  data: CurrentLocationAnalysis;
}

const backendApiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:5000/api/v1',
});

const frontendApiClient = axios.create({ baseURL: '/api' });

export async function fetchLocations(): Promise<LocationsResponse> {
  const { data } = await backendApiClient.get<LocationsResponse>('/locations');
  return data;
}

export async function analyzeCoordinates(
  coordinate: CoordinateInput,
): Promise<CurrentLocationAnalysis> {
  const { data } = await backendApiClient.post<AnalysisResponse>('/checkin/analyze', {
    coordinate,
  });

  return data.data;
}

export async function analyzeSightImage(
  imageDataUrl: string,
): Promise<CurrentLocationAnalysis> {
  const { data } = await backendApiClient.post<AnalysisResponse>('/checkin/image-analyze', {
    imageDataUrl,
  });

  return data.data;
}

export async function createCheckin(
  analysis: CurrentLocationAnalysis,
): Promise<LocationItem> {
  const { data } = await backendApiClient.post<CheckinResponse>('/checkin', {
    analysis,
  });

  return data.data;
}

export async function searchLocations(
  query: string,
): Promise<ManualLocationSuggestion[]> {
  const { data } = await frontendApiClient.get<ManualLocationSuggestion[]>('/location-search', {
    params: { q: query },
  });

  return data;
}
