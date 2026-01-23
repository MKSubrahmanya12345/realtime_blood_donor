import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";
import { Building2, Loader, Clock, Navigation } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker icons
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});

// Recenter map
const RecenterMap = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], 16);
    }
  }, [lat, lng, map]);
  return null;
};

// Handle map click
const LocationPicker = ({ setFormData }) => {
  useMapEvents({
    click(e) {
      setFormData(prev => ({
        ...prev,
        latitude: e.latlng.lat,
        longitude: e.latlng.lng
      }));
      toast.success("Location Pin Updated!");
    }
  });
  return null;
};

const HospitalRegistrationPage = () => {
  const navigate = useNavigate();
  const { checkAuth } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const markerRef = useRef(null);

  const DEFAULT_CENTER = [12.9716, 77.5946];

  const [formData, setFormData] = useState({
    hospitalName: "",
    email: "",
    contactNumber: "",
    licenseNumber: "",
    address: "",
    latitude: null,
    longitude: null,
    capacity: "",
    hasEmergencyServices: false,
    operatingHours: "24/7"
  });

  useEffect(() => {
    if (formData.latitude && markerRef.current) {
      setTimeout(() => {
        markerRef.current.openPopup();
      }, 200);
    }
  }, [formData.latitude]);

  const getCurrentLocation = () => {
    setGpsLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        position => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
          toast.success("GPS Captured Successfully!");
          setGpsLoading(false);
        },
        () => {
          toast.error("Could not fetch location. Click the map.");
          setGpsLoading(false);
        }
      );
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    if (!formData.latitude || !formData.longitude) {
      toast.error("Please pin the hospital location on the map.");
      setLoading(false);
      return;
    }

    try {
      await axiosInstance.post("/hospital/register", formData);
      toast.success("Registration Successful!");
      await checkAuth();
      navigate("/hospital");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="flex justify-center">
        <div className="max-w-4xl w-full bg-white rounded-xl shadow-lg overflow-hidden">

          <div className="bg-blue-900 p-6 text-white text-center">
            <Building2 className="w-12 h-12 mx-auto mb-2" />
            <h2 className="text-2xl font-bold">Partner with BloodLink</h2>
            <p className="text-blue-200 text-sm">
              Register your Hospital / Blood Bank
            </p>
          </div>

          <div className="p-8">

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Hospital Name
                </label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full p-2 border rounded-md"
                  onChange={e =>
                    setFormData({ ...formData, hospitalName: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Official Email
                </label>
                <input
                  type="email"
                  required
                  className="mt-1 block w-full p-2 border rounded-md"
                  onChange={e =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Helpline Number
                </label>
                <input
                  type="tel"
                  required
                  className="mt-1 block w-full p-2 border rounded-md"
                  onChange={e =>
                    setFormData({
                      ...formData,
                      contactNumber: e.target.value
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  License Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="Govt. Reg. No."
                  className="mt-1 block w-full p-2 border rounded-md"
                  onChange={e =>
                    setFormData({
                      ...formData,
                      licenseNumber: e.target.value
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Total Bed Capacity
                </label>
                <input
                  type="number"
                  required
                  className="mt-1 block w-full p-2 border rounded-md"
                  onChange={e =>
                    setFormData({ ...formData, capacity: e.target.value })
                  }
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Street Address
                </label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full p-2 border rounded-md"
                  onChange={e =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>

              <div className="md:col-span-2 flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="w-5 h-5 accent-blue-900"
                    checked={formData.hasEmergencyServices}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        hasEmergencyServices: e.target.checked
                      })
                    }
                  />
                  <span>Emergency Services?</span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-gray-500" />
                  <input
                    type="text"
                    placeholder="Hours (e.g. 24/7)"
                    className="border-b focus:outline-none"
                    onChange={e =>
                      setFormData({
                        ...formData,
                        operatingHours: e.target.value
                      })
                    }
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="md:col-span-2 bg-blue-900 text-white py-3 rounded-lg font-bold hover:bg-blue-800 transition"
              >
                {loading ? "Registering..." : "Complete Registration"}
              </button>
            </form>

            {/* MAP BELOW FORM */}
            <div className="mt-10">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-700">
                  Hospital Location
                </h3>
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md flex items-center gap-2 hover:bg-gray-100"
                >
                  {gpsLoading ? (
                    <Loader size={14} className="animate-spin" />
                  ) : (
                    <Navigation size={14} />
                  )}
                  Use My GPS
                </button>
              </div>

              <div style={{ height: "320px" }} className="w-full rounded-md overflow-hidden border border-gray-300">
                <MapContainer
                  center={DEFAULT_CENTER}
                  zoom={13}
                  className="h-full w-full"
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                  />

                  <RecenterMap
                    lat={formData.latitude}
                    lng={formData.longitude}
                  />
                  <LocationPicker setFormData={setFormData} />

                  {formData.latitude && (
                    <Marker
                      position={[formData.latitude, formData.longitude]}
                      ref={markerRef}
                    >
                      <Popup>
                        Location Pinned!
                      </Popup>
                    </Marker>
                  )}
                </MapContainer>
              </div>

              <div className="mt-2 text-xs text-gray-500 flex gap-4">
                <span className={formData.latitude ? "text-green-600 font-bold" : ""}>
                  Lat: {formData.latitude ? formData.latitude.toFixed(6) : "Not set"}
                </span>
                <span className={formData.longitude ? "text-green-600 font-bold" : ""}>
                  Lng: {formData.longitude ? formData.longitude.toFixed(6) : "Not set"}
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalRegistrationPage;
