import { NextResponse } from 'next/server';
import { getStoredLocations } from '@/lib/server/locations-store';

export async function GET() {
  const locationsData = await getStoredLocations();
  return NextResponse.json(locationsData);
}
