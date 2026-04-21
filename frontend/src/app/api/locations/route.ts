import { NextResponse } from 'next/server';
import locationsData from '@/data/locations.json';

export async function GET() {
  return NextResponse.json(locationsData);
}
