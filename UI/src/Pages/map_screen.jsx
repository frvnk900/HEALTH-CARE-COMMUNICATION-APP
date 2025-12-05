import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { io } from "socket.io-client";
import Sidebar from "../components/menu";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./styles/map.css";

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Create custom Google-style icons
const createCustomIcon = (color = "#4285F4") => {
  return new L.Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg width="25" height="41" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.5 0C5.596 0 0 5.596 0 12.5C0 21.5 12.5 41 12.5 41C12.5 41 25 21.5 25 12.5C25 5.596 19.404 0 12.5 0Z" fill="${color}"/>
        <path d="M12.5 6C9.462 6 7 8.462 7 11.5C7 14.538 9.462 17 12.5 17C15.538 17 18 14.538 18 11.5C18 8.462 15.538 6 12.5 6Z" fill="white"/>
      </svg>
    `)}`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
};

// Blue icon for hospitals
const hospitalIcon = createCustomIcon("#4285F4");
// Red icon for user location
const userLocationIcon = createCustomIcon("#EA4335");
// Green icon for clinics
const clinicIcon = createCustomIcon("#34A853");
// Yellow icon for private facilities
const privateIcon = createCustomIcon("#FBBC05");

export default function MyMap() {
  const [socket, setSocket] = React.useState(null);
  const [isConnected, setIsConnected] = React.useState(false);
  const [userLocation, setUserLocation] = React.useState(null);
  const [allHospitals, setAllHospitals] = React.useState([]);
  const [filteredHospitals, setFilteredHospitals] = React.useState([]);
  const [showFilterModal, setShowFilterModal] = React.useState(false);
  const [filters, setFilters] = React.useState({
    hospitalTypes: {
      referral: true,
      general: true,
      private: true,
      regional: true,
      central: true,
    },
    maxDistance: 50, // in km
    showEmergency: true,
  });
  const mapRef = useRef();

  const getUserIdFromToken = () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("No authentication token found");
      return null;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.user_id;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Get user's current location
  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
        },
        (error) => {
          console.error("Error getting location:", error);
          setUserLocation([-13.9626, 33.7741]); // Lilongwe, Malawi as default
        }
      );
    }
  }, []);

  // Force map to update when container is ready
  React.useEffect(() => {
    if (userLocation && mapRef.current) {
      setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
        const map = mapRef.current;
        if (map) {
          map.invalidateSize();
        }
      }, 100);
    }
  }, [userLocation]);

  // Sample hospital data for Malawi
  React.useEffect(() => {
    if (userLocation) {
      const malawiHospitals = [
        {
          id: 1,
          name: "Kamuzu Central Hospital",
          position: [-13.976944, 33.786389],
          type: "referral",
          category: "Referral / General Hospital",
          distance: calculateDistance(userLocation[0], userLocation[1], -13.976944, 33.786389),
          address: "Mzimba Street, Lilongwe, Malawi",
          tel: "+265 1 754 900",
          hasEmergency: true,
          icon: hospitalIcon
        },
        {
          id: 2,
          name: "Queen Elizabeth Central Hospital",
          position: [-15.7861, 35.0065],
          type: "referral",
          category: "Referral / Teaching Hospital",
          distance: calculateDistance(userLocation[0], userLocation[1], -15.7861, 35.0065),
          address: "Ginnery Corner, Blantyre, Malawi",
          tel: "+265 1 874 333",
          hasEmergency: true,
          icon: hospitalIcon
        },
        {
          id: 3,
          name: "Mwaiwathu Private Hospital",
          position: [-15.786, 35.017],
          type: "private",
          category: "Private Hospital",
          distance: calculateDistance(userLocation[0], userLocation[1], -15.786, 35.017),
          address: "Old Chileka Road, Blantyre, Malawi",
          tel: "+265 999 970 470",
          hasEmergency: true,
          icon: privateIcon
        },
        {
          id: 4,
          name: "Mzuzu Central Hospital",
          position: [-11.4386, 34.0176],
          type: "regional",
          category: "Regional / Central Hospital",
          distance: calculateDistance(userLocation[0], userLocation[1], -11.4386, 34.0176),
          address: "Mzuzu, Northern Region, Malawi",
          tel: "+265 1 320 916",
          hasEmergency: true,
          icon: hospitalIcon
        },
        {
          id: 5,
          name: "Zomba Central Hospital",
          position: [-15.389, 35.324],
          type: "central",
          category: "Central / Referral Hospital",
          distance: calculateDistance(userLocation[0], userLocation[1], -15.389, 35.324),
          address: "Kamuzu Highway, Zomba, Malawi",
          tel: "+265 1 526 266",
          hasEmergency: true,
          icon: hospitalIcon
        },
        {
          id: 6,
          name: "Partners in Hope Medical Center",
          position: [-13.9626, 33.7741],
          type: "private",
          category: "Private Medical Center",
          distance: calculateDistance(userLocation[0], userLocation[1], -13.9626, 33.7741),
          address: "Lilongwe, Malawi",
          tel: "+265 1 751 122",
          hasEmergency: false,
          icon: privateIcon
        },
        {
          id: 7,
          name: "St. Gabriel's Hospital",
          position: [-12.927, 33.597],
          type: "general",
          category: "General Hospital",
          distance: calculateDistance(userLocation[0], userLocation[1], -12.927, 33.597),
          address: "Namitete, Malawi",
          tel: "+265 1 227 000",
          hasEmergency: true,
          icon: clinicIcon
        }
      ];
      setAllHospitals(malawiHospitals);
      setFilteredHospitals(malawiHospitals); // Initially show all
    }
  }, [userLocation]);

  // Apply filters whenever filters change
  React.useEffect(() => {
    if (allHospitals.length > 0) {
      const filtered = allHospitals.filter(hospital => {
        // Filter by hospital type
        const typeMatch = filters.hospitalTypes[hospital.type];
        
        // Filter by distance
        const distanceMatch = hospital.distance <= filters.maxDistance;
        
        // Filter by emergency services
        const emergencyMatch = filters.showEmergency ? true : !hospital.hasEmergency;
        
        return typeMatch && distanceMatch && emergencyMatch;
      });
      
      setFilteredHospitals(filtered);
    }
  }, [filters, allHospitals]);

  // Filter handlers
  const handleFilterToggle = () => {
    setShowFilterModal(!showFilterModal);
  };

  const handleHospitalTypeChange = (type) => {
    setFilters(prev => ({
      ...prev,
      hospitalTypes: {
        ...prev.hospitalTypes,
        [type]: !prev.hospitalTypes[type]
      }
    }));
  };

  const handleMaxDistanceChange = (distance) => {
    setFilters(prev => ({
      ...prev,
      maxDistance: distance
    }));
  };

  const handleEmergencyToggle = () => {
    setFilters(prev => ({
      ...prev,
      showEmergency: !prev.showEmergency
    }));
  };

  const resetFilters = () => {
    setFilters({
      hospitalTypes: {
        referral: true,
        general: true,
        private: true,
        regional: true,
        central: true,
      },
      maxDistance: 50,
      showEmergency: true,
    });
  };

  React.useEffect(() => {
    const user_id = getUserIdFromToken();
    if (!user_id) {
      console.error("No user ID found");
      return;
    }

    const newSocket = io("http://127.0.0.1:8001", {
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      console.log("Connected to server");
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from server");
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.close();
      }
    };
  }, []);

  return (
    <div className="map-root font-display dark">
      {/* Background Image Layer */}
      <div
        className="background-image-layer"
        style={{
          backgroundImage:
            'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAovHvPqau8CimngJH5F2Vs6tgVDFseLijm00uL0AJgEw1lKnuUrC9oY20EcsWgcL-ijBOBsG7o49JO-964fGBn4cp_R2FZGOVZylEdb8WakK1NpPSX8ghuhyozjzOZQv19sgH0EXsWRDrTtERG2fQbdYstbBxueIYs4CJvslTbY903lQpoLShLP4SREPoaF3ZSg5IyJ285pBjKVtlRVmC75fRT3wf2WA6r8-78fFEVuWbLGvBsJI0M1HMm-Pzd-Z6mxkK60U6NHxo")',
        }}
      ></div>

      <div className="background-overlay"></div>

      <div
        className={`connection-status ${
          isConnected ? "connected" : "disconnected"
        }`}
      >
        {isConnected ? "🟢Online" : "🔴Offline"}
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="filter-modal-overlay">
          <div className="filter-modal">
            <div className="filter-header">
              <h3>Filter Healthcare Facilities</h3>
              <button 
                className="close-filter-btn"
                onClick={handleFilterToggle}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="filter-section">
              <h4>Hospital Types</h4>
              <div className="filter-options">
                {Object.entries(filters.hospitalTypes).map(([type, isActive]) => (
                  <label key={type} className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={() => handleHospitalTypeChange(type)}
                    />
                    <span className="checkmark"></span>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <h4>Maximum Distance</h4>
              <div className="distance-slider">
                <input
                  type="range"
                  min="5"
                  max="200"
                  step="5"
                  value={filters.maxDistance}
                  onChange={(e) => handleMaxDistanceChange(parseInt(e.target.value))}
                  className="slider"
                />
                <div className="distance-value">{filters.maxDistance} km</div>
              </div>
            </div>

            <div className="filter-section">
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.showEmergency}
                  onChange={handleEmergencyToggle}
                />
                <span className="checkmark"></span>
                Show Emergency Services Only
              </label>
            </div>

            <div className="filter-actions">
              <button className="filter-btn secondary" onClick={resetFilters}>
                Reset Filters
              </button>
              <button className="filter-btn primary" onClick={handleFilterToggle}>
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="map-container">
        {/* Sidebar Component */}
        <Sidebar />

        <main className="main-content">
          <div className="content-wrapper">
            {/* Map Header */}
            <div className="map-header">
              <h1 className="map-title">Healthcare Facilities Map</h1>
              <p className="map-subtitle">
                {userLocation ? (
                  <>
                    Showing {filteredHospitals.length} facilities within {filters.maxDistance}km
                    {userLocation && (
                      <span className="location-status"> • Location detected</span>
                    )}
                  </>
                ) : (
                  "Find nearby hospitals and healthcare centers"
                )}
              </p>
            </div>

            {/* Map Container */}
            <div className="map-area">
              {userLocation ? (
                <MapContainer
                  center={userLocation}
                  zoom={7}
                  style={{ height: "100%", width: "100%" }}
                  zoomControl={true}
                  className="leaflet-map"
                  ref={mapRef}
                  whenReady={() => {
                    setTimeout(() => {
                      const map = mapRef.current;
                      if (map) {
                        map.invalidateSize();
                      }
                    }, 100);
                  }}
                >
                  {/* Light theme tile layer - OpenStreetMap Standard */}
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />

                  {/* User location marker with red Google-style icon */}
                  <Marker position={userLocation} icon={userLocationIcon}>
                    <Popup>
                      <div className="popup-content">
                        <div className="popup-header">
                          <span className="popup-icon">📍</span>
                          <strong>Your Current Location</strong>
                        </div>
                        <div className="popup-coordinates">
                          {userLocation[0].toFixed(6)},{" "}
                          {userLocation[1].toFixed(6)}
                        </div>
                        <div className="popup-note">
                          We use your location to show nearby healthcare facilities
                        </div>
                      </div>
                    </Popup>
                  </Marker>

                  {/* Hospital markers with filtered results */}
                  {filteredHospitals.map((hospital) => (
                    <Marker
                      key={hospital.id}
                      position={hospital.position}
                      icon={hospital.icon}
                    >
                      <Popup>
                        <div className="popup-content">
                          <div className="popup-header">
                            <span className="popup-icon">🏥</span>
                            <div>
                              <div className="hospital-name">
                                {hospital.name}
                              </div>
                              <div className="hospital-type">
                                {hospital.category}
                              </div>
                            </div>
                          </div>

                          <div className="hospital-info">
                            <div className="info-item">
                              <span className="info-icon">📍</span>
                              <span>{hospital.distance.toFixed(1)} km away</span>
                            </div>
                            <div className="info-item">
                              <span className="info-icon">📞</span>
                              <span>{hospital.tel}</span>
                            </div>
                            {hospital.address && (
                              <div className="info-item">
                                <span className="info-icon">🏢</span>
                                <span className="hospital-address">
                                  {hospital.address}
                                </span>
                              </div>
                            )}
                            {hospital.hasEmergency && (
                              <div className="info-item emergency">
                                <span className="info-icon">🚨</span>
                                <span>24/7 Emergency Services</span>
                              </div>
                            )}
                          </div>

                  
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              ) : (
                <div className="map-loading">
                  <div className="loading-spinner"></div>
                  <p>Loading your location...</p>
                  <p className="loading-subtext">
                    Please allow location access to see nearby healthcare facilities
                  </p>
                </div>
              )}
            </div>

            {/* Map Controls */}
            <div className="map-controls">
              <div className="controls-left">
                <button className="control-btn">
                  <span className="material-symbols-outlined">my_location</span>
                  Current Location
                </button>
                <button className="control-btn">
                  <span className="material-symbols-outlined">search</span>
                  Search Area
                </button>
              </div>
              <div className="controls-right">
                <button 
                  className="control-btn"
                  onClick={handleFilterToggle}
                >
                  <span className="material-symbols-outlined">filter_alt</span>
                  Filter ({filteredHospitals.length})
                </button>
              </div>
            </div>

            {/* Map Legend */}
            <div className="map-legend">
              <div className="legend-title">Map Legend</div>
              <div className="legend-items">
                <div className="legend-item">
                  <div className="legend-color red"></div>
                  <span>Your Location</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color blue"></div>
                  <span>Public Hospitals</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color yellow"></div>
                  <span>Private Hospitals</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color green"></div>
                  <span>Clinics</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}