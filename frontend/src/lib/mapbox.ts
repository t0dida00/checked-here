import type mapboxgl from 'mapbox-gl';

export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

export const MAP_STYLES = {
  dark:  'mapbox://styles/mapbox/dark-v11',
  light: 'mapbox://styles/mapbox/light-v11',
} as const;

export type Theme = keyof typeof MAP_STYLES;

export const INITIAL_VIEW = {
  center: [10, 22] as [number, number],
  zoom:   1.8,
  pitch:  0,
  bearing: 0,
};

const DEFAULT_WORLDVIEW = 'US';

const SRC         = 'countries';
const SRC_LAYER   = 'country_boundaries';
const VISITED_FILL_LAYER = 'visited-countries-fill';
const VISITED_LINE_LAYER = 'visited-countries-border';
const FILL_LAYER  = 'countries-fill';
const LINE_LAYER  = 'countries-border';

// ── Atmosphere ────────────────────────────────────────────────

export function applyAtmosphere(map: mapboxgl.Map, theme: Theme) {
  map.setFog(
    theme === 'dark'
      ? {
          color: 'rgb(180, 210, 238)',
          'high-color': 'rgb(28, 80, 210)',
          'horizon-blend': 0.025,
          'space-color': 'rgb(8, 10, 26)',
          'star-intensity': 0.65,
        }
      : {
          color: 'rgb(215, 235, 255)',
          'high-color': 'rgb(90, 155, 225)',
          'horizon-blend': 0.06,
          'space-color': 'rgb(165, 205, 250)',
          'star-intensity': 0,
        },
  );
}

// ── Country layers ────────────────────────────────────────────

function firstSymbolLayerId(map: mapboxgl.Map): string | undefined {
  return map.getStyle().layers?.find((l) => l.type === 'symbol')?.id;
}

function worldviewFilter(worldview: string): mapboxgl.FilterSpecification {
  return [
    'any',
    ['==', ['get', 'worldview'], 'all'],
    ['in', worldview, ['get', 'worldview']],
  ];
}

export function addCountryLayers(map: mapboxgl.Map) {
  if (map.getSource(SRC)) return;

  map.addSource(SRC, {
    type: 'vector',
    url: 'mapbox://mapbox.country-boundaries-v1',
  });

  const before = firstSymbolLayerId(map);

  map.addLayer(
    {
      id: FILL_LAYER,
      type: 'fill',
      source: SRC,
      'source-layer': SRC_LAYER,
      filter: worldviewFilter(DEFAULT_WORLDVIEW),
      paint: {
        'fill-color': '#5b9bf8',
        'fill-opacity': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          0.26,
          0,
        ],
      },
    },
    before,
  );

  map.addLayer(
    {
      id: LINE_LAYER,
      type: 'line',
      source: SRC,
      'source-layer': SRC_LAYER,
      filter: worldviewFilter(DEFAULT_WORLDVIEW),
      paint: {
        'line-color': '#5b9bf8',
        'line-width': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          1.8,
          0.3,
        ],
        'line-opacity': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          0.85,
          0.12,
        ],
      },
    },
    before,
  );
}

export function addVisitedCountryLayers(
  map: mapboxgl.Map,
  countries: string[],
) {
  if (!countries.length) return;

  const uniqueCountries = Array.from(new Set(countries));
  const filter: mapboxgl.FilterSpecification = [
    'any',
    ...uniqueCountries.flatMap((country) => [
      ['==', ['get', 'name_en'], country],
      ['==', ['get', 'name'], country],
    ]),
  ];

  if (!map.getLayer(VISITED_FILL_LAYER)) {
    map.addLayer({
      id: VISITED_FILL_LAYER,
      type: 'fill',
      source: SRC,
      'source-layer': SRC_LAYER,
      filter,
      paint: {
        'fill-color': '#5b9bf8',
        'fill-opacity': 0.18,
      },
    });
  }

  if (!map.getLayer(VISITED_LINE_LAYER)) {
    map.addLayer({
      id: VISITED_LINE_LAYER,
      type: 'line',
      source: SRC,
      'source-layer': SRC_LAYER,
      filter,
      paint: {
        'line-color': '#6faeff',
        'line-width': 1.2,
        'line-opacity': 0.7,
      },
    });
  }
}

// ── Hover state ───────────────────────────────────────────────

export type HoverState = { map: mapboxgl.Map; hoveredId: string | number | null };

export function clearHover(state: HoverState) {
  if (state.hoveredId === null) return;
  state.map.setFeatureState(
    { source: SRC, sourceLayer: SRC_LAYER, id: state.hoveredId },
    { hover: false },
  );
  state.hoveredId = null;
}

export function setHover(
  state: HoverState,
  feature: mapboxgl.MapboxGeoJSONFeature,
): string {
  const id = feature.id as string | number;

  if (state.hoveredId !== null && state.hoveredId !== id) {
    clearHover(state);
  }

  state.hoveredId = id;
  state.map.setFeatureState(
    { source: SRC, sourceLayer: SRC_LAYER, id },
    { hover: true },
  );

  return (
    (feature.properties?.name_en as string | undefined) ??
    (feature.properties?.name as string | undefined) ??
    'Unknown'
  );
}

export function setHoverByCountryName(
  state: HoverState,
  countryName: string,
): boolean {
  const feature = state.map
    .querySourceFeatures(SRC, {
      sourceLayer: SRC_LAYER,
      filter: [
        'any',
        ['==', ['get', 'name_en'], countryName],
        ['==', ['get', 'name'], countryName],
      ],
    })
    .find((item) => item.id !== undefined);

  if (!feature) return false;

  setHover(state, feature);
  return true;
}

// ── Rotation helpers ──────────────────────────────────────────

export function speedToDegsPerFrame(sliderValue: number): number {
  // slider 1–10 → 0.05–0.8 °/frame (~3–48 °/s at 60fps)
  return 0.05 + ((sliderValue - 1) / 9) * 0.75;
}
