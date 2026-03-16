// frontend/src/components/Map/MapView.tsx
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapViewProps {
    center: { lat: number; lng: number };
    zoom?: number;
    markers?: Array<{
        id: string | number;
        position: { lat: number; lng: number };
        title: string;
        price?: string;
    }>;
    radius?: number; // in meters
    onCenterChange?: (lat: number, lng: number) => void;
}

// Component to handle map center updates
const ChangeView = ({ center, zoom, onCenterChange }: {
    center: [number, number],
    zoom: number,
    onCenterChange?: (lat: number, lng: number) => void
}) => {
    const map = useMap();

    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);

    useMapEvents({
        moveend: () => {
            if (onCenterChange) {
                const newCenter = map.getCenter();
                onCenterChange(newCenter.lat, newCenter.lng);
            }
        }
    });

    return null;
}

const MapView: React.FC<MapViewProps> = ({
    center,
    zoom = 13,
    markers = [],
    radius,
    onCenterChange
}) => {
    const position: [number, number] = [center.lat, center.lng];

    return (
        <div className="w-full h-full rounded-xl overflow-hidden border border-gray-200 shadow-sm min-h-[400px]">
            <MapContainer
                center={position}
                zoom={zoom}
                scrollWheelZoom={true}
                className="w-full h-full"
            >
                <ChangeView center={position} zoom={zoom} onCenterChange={onCenterChange} />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {radius && (
                    <Circle
                        center={position}
                        radius={radius}
                        pathOptions={{
                            fillColor: '#D4A373',
                            color: '#D4A373',
                            fillOpacity: 0.1
                        }}
                    />
                )}

                {markers.map((marker) => (
                    <Marker key={marker.id} position={[marker.position.lat, marker.position.lng]}>
                        <Popup>
                            <div className="p-1">
                                <h3 className="font-semibold text-sm m-0">{marker.title}</h3>
                                {marker.price && <p className="text-[#D4A373] font-bold text-xs mt-1">{marker.price}</p>}
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default MapView;
