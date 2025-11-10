'use client';
import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { fetchStationsInBounds, getAQIColor } from '../lib/aqicn';

export default function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '\u00A9 OpenStreetMap',
          },
        },
        layers: [{ id: 'osm-tiles', type: 'raster', source: 'osm-tiles' }],
      },
      center: [11.9746, 57.7089],
      zoom: 12,
      maxZoom: 15,
      minZoom: 8,
      maxBounds: [
        [11.4, 57.4],
        [12.5, 58.0],
      ],
    });

    map.current.on('load', async () => {
      try {
        const stations = await fetchStationsInBounds(57.4, 11.4, 58.0, 12.5);
        stations.forEach((s) => {
          const aqi = parseInt(s.aqi) || 0;
          const color = getAQIColor(aqi);

          const el = document.createElement('div');
          el.className = 'w-6 h-6 rounded-full border-2 border-white cursor-pointer shadow-md';
          el.style.backgroundColor = color;

          const popup = document.createElement('div');
          popup.className = 'font-mono text-xs min-w-[100px]';
          popup.innerHTML = `
            <strong style="color: #000000">${s.station.name}</strong>
            <div class="p-1 rounded my-1 text-center ${aqi > 100 ? 'text-white' : 'text-black'}" style="background-color: ${color}">
              AQI: <strong>${s.aqi}</strong>
            </div>
          `;

          new maplibregl.Marker({ element: el })
            .setLngLat([s.lon, s.lat])
            .setPopup(new maplibregl.Popup({ offset: 15, closeButton: false }).setDOMContent(popup))
            .addTo(map.current!);
        });
      } catch (error) {
        console.error('Failed to fetch air quality data:', error);
      }
    });

    return () => map.current?.remove();
  }, []);

  return <div ref={mapContainer} className="h-screen w-full" />;
}
