import { useQuery } from '@tanstack/react-query';
import { fetchLocations, type LocationsResponse } from '@/lib/api';
export type { LocationItem } from '@/lib/api';

export const locationsQueryKey = ['locations'] as const;

export function useLocations() {
  return useQuery<LocationsResponse>({
    queryKey: locationsQueryKey,
    queryFn: fetchLocations,
    staleTime: 5 * 60 * 1000,
  });
}
