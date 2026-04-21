import { NextRequest, NextResponse } from 'next/server';

import type { CurrentLocationAnalysis } from '@/lib/api';
import {
  analyzeCoordinateFromBackend,
  saveCheckinToStore,
} from '@/lib/server/locations-store';

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (body?.analysis) {
    const saved = await saveCheckinToStore(body.analysis as CurrentLocationAnalysis);
    return NextResponse.json(saved);
  }

  const coordinate = body?.coordinate;
  const result = await analyzeCoordinateFromBackend(coordinate);
  return NextResponse.json(result);
}
