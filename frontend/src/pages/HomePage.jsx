import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { axiosInstance } from '../lib/axios';
import { toast } from 'react-hot-toast';
import { 
  MapPin, Droplet, Calendar, Power, 
  Bell, Clock, Users, X, Award, Loader 
} from 'lucide-react';
import jsPDF from 'jspdf'; //

// === COMPONENT: CERTIFICATE BUTTON ===
const CertificateButton = ({ event }) => {
  const [loading, setLoading] = useState(false);

  const generatePDF = (data) => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Design the Certificate
    doc.setDrawColor(179, 0, 0); // Red Border
    doc.setLineWidth(1);
    doc.rect(10, 10, 277, 190, 'S'); 
    
    doc.setFontSize(40);
    doc.setTextColor(179, 0, 0); // Blood Red
    doc.text("Certificate of Appreciation", 148, 50, { align: "center" });
    
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 0);
    doc.text("This is to certify that", 148, 80, { align: "center" });
    
    doc.setFontSize(30);
    doc.setFont("helvetica", "bold");
    doc.text(data.userName, 148, 100, { align: "center" });
    
    doc.setFontSize(18);
    doc.setFont("helvetica", "normal");
    doc.text("has successfully donated blood at the event:", 148, 120, { align: "center" });
    
    doc.setFontSize(22);
    doc.text(data.eventName, 148, 135, { align: "center" });

    doc.setFontSize(14);
    doc.text(`Date: ${new Date(data.date).toLocaleDateString()}`, 148, 160, { align: "center" });
    
    doc.save(`Certificate_${data.userName}.pdf`);
  };

  const handleClaim = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/events/certificate/${event._id}`);
      
      if (res.data.eligible) {
        toast.success("Verification successful!");
        generatePDF(res.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Verification failed. Did you donate?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleClaim}
      disabled={loading}
      className="mt-2 w-full flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg font-bold text-xs transition shadow-sm"
    >
      {loading ? <Loader size={14} className="animate-spin" /> : <Award size={14} />}
      Claim Donation Certificate
    </button>
  );
};

const HomePage = () => {
  const { authUser, checkAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axiosInstance.get('/notifications');
        setNotifications(res.data.slice(0, 3));
      } catch (error) { console.log("Error fetching alerts"); }
    };

    const fetchEvents = async () => {
      try {
        const res = await axiosInstance.get("/events/all");
        setEvents(res.data);
      } catch (error) { console.log("Error fetching events"); }
    };

    fetchNotifications();
    fetchEvents();
  }, []);

  const handleToggleStatus = async () => {
    setLoading(true);
    try {
      await axiosInstance.put('/auth/toggle-availability');
      await checkAuth();
      toast.success(authUser.isAvailable ? "You are now Offline" : "You are Active to Donate!");
    } catch (error) { toast.error("Failed to update status"); }
    finally { setLoading(false); }
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
    } catch (error) { toast.error(error.response?.data?.message || "Operation failed"); }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Welcome Section */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Welcome, {authUser?.fullName?.split(' ')[0]}!</h1>
            <p className="text-gray-500 mt-2">Blood Group: <span className="font-bold text-[#b30000] bg-red-50 px-2 py-1 rounded">{authUser?.bloodGroup}</span></p>
          </div>
          <button onClick={handleToggleStatus} disabled={loading} className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold transition-all shadow-md ${authUser?.isAvailable ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
            <Power size={20} /> {authUser?.isAvailable ? "Status: ACTIVE" : "Status: UNAVAILABLE"}
          </button>
        </div>

        {/* Metrics Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <MapPin className="text-blue-600 mb-4" />
                <h3 className="font-bold text-gray-800">Your Location</h3>
                <div className="mt-4 text-xs font-mono bg-gray-50 p-2 rounded truncate text-gray-600">
                    {authUser?.location?.coordinates ? `${authUser.location.coordinates[1].toFixed(4)}, ${authUser.location.coordinates[0].toFixed(4)}` : "No GPS Data"}
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <Droplet className="text-[#b30000] mb-4" />
                <h3 className="font-bold text-gray-800">Donation Impact</h3>
                <div className="mt-4 font-bold text-2xl text-gray-800">0 <span className="text-sm font-normal text-gray-400">Lives Saved</span></div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <Calendar className="text-purple-600 mb-4" />
                <h3 className="font-bold text-gray-800">Availability</h3>
                <p className="text-sm text-gray-500 mt-1">You are <b>{authUser?.isAvailable ? "Available" : "Unavailable"}</b> for requests.</p>
            </div>
        </div>

        {/* Events Section */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><Calendar className="text-[#b30000]" /> Upcoming Blood Drives</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((event) => {
              const isRegistered = event.participants.includes(authUser._id);
              return (
                <div key={event._id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{event.title}</h3>
                      <p className="text-sm text-gray-500">{event.organizerName}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                  
                  <div className="flex flex-col gap-2">
                    <button onClick={() => handleToggleEvent(event._id, isRegistered)} className={`w-full py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition ${isRegistered ? "bg-red-100 text-red-700" : "bg-gray-900 text-white"}`}>
                      {isRegistered ? <><X size={16} /> Leave Drive</> : "Join Drive"}
                    </button>
                    
                    {/* ONLY SHOW CERTIFICATE OPTION IF REGISTERED */}
                    {isRegistered && <CertificateButton event={event} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;