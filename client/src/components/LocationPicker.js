import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function MapClickHandler({ onChange, disabled }) {
  useMapEvents({
    click(e) {
      if (!disabled) {
        onChange([e.latlng.lng, e.latlng.lat]);
      }
    },
  });
  return null;
}

function LocationPicker({ value, onChange, disabled = false }) {
  const mapRef = useRef(null);
  const hasValue = value && value.length === 2;
  // value is [lon, lat], Leaflet uses [lat, lon]
  const position = hasValue ? [value[1], value[0]] : null;

  useEffect(() => {
    if (mapRef.current && position) {
      mapRef.current.flyTo(position, 13);
    }
  }, [position]);

  return (
    <Box>
      <MapContainer
        center={[41.9, 12.5]}
        zoom={6}
        style={{ height: 300, width: '100%', borderRadius: 8 }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onChange={onChange} disabled={disabled} />
        {position && <Marker position={position} />}
      </MapContainer>
      {hasValue && (
        <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
          Coordinate: {value[1].toFixed(5)}, {value[0].toFixed(5)}
        </Typography>
      )}
    </Box>
  );
}

export default LocationPicker;
