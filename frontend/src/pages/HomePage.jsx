import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useSocketStore } from '../store/useSocketStore';
import { axiosInstance } from '../lib/axios';
import { toast } from 'react-hot-toast';
import { 
  MapPin, Droplet, Calendar, Power, 
  Bell, Clock, Users, X, Award, Loader, AlertTriangle, Save, Navigation 
} from 'lucide-react';
import { jsPDF } from 'jspdf';

import { useMap } from "react-leaflet";

// MAP IMPORTS
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet Icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const RecenterMap = ({ lat, lng }) => {
  const map = useMap();

  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], 15);
    }
  }, [lat, lng, map]);

  return null;
};


// === CERTIFICATE BUTTON ===

const CertificateButton = ({ event }) => {
  const [loading, setLoading] = useState(false);

  const generatePDF = (data) => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    doc.setDrawColor(179, 0, 0);
    doc.setLineWidth(2);
    doc.rect(10, 10, 277, 190, 'S');

    doc.setFontSize(40);
    doc.setTextColor(179, 0, 0);
    doc.text("Certificate of Appreciation", 148.5, 50, { align: "center" });

    doc.setFontSize(20);
    doc.setTextColor(60, 60, 60);
    doc.text("This is to certify that", 148.5, 80, { align: "center" });

    doc.setFontSize(35);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text(data.userName || "Valued Donor", 148.5, 105, { align: "center" });

    doc.setFontSize(18);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    doc.text("has successfully donated blood at the event:", 148.5, 125, { align: "center" });

    doc.setFontSize(22);
    doc.setTextColor(179, 0, 0);
    doc.text(data.eventName || "Blood Donation Drive", 148.5, 140, { align: "center" });

    const dateStr = data.date ? new Date(data.date).toLocaleDateString() : new Date().toLocaleDateString();
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text(`Date: ${dateStr}`, 148.5, 165, { align: "center" });

    doc.save(`Certificate_${data.userName.replace(/\s+/g, '_')}.pdf`);
  };

  const handleClaim = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/events/certificate/${event._id}`);
      if (res.data.eligible) {
        toast.success("Certificate Generated!");
        generatePDF(res.data);
      } else {
        toast.error("Not eligible yet.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleClaim}
      disabled={loading}
      className="mt-2 w-full flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg font-bold text-xs transition shadow-sm disabled:opacity-50"
    >
      {loading ? <Loader size={14} className="animate-spin" /> : <Award size={14} />}
      Claim Donation Certificate
    </button>
  );
};

// === DRAGGABLE MARKER ===
function DraggableMarker({ position, setPosition }) {
  const markerRef = useRef(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker) {
          const { lat, lng } = marker.getLatLng();
          setPosition({ lat, lng });
        }
      },
    }),
    [setPosition]
  );

  return (
    <Marker
      draggable
      eventHandlers={eventHandlers}
      position={[position.lat, position.lng]}
      ref={markerRef}
    >
      <Popup>Drag to your location</Popup>
    </Marker>
  );
}

// === HOME PAGE ===
const HomePage = () => {
  const { authUser, checkAuth } = useAuthStore();
  const { socket } = useSocketStore();

  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);

  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  // LOCATION STATE
  const [markerPosition, setMarkerPosition] = useState({ lat: 12.9716, lng: 77.5946 });
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axiosInstance.get('/notifications');
        setNotifications(res.data);
      } catch {
        console.log("Error fetching alerts");
      }
    };

    const fetchEvents = async () => {
      try {
        const res = await axiosInstance.get("/events/all");
        setEvents(res.data);
      } catch {
        console.log("Error fetching events");
      }
    };

    // INIT LOCATION FROM USER PROFILE
    if (authUser?.location?.coordinates) {
      setMarkerPosition({
        lat: authUser.location.coordinates[1],
        lng: authUser.location.coordinates[0]
      });
    }

    fetchNotifications();
    fetchEvents();

    if (socket) {
      socket.on("emergencyRequest", (newAlert) => {
        setNotifications(prev => [newAlert, ...prev]);
      });
    }

    return () => {
      if (socket) socket.off("emergencyRequest");
    };
  }, [socket, authUser]);

  const handleToggleStatus = async () => {
    setLoading(true);
    try {
      await axiosInstance.put('/auth/toggle-availability');
      await checkAuth();
      toast.success(authUser.isAvailable ? "You are now Offline" : "You are Active to Donate!");
    } catch {
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEvent = async (eventId, isRegistered) => {
    try {
      if (isRegistered) {
        await axiosInstance.post(`/events/leave/${eventId}`);
        toast.success("Unregistered successfully");
      } else {
        await axiosInstance.post(`/events/join/${eventId}`);
        toast.success("Successfully Registered!");
      }
      const res = await axiosInstance.get("/events/all");
      setEvents(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleOpenNotification = async (notif) => {
    setSelectedNotification(notif);
    setShowNotificationModal(true);

    if (!notif.isRead) {
      try {
        await axiosInstance.put(`/notifications/${notif._id}/read`);
        setNotifications(prev =>
          prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n)
        );
      } catch {
        console.log("Failed to mark read");
      }
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await axiosInstance.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
      setShowNotificationModal(false);
      toast.success("Notification deleted");
    } catch {
      toast.error("Failed to delete notification");
    }
  };

  // === LOCATION HANDLERS ===
  const getCurrentLocation = () => {
    setGpsLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMarkerPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          toast.success("Location Updated!");
          setGpsLoading(false);
        },
        () => {
          toast.error("Could not fetch location.");
          setGpsLoading(false);
        }
      );
    }
  };

  const handleUpdateLocation = async () => {
    setIsUpdatingLocation(true);
    try {
      await axiosInstance.put('/auth/update-profile', {
        location: {
          type: "Point",
          coordinates: [markerPosition.lng, markerPosition.lat]
        }
      });

      toast.success("Your Location Updated!");
      await checkAuth();
    } catch {
      toast.error("Failed to update location.");
    } finally {
      setIsUpdatingLocation(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Welcome */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Welcome, {authUser?.fullName?.split(' ')[0]}!
            </h1>
            <p className="text-gray-500 mt-2">
              Blood Group:
              <span className="font-bold text-[#b30000] bg-red-50 px-2 py-1 rounded ml-2">
                {authUser?.bloodGroup}
              </span>
            </p>
          </div>
          <button 
            onClick={handleToggleStatus} 
            disabled={loading} 
            className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold transition-all shadow-md ${
              authUser?.isAvailable 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            <Power size={20} />
            {authUser?.isAvailable ? "Status: ACTIVE" : "Status: UNAVAILABLE"}
          </button>
        </div>

        {/* LOCATION CARD */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
              <MapPin className="text-blue-600" /> Your Location
            </h2>
            <div className="flex gap-2">
              <button 
                onClick={getCurrentLocation}
                className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-gray-200 transition"
              >
                {gpsLoading ? <Loader size={14} className="animate-spin"/> : <Navigation size={14}/>}
                Use GPS
              </button>

              <button 
                onClick={handleUpdateLocation}
                disabled={isUpdatingLocation}
                className="flex items-center gap-2 bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-green-700 transition"
              >
                {isUpdatingLocation ? <Loader size={14} className="animate-spin"/> : <Save size={14}/>}
                Save Location
              </button>
            </div>
          </div>

          <div className="h-72 w-full rounded-xl overflow-hidden border-2 border-gray-200">
            <MapContainer center={markerPosition} zoom={13} style={{ height: "100%", width: "100%" }}>
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <DraggableMarker position={markerPosition} setPosition={setMarkerPosition} />
            </MapContainer>
          </div>

          <p className="text-xs text-gray-500 mt-2 text-center">
            *Drag the marker to your exact location. This helps hospitals find you faster.
          </p>
        </div>

        {/* Notification Center */}
        <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-l-[#b30000]">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Bell className="text-[#b30000]" /> Notification Center
          </h2>

          {notifications.length === 0 ? (
            <p className="text-sm text-gray-400">No notifications yet.</p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {notifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => handleOpenNotification(notif)}
                  className={`p-4 rounded-lg border cursor-pointer transition 
                    ${notif.isRead 
                      ? "bg-gray-50 border-gray-200 text-gray-600" 
                      : "bg-red-50 border-red-200 text-gray-900 hover:bg-red-100"}`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <p className="font-bold text-sm">{notif.title}</p>
                      <p className="text-xs mt-1 line-clamp-2">{notif.message}</p>
                    </div>
                    {!notif.isRead && (
                      <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full">
                        NEW
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2">
                    {new Date(notif.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Events */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="text-[#b30000]" /> Upcoming Blood Drives
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((event) => {
              const isRegistered = event.participants.some(p => {
                const idToCheck = p.student?._id || p.student || p;
                return idToCheck?.toString() === authUser._id?.toString();
              });

              return (
                <div key={event._id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <h3 className="font-bold text-lg text-gray-900">{event.title}</h3>
                  <p className="text-sm text-gray-500">{event.organizerName}</p>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{event.description}</p>

                  <button 
                    onClick={() => handleToggleEvent(event._id, isRegistered)} 
                    className={`w-full py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition ${
                      isRegistered ? "bg-red-100 text-red-700" : "bg-gray-900 text-white"
                    }`}
                  >
                    {isRegistered ? <><X size={16} /> Leave Drive</> : "Join Drive"}
                  </button>

                  {isRegistered && <CertificateButton event={event} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Notification Modal */}
        {showNotificationModal && selectedNotification && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md relative">

              <button
                onClick={() => setShowNotificationModal(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {selectedNotification.title}
              </h3>

              <p className="text-gray-700 text-sm mb-4">
                {selectedNotification.message}
              </p>

              {selectedNotification.metadata && (
                <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-2">
                  <p><b>Blood Group:</b> {selectedNotification.metadata.bloodGroup}</p>
                  <p><b>Units:</b> {selectedNotification.metadata.units}</p>
                  <p><b>Hospital:</b> {selectedNotification.metadata.location?.name || "N/A"}</p>
                </div>
              )}

              <div className="mt-4 flex justify-end gap-3">
                <button
                  onClick={() => handleDeleteNotification(selectedNotification._id)}
                  className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>

                <button
                  onClick={() => setShowNotificationModal(false)}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default HomePage;
