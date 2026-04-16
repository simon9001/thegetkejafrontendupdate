// components/property/shared/LocationPicker.tsx
import React, { useState } from 'react';
import { MapPin, LocateFixed, Search, Loader2 } from 'lucide-react';
import Map from './Map';
// import { searchNearbyPlaces } from '../../../services/locationService';

interface LocationPickerProps {
  value: {
    county: string;
    area: string;
    estate_name: string;
    latitude: string;
    longitude: string;
  };
  onChange: (location: any) => void;
}

const LocationPicker: React.FC<LocationPickerProps> = ({ value, onChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [nearbyPlaces, setNearbyPlaces] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mapCenter] = useState<[number, number]>([
    parseFloat(value.longitude) || 36.8219,
    parseFloat(value.latitude) || -1.2921,
  ]);
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(
    value.latitude && value.longitude 
      ? [parseFloat(value.longitude), parseFloat(value.latitude)]
      : null
  );

  const handleMapClick = (lng: number, lat: number) => {
    setMarkerPosition([lng, lat]);
    onChange({
      ...value,
      latitude: lat.toString(),
      longitude: lng.toString(),
    });
    // Reverse geocode to get county/area
    reverseGeocode(lat, lng);
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      
      if (data.address) {
        onChange({
          ...value,
          county: data.address.county || data.address.state || '',
          area: data.address.suburb || data.address.neighbourhood || '',
          latitude: lat.toString(),
          longitude: lng.toString(),
        });
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setMarkerPosition([longitude, latitude]);
        onChange({
          ...value,
          latitude: latitude.toString(),
          longitude: longitude.toString(),
        });
        reverseGeocode(latitude, longitude);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to get your location. Please allow location access.');
      }
    );
  };

  const handleSearchNearby = async () => {
    if (!searchQuery.trim() || !value.latitude || !value.longitude) {
      alert('Please select a location on the map first');
      return;
    }

    setIsSearching(true);
    try {
      /* TODO: locationService not yet implemented */
      setNearbyPlaces([]);
    } catch (error) {
      console.error('Failed to search nearby places:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border p-6">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <MapPin className="w-5 h-5 text-[#ff385c]" />
        Location
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">County *</label>
          <input
            type="text"
            value={value.county}
            onChange={(e) => onChange({...value, county: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="e.g., Nairobi"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Area / Neighborhood</label>
          <input
            type="text"
            value={value.area}
            onChange={(e) => onChange({...value, area: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="e.g., Westlands"
          />
        </div>
        
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Estate / Building Name</label>
          <input
            type="text"
            value={value.estate_name}
            onChange={(e) => onChange({...value, estate_name: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="e.g., Garden Estate"
          />
        </div>
      </div>
      
      {/* Interactive Map */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium">Pin Property Location *</label>
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            className="flex items-center gap-2 text-sm text-[#ff385c] hover:underline"
          >
            <LocateFixed className="w-4 h-4" />
            Use my current location
          </button>
        </div>
        
        <div className="h-[400px] rounded-lg overflow-hidden border">
          <Map
            center={mapCenter}
            zoom={15}
            markerPosition={markerPosition}
            onMapClick={handleMapClick}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Click on the map to pin your property location
        </p>
      </div>
      
      {/* Nearby Places Search */}
      <div className="border-t pt-4">
        <label className="text-sm font-medium mb-2 block">Find Nearby Landmarks</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="e.g., hospital, school, supermarket, matatu stage"
            className="flex-1 px-4 py-2 border rounded-lg"
            onKeyDown={(e) => e.key === 'Enter' && handleSearchNearby()}
          />
          <button
            type="button"
            onClick={handleSearchNearby}
            disabled={isSearching}
            className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </button>
        </div>
        
        {nearbyPlaces.length > 0 && (
          <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
            {nearbyPlaces.map((place, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">{place.name}</p>
                  <p className="text-xs text-gray-500">{place.distance_m}m away • {place.type}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    // Add as nearby place to property
                    console.log('Add nearby place:', place);
                  }}
                  className="text-xs text-[#ff385c]"
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Latitude</label>
          <input
            type="text"
            value={value.latitude}
            readOnly
            className="w-full px-3 py-1.5 bg-gray-50 border rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Longitude</label>
          <input
            type="text"
            value={value.longitude}
            readOnly
            className="w-full px-3 py-1.5 bg-gray-50 border rounded-lg text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;