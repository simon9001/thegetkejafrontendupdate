// components/property/shared/Map.tsx
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon issues
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapProps {
  center: [number, number];
  zoom?: number;
  markerPosition?: [number, number] | null;
  onMapClick?: (lng: number, lat: number) => void;
  markers?: Array<{ lng: number; lat: number; title?: string }>;
}

const Map: React.FC<MapProps> = ({ center, zoom = 15, markerPosition, onMapClick, markers = [] }) => {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('property-map').setView([center[1], center[0]], zoom);
      
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; CartoDB',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(mapRef.current);
      
      if (onMapClick) {
        mapRef.current.on('click', (e: L.LeafletMouseEvent) => {
          onMapClick(e.latlng.lng, e.latlng.lat);
        });
      }
    }
    
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update marker position
  useEffect(() => {
    if (!mapRef.current) return;
    
    if (markerPosition) {
      if (markerRef.current) {
        markerRef.current.setLatLng([markerPosition[1], markerPosition[0]]);
      } else {
        markerRef.current = L.marker([markerPosition[1], markerPosition[0]])
          .addTo(mapRef.current)
          .bindPopup('Property Location')
          .openPopup();
      }
      mapRef.current.setView([markerPosition[1], markerPosition[0]], zoom);
    } else if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
  }, [markerPosition, zoom]);

  // Update multiple markers for search results
  useEffect(() => {
    if (!mapRef.current) return;
    
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    
    markers.forEach(marker => {
      const m = L.marker([marker.lat, marker.lng])
        .addTo(mapRef.current!)
        .bindPopup(marker.title || 'Location');
      markersRef.current.push(m);
    });
  }, [markers]);

  return <div id="property-map" style={{ height: '100%', width: '100%' }} />;
};

export default Map;