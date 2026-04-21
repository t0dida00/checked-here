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

interface ReverseGeocodeResponse {
  city?: string;
  locality?: string;
  countryName?: string;
  countryCode?: string;
  continent?: string;
  continentCode?: string;
  principalSubdivision?: string;
  postcode?: string;
  plusCode?: string;
}

export interface CurrentLocationAnalysis {
  coordinate: CoordinateInput;
  city: string;
  locality: string;
  country: string;
  countryCode: string;
  continent: string;
  continentCode: string;
  principalSubdivision: string;
  postcode: string;
  plusCode: string;
}

const apiClient = axios.create({ baseURL: '/api' });

export async function fetchLocations(): Promise<LocationsResponse> {
  const { data } = await apiClient.get<LocationsResponse>('/locations');
  return data;
}

export async function analyzeCoordinates(
  coordinate: CoordinateInput,
): Promise<CurrentLocationAnalysis> {
  const { data } = await axios.get<ReverseGeocodeResponse>(
    'https://api-bdc.net/data/reverse-geocode',
    {
      params: {
        latitude: coordinate.lat,
        longitude: coordinate.lng,
        localityLanguage: 'en',
      },
    },
  );

  return {
    coordinate,
    city: data.city || data.locality || 'Unknown location',
    locality: data.locality || '',
    country: data.countryName || 'Unknown country',
    countryCode: data.countryCode || '',
    continent: data.continent || 'Unknown continent',
    continentCode: data.continentCode || '',
    principalSubdivision: data.principalSubdivision || '',
    postcode: data.postcode || '',
    plusCode: data.plusCode || '',
  };
}
