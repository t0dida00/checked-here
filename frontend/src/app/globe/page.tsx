import dynamic from 'next/dynamic';
import type { Metadata } from 'next';

// Dynamically imported with ssr:false — mapbox-gl uses browser globals
const GlobeMap = dynamic(() => import('@/components/GlobeMap'), { ssr: false });

export const metadata: Metadata = {
  title: 'Globe — Interactive World Map',
  description:
    'An interactive 3-D globe you can rotate, zoom, and explore. Hover over any country to highlight it.',
};

export default function GlobePage() {
  return (
    <main id="globe-main" tabIndex={-1}>
      <GlobeMap />
    </main>
  );
}
