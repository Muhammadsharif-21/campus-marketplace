import { useEffect, useRef, useState } from 'react';

const COMMON_SPOTS = [
  { name: 'Library Entrance', lat: 37.7749, lng: -122.4194 },
  { name: 'Student Union', lat: 37.7752, lng: -122.4180 },
  { name: 'Central Cafeteria', lat: 37.7745, lng: -122.4205 },
  { name: 'Sports Complex', lat: 37.7760, lng: -122.4170 },
  { name: 'Dorm Quad', lat: 37.7740, lng: -122.4185 },
];

function CampusMap({
  initialLat = 37.7749,
  initialLng = -122.4194,
  initialSpotName = 'Campus Central',
  isEditable = false,
  onLocationSelect
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const [lat, setLat] = useState(initialLat || 37.7749);
  const [lng, setLng] = useState(initialLng || -122.4194);
  const [spotName, setSpotName] = useState(initialSpotName || 'Campus Central');
  const [gpsStatus, setGpsStatus] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadLeafletAndInit = async () => {
      // Ensure Leaflet CSS is loaded in document head
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Ensure Leaflet JS is loaded
      if (!window.L) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }

      if (!isMounted || !mapContainerRef.current || !window.L) return;

      const L = window.L;

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current).setView([lat, lng], 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);

        const marker = L.marker([lat, lng], { draggable: isEditable }).addTo(map);
        markerRef.current = marker;

        if (isEditable) {
          marker.on('dragend', () => {
            const position = marker.getLatLng();
            setLat(position.lat);
            setLng(position.lng);
            if (onLocationSelect) {
              onLocationSelect({ spotName, lat: position.lat, lng: position.lng });
            }
          });

          map.on('click', (e) => {
            const { lat: clickLat, lng: clickLng } = e.latlng;
            marker.setLatLng([clickLat, clickLng]);
            setLat(clickLat);
            setLng(clickLng);
            if (onLocationSelect) {
              onLocationSelect({ spotName, lat: clickLat, lng: clickLng });
            }
          });
        }

        mapInstanceRef.current = map;
      }
    };

    loadLeafletAndInit().catch((err) => console.error('Map loading error:', err));

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const handleGetGps = () => {
    if (!navigator.geolocation) {
      setGpsStatus('Geolocation is not supported by your browser.');
      return;
    }

    setGpsStatus('Requesting GPS location permissions...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        setLat(userLat);
        setLng(userLng);
        setGpsStatus('📍 GPS Location acquired!');

        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([userLat, userLng], 16);
        }
        if (markerRef.current) {
          markerRef.current.setLatLng([userLat, userLng]);
        }

        if (onLocationSelect) {
          onLocationSelect({ spotName, lat: userLat, lng: userLng });
        }
      },
      (error) => {
        setGpsStatus(`GPS error: ${error.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSelectPredefinedSpot = (spot) => {
    setSpotName(spot.name);
    setLat(spot.lat);
    setLng(spot.lng);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([spot.lat, spot.lng], 16);
    }
    if (markerRef.current) {
      markerRef.current.setLatLng([spot.lat, spot.lng]);
    }

    if (onLocationSelect) {
      onLocationSelect({ spotName: spot.name, lat: spot.lat, lng: spot.lng });
    }
  };

  return (
    <div className="campus-map-wrapper">
      <div className="map-controls">
        {isEditable && (
          <div className="map-options">
            <button type="button" className="btn-gps" onClick={handleGetGps}>
              📍 Locate Me (Live GPS)
            </button>
            <div className="spot-buttons">
              {COMMON_SPOTS.map((s) => (
                <button
                  key={s.name}
                  type="button"
                  className={`spot-chip ${spotName === s.name ? 'active' : ''}`}
                  onClick={() => handleSelectPredefinedSpot(s)}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        )}
        {gpsStatus && <p className="gps-status">{gpsStatus}</p>}
      </div>

      <div
        ref={mapContainerRef}
        style={{ height: '220px', width: '100%', borderRadius: '8px', marginTop: '8px' }}
      />

      <p className="map-coords-label">
        Location: <strong>{spotName}</strong> ({lat.toFixed(4)}, {lng.toFixed(4)})
      </p>
    </div>
  );
}

export default CampusMap;
