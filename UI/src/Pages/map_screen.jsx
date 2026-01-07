import React, { useEffect, useState, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import {
  IoMdPin,
  IoMdMedical,
  IoMdBusiness,
  IoMdSchool,
  IoMdClose,
  IoMdMenu,
} from "react-icons/io";
import {
  FaMapMarkedAlt,
  FaDirections,
  FaSearch,
  FaFilter,
  FaHospital,
  FaClinicMedical,
  FaAmbulance,
  FaLocationArrow,
  FaSatellite,
  FaMap,
  FaMountain,
  FaLayerGroup,
} from "react-icons/fa";
import { GiHospitalCross, GiHamburgerMenu } from "react-icons/gi";
import Sidebar from "../components/menu";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./styles/map.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const createCustomIcon = (color = "#4285F4", iconType = "hospital") => {
  return new L.DivIcon({
    html: `
      <div style="
        background: ${color};
        width: ${iconType === "emergency" ? "30px" : "24px"};
        height: ${iconType === "emergency" ? "30px" : "24px"};
        border-radius: ${iconType === "emergency" ? "50%" : "50% 50% 50% 0"};
        transform: rotate(-45deg);
        position: relative;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        border: 2px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          font-weight: bold;
          font-size: ${iconType === "emergency" ? "14px" : "10px"};
        ">
          ${iconType === "emergency" ? "E" : "H"}
        </div>
        ${
          iconType === "user"
            ? `
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 40px;
            height: 40px;
            background: ${color}30;
            border-radius: 50%;
            animation: pulse 2s infinite;
          "></div>
        `
            : ""
        }
      </div>
    `,
    iconSize: iconType === "emergency" ? [30, 30] : [24, 24],
    iconAnchor: iconType === "emergency" ? [15, 15] : [12, 24],
    popupAnchor: [0, -24],
    className: "custom-marker",
  });
};

const iconBlue = createCustomIcon("#4285F4");
const iconRed = createCustomIcon("#EA4335", "user");
const iconGreen = createCustomIcon("#34A853");
const iconYellow = createCustomIcon("#FBBC05");
const iconEmergency = createCustomIcon("#FF0000", "emergency");

const MAPTILER_API_KEY = "7oqR6pee7i9WcySKn3qm";

const mapLayers = {
  Satellite: {
    url: `https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=${MAPTILER_API_KEY}`,
    attribution: "© MapTiler © OpenStreetMap contributors",
    icon: <FaSatellite />,
  },
  Street: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "© OpenStreetMap contributors",
    icon: <FaMap />,
  },
  Terrain: {
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: "© OpenStreetMap contributors",
    icon: <FaMountain />,
  },
};

function MapUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom, { animate: true });
    }
  }, [center, zoom, map]);
  return null;
}

export default function MyMap() {
  const mapRef = useRef();
  const [userLocation, setUserLocation] = useState(null);
  const [allHospitals, setAllHospitals] = useState([]);
  const [filteredHospitals, setFilteredHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentMapLayer, setCurrentMapLayer] = useState("Satellite");
  const [mapCenter, setMapCenter] = useState([-13.9626, 33.7741]);
  const [mapZoom, setMapZoom] = useState(7);
  const [filters, setFilters] = useState({
    hospitalTypes: { referral: true, general: true, private: true },
    maxDistance: 1000, // Changed from 50 to 1000
    showEmergency: true,
  });
  const [isFiltersPanelOpen, setIsFiltersPanelOpen] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          setMapCenter([latitude, longitude]);
          setMapZoom(12);
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  useEffect(() => {
    const malawiHospitals = [
      {
        id: 1,
        name: "Kamuzu Central Hospital",
        position: [-13.976944, 33.786389],
        type: "referral",
        category: "Central Hospital",
        address: "Mzimba Street, Lilongwe",
        tel: "+265 1 754 900",
        hasEmergency: true,
        services: ["Emergency", "Surgery", "Pediatrics", "Internal Medicine"],
      },
      {
        id: 27,
        name: "Efata Health Centre",
        position: [-13.812, 33.905],
        type: "general",
        category: "Health Centre",
        address: "Dzaleka Area, Dowa",
        tel: "N/A (DHO Contact)",
        hasEmergency: false,
        services: ["OPD", "Maternity", "Vaccination", "Child Health"],
      },

      {
        id: 28,
        name: "Ntchisi District Hospital",
        position: [-13.384, 34.015],
        type: "general",
        category: "District Hospital",
        address: "Ntchisi Boma",
        tel: "+265 1 243 222",
        hasEmergency: true,
        services: ["Emergency", "Surgery", "Maternity", "General Medicine"],
      },

      {
        id: 29,
        name: "Salima District Hospital",
        position: [-13.7804, 34.457],
        type: "general",
        category: "District Hospital",
        address: "Salima Boma",
        tel: "+265 1 262 333",
        hasEmergency: true,
        services: ["Emergency", "Maternity", "Inpatient", "OPD"],
      },

      {
        id: 30,
        name: "Balaka District Hospital",
        position: [-14.988, 34.955],
        type: "general",
        category: "District Hospital",
        address: "Balaka",
        tel: "+265 1 552 444",
        hasEmergency: true,
        services: ["Emergency", "Maternity", "General OPD"],
      },

      {
        id: 31,
        name: "Mangochi District Hospital",
        position: [-14.478, 35.264],
        type: "general",
        category: "District Hospital",
        address: "Mangochi",
        tel: "+265 1 592 222",
        hasEmergency: true,
        services: ["Emergency", "Maternity", "Surgery", "Child Health"],
      },

      {
        id: 32,
        name: "Neno District Hospital",
        position: [-15.489, 34.721],
        type: "general",
        category: "District Hospital",
        address: "Neno Boma",
        tel: "N/A",
        hasEmergency: true,
        services: ["Emergency", "Maternity", "OPD", "Inpatient"],
      },

      {
        id: 33,
        name: "Rumphi District Hospital",
        position: [-11.018, 33.863],
        type: "general",
        category: "District Hospital",
        address: "Rumphi Boma",
        tel: "+265 1 342 222",
        hasEmergency: true,
        services: ["Emergency", "Surgery", "Maternity", "General Medicine"],
      },

      {
        id: 34,
        name: "Nkhata Bay District Hospital",
        position: [-11.606, 34.295],
        type: "general",
        category: "District Hospital",
        address: "Nkhata Bay",
        tel: "+265 1 395 333",
        hasEmergency: true,
        services: ["Emergency", "Maternity", "Surgery", "OPD"],
      },

      {
        id: 35,
        name: "Chitipa District Hospital",
        position: [-9.715, 33.27],
        type: "general",
        category: "District Hospital",
        address: "Chitipa Boma",
        tel: "+265 1 365 111",
        hasEmergency: true,
        services: ["Emergency", "General OPD", "Maternity"],
      },

      {
        id: 36,
        name: "Likuni Mission Hospital",
        position: [-13.994, 33.699],
        type: "cham",
        category: "Mission Hospital",
        address: "Likuni, Lilongwe",
        tel: "+265 1 755 222",
        hasEmergency: true,
        services: ["Emergency", "Surgery", "Maternity", "Pediatrics", "OPD"],
      },

      {
        id: 37,
        name: "Mtengowanthenga Mission Hospital",
        position: [-14.171, 33.818],
        type: "cham",
        category: "Mission Hospital",
        address: "Mtengowanthenga, Dowa",
        tel: "+265 1 233 600",
        hasEmergency: true,
        services: ["Emergency", "Maternity", "Surgery", "HIV/ART"],
      },

      {
        id: 38,
        name: "Muloza Health Centre",
        position: [-16.037, 35.701],
        type: "general",
        category: "Health Centre",
        address: "Mulanje",
        tel: "N/A",
        hasEmergency: false,
        services: ["OPD", "Maternity", "Child Health"],
      },

      {
        id: 39,
        name: "Namitambo Health Centre",
        position: [-15.672, 35.311],
        type: "general",
        category: "Health Centre",
        address: "Chiradzulu",
        tel: "N/A",
        hasEmergency: false,
        services: ["OPD", "Maternity", "Vaccination"],
      },

      {
        id: 40,
        name: "Machinga District Hospital",
        position: [-14.978, 35.524],
        type: "general",
        category: "District Hospital",
        address: "Machinga Boma",
        tel: "+265 1 430 444",
        hasEmergency: true,
        services: ["Emergency", "OPD", "Maternity", "Inpatient"],
      },
      {
        id: 2,
        name: "Queen Elizabeth Central Hospital",
        position: [-15.7861, 35.0065],
        type: "referral",
        category: "Teaching Hospital",
        address: "Ginnery Corner, Blantyre",
        tel: "+265 1 874 333",
        hasEmergency: true,
        services: ["Emergency", "ICU", "Cancer Treatment", "Orthopedics"],
      },
      {
        id: 3,
        name: "Mzuzu Central Hospital",
        position: [-11.4386, 34.0176],
        type: "referral",
        category: "Central Hospital",
        address: "Mzuzu, Northern Region",
        tel: "+265 1 320 916",
        hasEmergency: true,
        services: ["Emergency", "Medicine", "Surgery", "Specialised Clinics"],
      },
      {
        id: 4,
        name: "Zomba Central Hospital",
        position: [-15.389, 35.324],
        type: "referral",
        category: "Central Hospital",
        address: "Kamuzu Highway, Zomba",
        tel: "+265 1 526 266",
        hasEmergency: true,
        services: ["Emergency", "Surgery", "Maternity", "Outpatient Care"],
      },

      {
        id: 5,
        name: "Mwaiwathu Private Hospital",
        position: [-15.786, 35.017],
        type: "private",
        category: "Private Hospital",
        address: "Old Chileka Road, Blantyre",
        tel: "+265 1 822 999",
        hasEmergency: true,
        services: [
          "Emergency",
          "Cardiology",
          "Diagnostics",
          "Specialist Consultations",
        ],
      },
      {
        id: 6,
        name: "Blantyre Adventist Hospital",
        position: [-15.7766, 35.0039],
        type: "private/cham",
        category: "Private/Mission Hospital",
        address: "Robins Road, Blantyre",
        tel: "+265 1 820 113",
        hasEmergency: true,
        services: [
          "Emergency",
          "General and Specialised OPD",
          "Dentistry",
          "Surgery",
        ],
      },
      {
        id: 7,
        name: "Daeyang Luke Hospital",
        position: [-13.9317, 33.7663],
        type: "private/cham",
        category: "Mission Hospital",
        address: "M1, Lilongwe (Kanengo)",
        tel: "+265 1 771 390",
        hasEmergency: true,
        services: [
          "Emergency",
          "General Surgery",
          "Internal Medicine",
          "Maternity",
        ],
      },
      {
        id: 8,
        name: "Partners in Hope Medical Center",
        position: [-13.9626, 33.7741],
        type: "private",
        category: "Medical Center",
        address: "Lilongwe",
        tel: "+265 1 751 122",
        hasEmergency: false,
        services: ["HIV Care", "TB Treatment", "Dermatology", "Laboratory"],
      },
      {
        id: 9,
        name: "Lilongwe Private Clinic",
        position: [-13.957, 33.772],
        type: "private",
        category: "Private Clinic",
        address: "Area 10, Lilongwe",
        tel: "+265 888 861 486",
        hasEmergency: false,
        services: ["General OPD", "Diagnostics", "Preventative Care"],
      },
      {
        id: 10,
        name: "Beit Cure International Hospital",
        position: [-15.795, 35.025],
        type: "private",
        category: "Specialized Hospital",
        address: "Blantyre",
        tel: "+265 1 878 277",
        hasEmergency: true,
        services: ["Orthopedic Surgery", "Rehabilitation", "Pediatric Care"],
      },

      {
        id: 11,
        name: "Bwaila District Hospital",
        position: [-13.961, 33.793],
        type: "general",
        category: "District Hospital",
        address: "Lilongwe",
        tel: "+265 1 757 XXX",
        hasEmergency: true,
        services: ["Emergency", "Maternity", "General OPD", "TB/HIV Care"],
      },
      {
        id: 12,
        name: "Chikwawa District Hospital",
        position: [-16.035, 34.795],
        type: "general",
        category: "District Hospital",
        address: "Chikwawa",
        tel: "+265 1 427 XXX",
        hasEmergency: true,
        services: ["Emergency", "Maternity", "Immunization"],
      },
      {
        id: 13,
        name: "Dedza District Hospital",
        position: [-14.339, 34.348],
        type: "general",
        category: "District Hospital",
        address: "Dedza",
        tel: "+265 1 223 XXX",
        hasEmergency: true,
        services: ["Emergency", "Surgery", "Inpatient Care"],
      },
      {
        id: 14,
        name: "Kasungu District Hospital",
        position: [-13.036, 33.486],
        type: "general",
        category: "District Hospital",
        address: "Kasungu",
        tel: "+265 1 253 XXX",
        hasEmergency: true,
        services: ["Emergency", "Outpatient Care", "Trauma"],
      },
      {
        id: 15,
        name: "Karonga District Hospital",
        position: [-9.936, 33.929],
        type: "general",
        category: "District Hospital",
        address: "Karonga",
        tel: "+265 1 364 XXX",
        hasEmergency: true,
        services: ["Emergency", "Maternity", "General Medicine"],
      },

      {
        id: 16,
        name: "Nkhoma Mission Hospital",
        position: [-14.128, 33.987],
        type: "cham",
        category: "Mission Hospital",
        address: "Nkhoma, Lilongwe",
        tel: "+265 1 270 200",
        hasEmergency: true,
        services: ["Emergency", "Surgery", "Community Health", "Maternity"],
      },
      {
        id: 17,
        name: "Malamulo General Hospital",
        position: [-16.069, 35.127],
        type: "cham",
        category: "Mission Hospital",
        address: "Thyolo",
        tel: "+265 1 475 XXX",
        hasEmergency: true,
        services: ["Emergency", "General Medicine", "Dental", "Training"],
      },
      {
        id: 18,
        name: "Ekwendeni Mission Hospital",
        position: [-11.171, 33.844],
        type: "cham",
        category: "Mission Hospital",
        address: "Ekwendeni, Mzimba",
        tel: "+265 1 339 222",
        hasEmergency: true,
        services: ["Emergency", "Maternity", "HIV/AIDS Program"],
      },
      {
        id: 19,
        name: "St. Gabriel's General Hospital",
        position: [-12.927, 33.597],
        type: "cham",
        category: "General Hospital",
        address: "Namitete, Lilongwe",
        tel: "+265 1 227 000",
        hasEmergency: true,
        services: ["Emergency", "Maternity", "Pediatrics", "Surgery"],
      },
      {
        id: 20,
        name: "Mulanje Mission Hospital",
        position: [-16.059, 35.485],
        type: "cham",
        category: "Mission Hospital",
        address: "Mulanje",
        tel: "+265 1 462 XXX",
        hasEmergency: true,
        services: ["Emergency", "General Inpatient", "Opthalmology"],
      },
      {
        id: 1,
        name: "Dowa District Hospital",
        position: [-13.65508, 33.93689],
        type: "general",
        category: "District Hospital",
        address: "Dowa Boma",
        tel: "+265 1 282 220",
        hasEmergency: true,
        services: [
          "Emergency",
          "Surgery",
          "General Medicine",
          "Maternity",
          "Clinical Services",
        ],
      },

      // Christian Health Association of Malawi (CHAM) Hospitals
      {
        id: 2,
        name: "Madisi Mission Hospital",
        position: [-13.398, 33.84],
        type: "cham",
        category: "Mission Hospital",
        address: "P.O. Box 30, Madisi, Dowa",
        tel: "+265 1 254 XXX",
        hasEmergency: true,
        services: [
          "Emergency",
          "Maternity",
          "General Medicine",
          "Outpatient Care",
          "TB/HIV Care",
        ],
      },
      {
        id: 3,
        name: "Mponela Rural Hospital",
        position: [-13.5397, 33.7229],
        type: "general",
        category: "Rural Hospital (Government)",
        address: "Mponela Trading Centre, Dowa",
        tel: "+265 1 285 XXX",
        hasEmergency: true,
        services: ["Emergency", "Maternity", "Immunization", "General OPD"],
      },
      {
        id: 4,
        name: "Mthengathenga Hospital (Francisco Palau)",
        position: [-13.785, 33.743],
        type: "cham",
        category: "Mission Hospital",
        address: "P/Bag 63, Lumbadzi",
        tel: "+265 1 230 XXX",
        hasEmergency: true,
        services: ["Emergency", "Maternity", "General Surgery", "Pediatrics"],
      },
      {
        id: 5,
        name: "Mvera Mission Health Centre",
        position: [-13.63, 34.07],
        type: "cham",
        category: "Health Centre",
        address: "Mvera, Dowa",
        tel: "+265 1 282 XXX",
        hasEmergency: false,
        services: ["Maternity", "OPD", "Immunization", "Family Planning"],
      },

      // Key Government and Community Health Centres
      {
        id: 6,
        name: "Bowe Health Centre",
        position: [-13.67, 33.98],
        type: "general",
        category: "Health Centre",
        address: "Bowe, Dowa",
        tel: "N/A (DHO Contact)",
        hasEmergency: false,
        services: ["OPD", "Maternity", "Immunization"],
      },
      {
        id: 7,
        name: "Chakhadza Health Centre",
        position: [-13.444305, 33.646832],
        type: "general",
        category: "Health Centre",
        address: "Chakhadza, Dowa",
        tel: "N/A (DHO Contact)",
        hasEmergency: false,
        services: ["OPD", "Maternity", "HIV/AIDS Services"],
      },
      {
        id: 8,
        name: "Chankhungu Health Centre",
        position: [-13.765, 34.014694],
        type: "general",
        category: "Health Centre",
        address: "Chankhungu, Dowa",
        tel: "N/A (DHO Contact)",
        hasEmergency: false,
        services: ["OPD", "Maternity", "Vaccination"],
      },
      {
        id: 9,
        name: "Chinkhwiri Health Centre",
        position: [-13.49, 33.79],
        type: "general",
        category: "Health Centre",
        address: "Chinkhwiri, Dowa",
        tel: "N/A (DHO Contact)",
        hasEmergency: false,
        services: ["OPD", "Maternity", "Child Health"],
      },
      {
        id: 10,
        name: "Chisepo Health Centre",
        position: [-13.56, 34.02],
        type: "general",
        category: "Health Centre",
        address: "Chisepo, Dowa",
        tel: "N/A (DHO Contact)",
        hasEmergency: false,
        services: ["OPD", "Maternity", "Family Planning"],
      },
      {
        id: 11,
        name: "Dzaleka Health Centre",
        position: [-13.81, 33.87],
        type: "general",
        category: "Health Centre (Refugee Area)",
        address: "Dzaleka Refugee Camp, Dowa",
        tel: "N/A (DHO Contact)",
        hasEmergency: false,
        services: ["OPD", "Maternity", "Disease Surveillance"],
      },
      {
        id: 12,
        name: "Dzoole Health Centre",
        position: [-13.71, 33.84],
        type: "general",
        category: "Health Centre",
        address: "Dzoole, Dowa",
        tel: "N/A (DHO Contact)",
        hasEmergency: false,
        services: ["OPD", "Maternity", "Immunization"],
      },
      {
        id: 13,
        name: "Kayembe Health Centre",
        position: [-13.42, 33.76],
        type: "general",
        category: "Health Centre",
        address: "Kayembe, Dowa",
        tel: "N/A (DHO Contact)",
        hasEmergency: false,
        services: ["OPD", "Maternity", "Vaccination"],
      },
      {
        id: 14,
        name: "Mbingwa Health Centre",
        position: [-13.68, 33.87],
        type: "general",
        category: "Health Centre",
        address: "Mbingwa, Dowa",
        tel: "N/A (DHO Contact)",
        hasEmergency: false,
        services: ["OPD", "Maternity", "Child Health"],
      },
      {
        id: 15,
        name: "Msakambewa Health Centre",
        position: [-13.62, 34.02],
        type: "general",
        category: "Health Centre",
        address: "Msakambewa, Dowa",
        tel: "N/A (DHO Contact)",
        hasEmergency: false,
        services: ["OPD", "Maternity", "Family Planning"],
      },
      {
        id: 16,
        name: "Mwangala Health Centre",
        position: [-13.5, 33.91],
        type: "general",
        category: "Health Centre",
        address: "Mwangala, Dowa",
        tel: "N/A (DHO Contact)",
        hasEmergency: false,
        services: ["OPD", "Maternity", "Immunization"],
      },
      {
        id: 17,
        name: "Nalunga Health Centre",
        position: [-13.58, 33.76],
        type: "general",
        category: "Health Centre",
        address: "Nalunga, Dowa",
        tel: "N/A (DHO Contact)",
        hasEmergency: false,
        services: ["OPD", "Maternity", "Child Health"],
      },
      {
        id: 18,
        name: "Thonje Health Centre",
        position: [-13.43, 33.9],
        type: "general",
        category: "Health Centre",
        address: "Thonje, Dowa",
        tel: "N/A (DHO Contact)",
        hasEmergency: false,
        services: ["OPD", "Maternity", "Vaccination"],
      },

      // Other Specialized/Private/Remote Facilities
      {
        id: 19,
        name: "Mvera Army Health Centre",
        position: [-13.635, 34.075],
        type: "military",
        category: "Health Centre (Military)",
        address: "Mvera Army Base, Dowa",
        tel: "N/A (Military Contact)",
        hasEmergency: false,
        services: ["Military Health", "Limited OPD"],
      },
      {
        id: 20,
        name: "Wandikweza Health Centre",
        position: [-13.66, 33.9],
        type: "general",
        category: "Health Centre",
        address: "Wandikweza, Dowa",
        tel: "N/A (DHO Contact)",
        hasEmergency: false,
        services: ["OPD", "Maternity", "Basic Medicine"],
      },
      {
        id: 21,
        name: "Kasese/Lifeline Malawi Health",
        position: [-13.74, 33.85],
        type: "private",
        category: "Health Centre",
        address: "Kasese, Dowa",
        tel: "N/A (Private Contact)",
        hasEmergency: false,
        services: ["OPD", "Community Health"],
      },
      {
        id: 22,
        name: "St. Mary's Rehabilitation Health Centre",
        position: [-13.55, 33.7],
        type: "cham",
        category: "Rehabilitation Centre",
        address: "Dowa District",
        tel: "N/A (CHAM Contact)",
        hasEmergency: false,
        services: ["Rehabilitation", "Physiotherapy", "OPD"],
      },
      {
        id: 23,
        name: "Towoo's Private Clinic",
        position: [-13.655, 33.93],
        type: "private",
        category: "Private Clinic",
        address: "Dowa Boma",
        tel: "N/A (Private Contact)",
        hasEmergency: false,
        services: ["General Consultations", "Dispensary"],
      },
      {
        id: 24,
        name: "Dalitso Private Clinic",
        position: [-13.535, 33.72],
        type: "private",
        category: "Private Clinic",
        address: "Mponela",
        tel: "N/A (Private Contact)",
        hasEmergency: false,
        services: ["General Consultations", "Dispensary"],
      },
      {
        id: 26,
        name: "Dzaleka Health Centre",
        position: [-13.791, 33.882],
        type: "general",
        category: "Health Centre (Refugee/MOH)",
        address: "Dzaleka Refugee Camp, Dowa",
        tel: "N/A (UNHCR/MOH Contact)",
        hasEmergency: true,
        services: [
          "Emergency",
          "Maternity",
          "General OPD",
          "HIV/ART Clinic",
          "Immunization",
          "Disease Surveillance",
        ],
      },
      {
        id: 27,
        name: "Efata Dental Clinic (Dzaleka)",
        position: [-13.789, 33.88],
        type: "private",
        category: "Specialized Clinic (Dental)",
        address: "Dzaleka Refugee Camp Entrance, Dowa",
        tel: "N/A (Private/NGO Contact)",
        hasEmergency: false,
        services: ["Dental Care", "Oral Health Promotion"],
      },
      {
        id: 28,
        name: "Dzaleka Home Based Care (HBC)",
        position: [-13.79, 33.883],
        type: "ngo",
        category: "Community Support Services",
        address: "Dzaleka Refugee Camp, Dowa",
        tel: "+265 994 270 397",
        hasEmergency: false,
        services: [
          "Home Based Care",
          "Psychosocial Support",
          "Palliative Care",
          "HIV/Chronic Disease Support",
        ],
      },
      {
        id: 29,
        name: "Chimwaza Health Centre",
        position: [-13.682, 33.91],
        type: "general",
        category: "Health Centre",
        address: "Dowa District",
        tel: "N/A (DHO)",
        hasEmergency: false,
        services: ["OPD", "Maternity", "Immunization"],
      },
      {
        id: 30,
        name: "Nsalu Health Centre",
        position: [-13.63, 33.86],
        type: "general",
        category: "Health Centre",
        address: "Dowa District",
        tel: "N/A (DHO)",
        hasEmergency: false,
        services: ["OPD", "Maternity", "Family Planning"],
      },
      {
        id: 31,
        name: "Chileka Health Centre (Dowa)",
        position: [-13.48, 33.88],
        type: "general",
        category: "Health Centre",
        address: "Dowa District",
        tel: "N/A (DHO)",
        hasEmergency: false,
        services: ["OPD", "Maternity", "Child Health"],
      },
      {
        id: 32,
        name: "Chipeni Health Centre",
        position: [-13.51, 33.73],
        type: "general",
        category: "Health Centre",
        address: "Dowa District",
        tel: "N/A (DHO)",
        hasEmergency: false,
        services: ["OPD", "Maternity", "Vaccination"],
      },
      {
        id: 33,
        name: "Lobi Health Centre (Dowa)",
        position: [-13.74, 33.95],
        type: "general",
        category: "Health Centre",
        address: "Dowa District",
        tel: "N/A (DHO)",
        hasEmergency: false,
        services: ["OPD", "Maternity", "Immunization"],
      },
      {
        id: 34,
        name: "Mvera Trading Health Centre",
        position: [-13.638, 34.068],
        type: "general",
        category: "Health Centre",
        address: "Mvera, Dowa",
        tel: "N/A (DHO)",
        hasEmergency: false,
        services: ["OPD", "Maternity", "Family Planning"],
      },
      {
        id: 35,
        name: "Nambuma Health Centre",
        position: [-13.76, 33.79],
        type: "general",
        category: "Health Centre",
        address: "Dowa District",
        tel: "N/A (DHO)",
        hasEmergency: false,
        services: ["OPD", "Maternity", "Child Health"],
      },
      {
        id: 36,
        name: "Mtunthama Health Centre",
        position: [-13.7, 33.7],
        type: "general",
        category: "Health Centre",
        address: "Dowa District",
        tel: "N/A (DHO)",
        hasEmergency: false,
        services: ["OPD", "Maternity", "Vaccination"],
      },
      {
        id: 37,
        name: "Msanga Health Centre",
        position: [-13.45, 33.99],
        type: "general",
        category: "Health Centre",
        address: "Dowa District",
        tel: "N/A (DHO)",
        hasEmergency: false,
        services: ["OPD", "Maternity", "Immunization"],
      },
      {
        id: 38,
        name: "Lisasadzi Health Centre",
        position: [-13.59, 33.71],
        type: "general",
        category: "Health Centre",
        address: "Dowa District",
        tel: "N/A (DHO)",
        hasEmergency: false,
        services: ["OPD", "Maternity", "Family Planning"],
      },
      {
        id: 39,
        name: "Chisamba Health Centre",
        position: [-13.77, 34.05],
        type: "general",
        category: "Health Centre",
        address: "Dowa District",
        tel: "N/A (DHO)",
        hasEmergency: false,
        services: ["OPD", "Maternity", "Child Health"],
      },
      {
        id: 40,
        name: "Chiwenga Health Centre",
        position: [-13.54, 33.97],
        type: "general",
        category: "Health Centre",
        address: "Dowa District",
        tel: "N/A (DHO)",
        hasEmergency: false,
        services: ["OPD", "Maternity", "Vaccination"],
      },
      {
        id: 41,
        name: "Maliyu Health Centre",
        position: [-13.61, 33.75],
        type: "general",
        category: "Health Centre",
        address: "Dowa District",
        tel: "N/A (DHO)",
        hasEmergency: false,
        services: ["OPD", "Maternity", "Immunization"],
      },
      {
        id: 42,
        name: "Mchemani Health Centre",
        position: [-13.58, 34.03],
        type: "general",
        category: "Health Centre",
        address: "Dowa District",
        tel: "N/A (DHO)",
        hasEmergency: false,
        services: ["OPD", "Maternity", "Family Planning"],
      },
      {
        id: 43,
        name: "Nkhotakota District Hospital",
        position: [-12.923, 34.923],
        type: "general",
        category: "District Hospital",
        address: "Nkhotakota Boma",
        tel: "+265 1 292 XXX",
        hasEmergency: true,
        services: ["Emergency", "Surgery", "Maternity", "OPD"],
      },
      {
        id: 25,
        name: "Mamoyo Private Clinic",
        position: [-13.395, 33.845],
        type: "private",
        category: "Private Clinic",
        address: "Madisi",
        tel: "N/A (Private Contact)",
        hasEmergency: false,
        services: ["General Consultations", "Dispensary"],
      },
      {
        id: 21,
        name: "St. John's General Hospital",
        position: [-11.439, 34.019],
        type: "cham",
        category: "Mission Hospital",
        address: "Mzuzu",
        tel: "+265 1 325 299",
        hasEmergency: true,
        services: ["Emergency", "General OPD", "Mental Health (close access)"],
      },
      {
        id: 22,
        name: "Holy Family Mission Hospital",
        position: [-15.82, 35.702],
        type: "cham",
        category: "Mission Hospital",
        address: "Phalombe",
        tel: "+265 1 563 XXX",
        hasEmergency: true,
        services: ["Emergency", "Maternity", "General Surgery"],
      },
      {
        id: 23,
        name: "St. Martin's Mission Hospital",
        position: [-14.398, 35.215],
        type: "cham",
        category: "Mission Hospital",
        address: "Malindi, Mangochi",
        tel: "+265 1 582 XXX",
        hasEmergency: true,
        services: ["Emergency", "Maternity", "Tropical Medicine"],
      },
      {
        id: 24,
        name: "Madisi Mission Hospital",
        position: [-13.398, 33.84],
        type: "cham",
        category: "Mission Hospital",
        address: "Dowa",
        tel: "+265 1 254 XXX",
        hasEmergency: true,
        services: ["Emergency", "Maternity", "General Inpatient"],
      },
      {
        id: 25,
        name: "Mchinji District Hospital",
        position: [-13.805, 32.887],
        type: "general",
        category: "District Hospital",
        address: "Mchinji",
        tel: "+265 1 272 XXX",
        hasEmergency: true,
        services: ["Emergency", "Outpatient", "Maternity"],
      },
    ];
    setAllHospitals(malawiHospitals);
    setFilteredHospitals(malawiHospitals);
  }, []);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const applyFilters = useCallback(() => {
    const filtered = allHospitals.filter((hospital) => {
      if (!filters.hospitalTypes[hospital.type]) return false;
      if (filters.showEmergency && !hospital.hasEmergency) return false;
      if (userLocation) {
        const distance = calculateDistance(
          userLocation[0],
          userLocation[1],
          hospital.position[0],
          hospital.position[1]
        );
        return distance <= filters.maxDistance;
      }
      return true;
    });
    setFilteredHospitals(filtered);
  }, [allHospitals, filters, userLocation]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) {
      applyFilters();
      setSearchSuggestions([]);
      return;
    }
    const query = searchQuery.toLowerCase();
    const results = allHospitals.filter(
      (hospital) =>
        hospital.name.toLowerCase().includes(query) ||
        hospital.address.toLowerCase().includes(query) ||
        hospital.category.toLowerCase().includes(query)
    );
    setFilteredHospitals(results);
    setSearchSuggestions(results.slice(0, 5));
  }, [searchQuery, allHospitals, applyFilters]);

  const handleSearchInput = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.length > 2) {
      const query = value.toLowerCase();
      const suggestions = allHospitals
        .filter(
          (hospital) =>
            hospital.name.toLowerCase().includes(query) ||
            hospital.category.toLowerCase().includes(query)
        )
        .slice(0, 5);
      setSearchSuggestions(suggestions);
    } else {
      setSearchSuggestions([]);
    }
  };

  const getDirections = (hospital) => {
    if (!userLocation) {
      alert("Please enable location services to get directions");
      return;
    }
    const origin = `${userLocation[0]},${userLocation[1]}`;
    const destination = `${hospital.position[0]},${hospital.position[1]}`;
    window.open(
      `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`,
      "_blank"
    );
  };

  const handleHospitalTypeChange = (type) => {
    setFilters((prev) => ({
      ...prev,
      hospitalTypes: {
        ...prev.hospitalTypes,
        [type]: !prev.hospitalTypes[type],
      },
    }));
  };

  const handleMaxDistanceChange = (distance) => {
    setFilters((prev) => ({ ...prev, maxDistance: distance }));
  };

  const resetFilters = () => {
    setFilters({
      hospitalTypes: { referral: true, general: true, private: true },
      maxDistance: 1000, // Changed from 50 to 1000
      showEmergency: true,
    });
  };

  const flyToLocation = (position, zoom = 14) => {
    setMapCenter(position);
    setMapZoom(zoom);
  };

  const getHospitalIcon = (hospital) => {
    if (hospital.hasEmergency) return iconEmergency;
    switch (hospital.type) {
      case "private":
        return iconYellow;
      case "general":
        return iconGreen;
      default:
        return iconBlue;
    }
  };

  const getHospitalDistance = (hospital) => {
    if (!userLocation) return null;
    return calculateDistance(
      userLocation[0],
      userLocation[1],
      hospital.position[0],
      hospital.position[1]
    );
  };

  return (
    <div className="map-app">
      {/* Main Layout with Sidebar and Map */}
      <div className="app-layout">
        {/* Sidebar Component */}
        <div className="app-sidebar">
          <Sidebar />
        </div>

        {/* Main Map Area */}
        <div className="app-main">
          {/* Floating Controls Bar */}
          <div className="floating-controls-bar">
            {/* Search Bar */}
            <div className="search-container">
              <div className="search-input-wrapper">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search hospitals by name, address, or category..."
                  value={searchQuery}
                  onChange={handleSearchInput}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="search-input"
                />
                {searchQuery && (
                  <button
                    className="clear-search"
                    onClick={() => {
                      setSearchQuery("");
                      applyFilters();
                      setSearchSuggestions([]);
                    }}
                  >
                    <IoMdClose />
                  </button>
                )}
              </div>

              {searchSuggestions.length > 0 && (
                <div className="search-suggestions">
                  {searchSuggestions.map((hospital) => (
                    <div
                      key={hospital.id}
                      className="suggestion-item"
                      onClick={() => {
                        setSelectedHospital(hospital);
                        flyToLocation(hospital.position);
                        setSearchQuery("");
                        setSearchSuggestions([]);
                      }}
                    >
                      <div className="suggestion-icon">
                        {hospital.hasEmergency ? (
                          <FaAmbulance />
                        ) : (
                          <FaHospital />
                        )}
                      </div>
                      <div className="suggestion-info">
                        <div className="suggestion-name">{hospital.name}</div>
                        <div className="suggestion-category">
                          {hospital.category}
                        </div>
                        {userLocation && (
                          <div className="suggestion-distance">
                            {calculateDistance(
                              userLocation[0],
                              userLocation[1],
                              hospital.position[0],
                              hospital.position[1]
                            ).toFixed(1)}{" "}
                            km
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="quick-actions">
              <button
                className="action-btn filter-toggle-btn"
                onClick={() => setIsFiltersPanelOpen(!isFiltersPanelOpen)}
              >
                <FaFilter />
                <span>Filters</span>
                <span className="badge">{filteredHospitals.length}</span>
              </button>

              <div className="map-layer-switcher">
                {Object.entries(mapLayers).map(([name, layer]) => (
                  <button
                    key={name}
                    className={`layer-btn ${
                      currentMapLayer === name ? "active" : ""
                    }`}
                    onClick={() => setCurrentMapLayer(name)}
                    title={name}
                  >
                    {layer.icon}
                    <span className="layer-name">{name}</span>
                  </button>
                ))}
              </div>

              {userLocation && (
                <button
                  className="action-btn location-btn"
                  onClick={() => flyToLocation(userLocation, 14)}
                >
                  <FaLocationArrow />
                  <span>My Location</span>
                </button>
              )}
            </div>
          </div>

          {/* Map Container - Full Screen */}
          <div className="map-container-full">
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              style={{ height: "100%", width: "100%" }}
              className="fullscreen-map"
              ref={mapRef}
              zoomControl={false}
            >
              <MapUpdater center={mapCenter} zoom={mapZoom} />

              {/* Map Layers */}
              {currentMapLayer === "Satellite" && (
                <TileLayer
                  attribution={mapLayers["Satellite"].attribution}
                  url={mapLayers["Satellite"].url}
                  tileSize={512}
                  zoomOffset={-1}
                />
              )}
              {currentMapLayer === "Street" && (
                <TileLayer
                  attribution={mapLayers["Street"].attribution}
                  url={mapLayers["Street"].url}
                />
              )}
              {currentMapLayer === "Terrain" && (
                <TileLayer
                  attribution={mapLayers["Terrain"].attribution}
                  url={mapLayers["Terrain"].url}
                />
              )}

              {/* User Location */}
              {userLocation && (
                <Marker position={userLocation} icon={iconRed}>
                  <Popup>
                    <div className="popup-content">
                      <h4>📍 Your Location</h4>
                      <p>Lat: {userLocation[0].toFixed(4)}</p>
                      <p>Lng: {userLocation[1].toFixed(4)}</p>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Hospital Markers */}
              {filteredHospitals.map((hospital) => (
                <Marker
                  key={hospital.id}
                  position={hospital.position}
                  icon={getHospitalIcon(hospital)}
                  eventHandlers={{
                    click: () => setSelectedHospital(hospital),
                  }}
                >
                  <Popup className="hospital-popup">
                    <div className="popup-content">
                      <div className="popup-header">
                        <div className="popup-icon">
                          {hospital.hasEmergency ? (
                            <FaAmbulance />
                          ) : (
                            <FaHospital />
                          )}
                        </div>
                        <div>
                          <h4>{hospital.name}</h4>
                          <span className="hospital-category">
                            {hospital.category}
                          </span>
                        </div>
                      </div>

                      <div className="popup-details">
                        {userLocation && (
                          <div className="detail-item">
                            <IoMdPin />
                            <span>
                              {getHospitalDistance(hospital)?.toFixed(1)} km
                              away
                            </span>
                          </div>
                        )}
                        <div className="detail-item">
                          <IoMdMedical />
                          <span>{hospital.tel}</span>
                        </div>
                        <div className="detail-item">
                          <IoMdBusiness />
                          <span>{hospital.address}</span>
                        </div>

                        {hospital.hasEmergency && (
                          <div className="emergency-badge">
                            <FaAmbulance />
                            <span>24/7 Emergency Services</span>
                          </div>
                        )}

                        {hospital.services && hospital.services.length > 0 && (
                          <div className="services-section">
                            <div className="services-label">Services:</div>
                            <div className="services-tags">
                              {hospital.services
                                .slice(0, 3)
                                .map((service, idx) => (
                                  <span key={idx} className="service-tag">
                                    {service}
                                  </span>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="popup-actions">
                        <button
                          className="action-btn zoom-btn"
                          onClick={() => flyToLocation(hospital.position, 16)}
                        >
                          <FaMapMarkedAlt /> Zoom
                        </button>
                        {userLocation && (
                          <button
                            className="action-btn directions-btn"
                            onClick={() => getDirections(hospital)}
                          >
                            <FaDirections /> Directions
                          </button>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* Floating Filters Panel */}
          {isFiltersPanelOpen && (
            <div className="floating-filters-panel">
              <div className="filters-header">
                <h3>Filters & Options</h3>
                <button
                  className="close-filters"
                  onClick={() => setIsFiltersPanelOpen(false)}
                >
                  <IoMdClose />
                </button>
              </div>
              {/* More efficient way using map */}
              <div className="filter-section">
                <h4>Hospital Types</h4>
                <div className="filter-options">
                  {Object.keys(filters.hospitalTypes).map((type) => (
                    <label key={type} className="filter-checkbox">
                      <input
                        type="checkbox"
                        checked={filters.hospitalTypes[type]}
                        onChange={() => handleHospitalTypeChange(type)} // Use the function here
                      />
                      <span className="checkmark"></span>
                      {type.charAt(0).toUpperCase() + type.slice(1)} Hospitals
                    </label>
                  ))}
                </div>
              </div>
              <div className="filters-content">
                {/* In your filter panel JSX */}
                <div className="filter-section">
                  <h4>Maximum Distance: {filters.maxDistance} km</h4>
                  <input
                    type="range"
                    min="5"
                    max="1000" // Changed from 200 to 1000
                    step="10" // Changed from 5 to 10 for smoother sliding
                    value={filters.maxDistance}
                    onChange={(e) =>
                      handleMaxDistanceChange(parseInt(e.target.value))
                    }
                    className="distance-slider"
                  />
                  <div className="distance-ticks">
                    <span>5km</span>
                    <span>250km</span>
                    <span>500km</span>
                    <span>750km</span>
                    <span>1000km</span>
                  </div>
                </div>

                <div className="filter-section">
                  <label className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={filters.showEmergency}
                      onChange={() =>
                        setFilters((prev) => ({
                          ...prev,
                          showEmergency: !prev.showEmergency,
                        }))
                      }
                    />
                    <span className="checkmark"></span>
                    Show Only Emergency Services
                  </label>
                </div>

                <div className="filter-actions">
                  <button
                    className="filter-action-btn reset-btn"
                    onClick={resetFilters}
                  >
                    Reset All Filters
                  </button>
                  <button
                    className="filter-action-btn apply-btn"
                    onClick={() => setIsFiltersPanelOpen(false)}
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Map Legend - Bottom Right */}
          <div className="map-legend">
            <div className="legend-header">
              <FaMap />
              <span>Map Legend</span>
            </div>
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
                <div className="legend-color emergency"></div>
                <span>Emergency Services</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
