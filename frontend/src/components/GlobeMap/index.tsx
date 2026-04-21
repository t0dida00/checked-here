'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';

import BottomControls from '@/components/BottomControls';
import locationsData from '@/data/locations.json';
import {
  INITIAL_VIEW,
  MAPBOX_TOKEN,
  MAP_STYLES,
  addCountryLayers,
  addVisitedCountryLayers,
  applyAtmosphere,
  clearHover,
  setHover,
  setHoverByCountryName,
  speedToDegsPerFrame,
  type HoverState,
  type Theme,
} from '@/lib/mapbox';

import styles from './index.module.scss';

interface TooltipState {
  name: string;
  x: number;
  y: number;
  visible: boolean;
}

interface LocationItem {
  coordinate: {
    lat: number;
    lng: number;
  };
  logo: string;
  createdAt: string;
  city: string;
  country: string;
  continent: string;
}

const DEFAULT_ROTATION_SPEED = speedToDegsPerFrame(3);

const LOCATION_ITEMS = locationsData.locations as LocationItem[];
const VISITED_COUNTRIES = LOCATION_ITEMS.map((item) => item.country);

const SUMMARY_STATS = [
  { label: 'Cities', value: String(LOCATION_ITEMS.length) },
  {
    label: 'Countries',
    value: String(new Set(LOCATION_ITEMS.map((item) => item.country)).size),
  },
  {
    label: 'Continents',
    value: String(new Set(LOCATION_ITEMS.map((item) => item.continent)).size),
  },
] as const;

export default function GlobeMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import('mapbox-gl').Map | null>(null);
  const markersRef = useRef<
    Array<{
      marker: mapboxgl.Marker;
      element: HTMLElement;
      location: LocationItem;
    }>
  >([]);
  const clustersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);
  const hoverRef = useRef<HoverState>({ map: null as never, hoveredId: null });
  const markerHoverRef = useRef(false);
  const rotatingRef = useRef(false);

  const [theme, setTheme] = useState<Theme>('dark');
  const [rotating, setRotating] = useState(false);
  const [tooltip, setTooltip] = useState<TooltipState>({
    name: '',
    x: 0,
    y: 0,
    visible: false,
  });

  const stopRotation = useCallback(() => {
    rotatingRef.current = false;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    lastFrameRef.current = null;
    setRotating(false);
  }, []);

  const startRotation = useCallback(() => {
    if (rotatingRef.current || !mapRef.current) return;

    rotatingRef.current = true;
    setRotating(true);

    const tick = (timestamp: number) => {
      if (!rotatingRef.current || !mapRef.current) return;

      const lastFrame = lastFrameRef.current ?? timestamp;
      const deltaSeconds = Math.min((timestamp - lastFrame) / 1000, 0.05);
      lastFrameRef.current = timestamp;

      const center = mapRef.current.getCenter();
      mapRef.current.setCenter([
        center.lng - DEFAULT_ROTATION_SPEED * 60 * deltaSeconds,
        center.lat,
      ]);

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const toggleRotation = useCallback(() => {
    if (rotatingRef.current) stopRotation();
    else startRotation();
  }, [startRotation, stopRotation]);

  const updateClustering = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    const CLUSTER_RADIUS = 70; 
    const center = map.getCenter();
    const toRadians = (v: number) => (v * Math.PI) / 180;
    
    // Identify visible markers
    const visibleMarkers = markersRef.current.filter(({ location }) => {
      const centerLat = toRadians(center.lat);
      const pointLat = toRadians(location.coordinate.lat);
      const deltaLng = toRadians(((location.coordinate.lng - center.lng + 540) % 360) - 180);
      return Math.sin(centerLat)*Math.sin(pointLat) + Math.cos(centerLat)*Math.cos(pointLat)*Math.cos(deltaLng) > 0;
    });

    // Project screen positions
    const projectionData = visibleMarkers.map(m => ({
      ...m,
      pos: map.project([m.location.coordinate.lng, m.location.coordinate.lat])
    }));

    // Cluster algorithm
    const processed = new Set();
    const clusters: any[] = [];
    projectionData.forEach((m, i) => {
      if (processed.has(i)) return;
      processed.add(i);
      let group = [m];
      projectionData.forEach((other, j) => {
        if (processed.has(j)) return;
        if (Math.hypot(m.pos.x - other.pos.x, m.pos.y - other.pos.y) < CLUSTER_RADIUS) {
          processed.add(j);
          group.push(other);
        }
      });
      clusters.push(group);
    });

    const nextClusters: { [key: string]: mapboxgl.Marker } = {};
    const visiblePinSet = new Set<string>();

    clusters.forEach(group => {
      if (group.length === 1) {
        // Individual Pin
        const pin = group[0];
        pin.element.style.display = 'block';
        visiblePinSet.add(pin.location.city);
      } else {
        // Cluster Bubble
        group.forEach(p => p.element.style.display = 'none');
        
        const clusterId = group.map(m => m.location.city).sort().join('|');
        const representative = group[0].location;
        const count = group.length;

        if (clustersRef.current[clusterId]) {
          // Reuse existing cluster marker
          nextClusters[clusterId] = clustersRef.current[clusterId];
          nextClusters[clusterId].setLngLat([representative.coordinate.lng, representative.coordinate.lat]);
          delete clustersRef.current[clusterId];
        } else {
          // Create new cluster marker
          const el = document.createElement('div');
          el.className = styles.clusterMarker;
          if (count > 5) el.classList.add(styles.clusterLarge);
          else if (count > 2) el.classList.add(styles.clusterMedium);

          const img = document.createElement('img');
          img.src = representative.logo;
          img.className = styles.clusterRepresentative;
          
          const badge = document.createElement('div');
          badge.className = styles.clusterBadge;
          badge.textContent = `+${count - 1}`;
          
          el.append(img, badge);

          el.addEventListener('click', () => {
            const lats = group.map(m => m.location.coordinate.lat);
            const lngs = group.map(m => m.location.coordinate.lng);
            map.fitBounds([[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]], { padding: 100, maxZoom: 12 });
          });

          const m = new mapboxgl.Marker({ element: el, anchor: 'center' })
            .setLngLat([representative.coordinate.lng, representative.coordinate.lat])
            .addTo(map);
          nextClusters[clusterId] = m;
        }
      }
    });

    // Clean up invisible markers and detached clusters
    Object.values(clustersRef.current).forEach(c => c.remove());
    clustersRef.current = nextClusters;

    markersRef.current.forEach(m => {
      if (!visiblePinSet.has(m.location.city)) m.element.style.display = 'none';
    });
  }, []);

  const mountMarkers = useCallback((map: mapboxgl.Map) => {
    if (markersRef.current.length > 0) return;
    markersRef.current = LOCATION_ITEMS.map((location) => {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = styles.markerPin;
      const inner = document.createElement('div');
      inner.className = styles.markerInner;
      const img = document.createElement('img');
      img.className = styles.markerImage;
      img.src = location.logo;
      const label = document.createElement('span');
      label.className = styles.markerLabel;
      label.textContent = location.city;
      inner.append(img);
      el.append(inner, label);
      el.addEventListener('mouseenter', () => {
        markerHoverRef.current = true;
        hoverRef.current = { map, hoveredId: hoverRef.current.hoveredId };
        setHoverByCountryName(hoverRef.current, location.country);
        setTooltip(c => ({ ...c, visible: false }));
      });
      el.addEventListener('mouseleave', () => { markerHoverRef.current = false; clearHover(hoverRef.current); });
      const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' }).setLngLat([location.coordinate.lng, location.coordinate.lat]).addTo(map);
      return { marker, element: el, location };
    });
    updateClustering();
  }, [updateClustering]);

  const setupLayersAndHover = useCallback((map: import('mapbox-gl').Map, currentTheme: Theme) => {
    applyAtmosphere(map, currentTheme);
    addCountryLayers(map);
    addVisitedCountryLayers(map, VISITED_COUNTRIES);
    mountMarkers(map);
    hoverRef.current = { map, hoveredId: null };
    map.on('mousemove', 'countries-fill', (e) => {
      if (markerHoverRef.current || !e.features?.length) return;
      map.getCanvas().style.cursor = 'pointer';
      const name = setHover(hoverRef.current, e.features[0]);
      setTooltip({ name, x: e.originalEvent.clientX, y: e.originalEvent.clientY, visible: true });
    });
    map.on('mouseleave', 'countries-fill', () => {
      map.getCanvas().style.cursor = '';
      clearHover(hoverRef.current);
      setTooltip(c => ({ ...c, visible: false }));
    });
    map.on('mousedown', () => { if (rotatingRef.current) stopRotation(); });
    map.on('move', updateClustering);
  }, [mountMarkers, stopRotation, updateClustering]);

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: MAP_STYLES.dark,
      center: INITIAL_VIEW.center,
      zoom: INITIAL_VIEW.zoom,
      projection: 'globe',
      antialias: true,
    });
    mapRef.current = map;
    map.once('style.load', () => { setupLayersAndHover(map, 'dark'); startRotation(); });
    return () => {
      stopRotation();
      markersRef.current.forEach(m => m.marker.remove());
      Object.values(clustersRef.current).forEach(c => c.remove());
      map.remove();
      mapRef.current = null;
    };
  }, [setupLayersAndHover, startRotation, stopRotation]);

  const handleThemeToggle = useCallback(() => {
    const map = mapRef.current; if (!map) return;
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme); document.documentElement.setAttribute('data-theme', nextTheme);
    stopRotation(); map.setStyle(MAP_STYLES[nextTheme]);
    map.once('style.load', () => setupLayersAndHover(map, nextTheme));
  }, [theme, setupLayersAndHover, stopRotation]);

  const handleReset = useCallback(() => { stopRotation(); mapRef.current?.flyTo({ ...INITIAL_VIEW, duration: 1400 }); }, [stopRotation]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => setTooltip(c => c.visible ? { ...c, x: e.clientX, y: e.clientY } : c);
    window.addEventListener('mousemove', onMove); return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <>
      <div ref={containerRef} className={styles.map} role="application" />
      <section className={styles.stats} aria-label="World overview statistics">
        <article className={styles.statCard}>
          <div className={styles.statList}>
            {SUMMARY_STATS.map((stat) => (
              <div key={stat.label} className={styles.statItem}>
                <span className={styles.statLabel}>{stat.label}</span>
                <strong className={styles.statValue}>{stat.value}</strong>
              </div>
            ))}
          </div>
        </article>
      </section>
      <BottomControls rotating={rotating} theme={theme} onRotateToggle={toggleRotation} onReset={handleReset} onThemeToggle={handleThemeToggle} />
      <div className={`${styles.tooltip} ${tooltip.visible ? styles.tooltipVisible : ''}`} role="tooltip" style={{ left: tooltip.x + 14, top: tooltip.y - 44 }}>
        {tooltip.name}
      </div>
    </>
  );
}
