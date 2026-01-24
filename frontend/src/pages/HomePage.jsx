import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { axiosInstance } from '../lib/axios';
import { toast } from 'react-hot-toast';
import { 
  MapPin, Droplet, Calendar, Power, 
  Bell, Clock, Users, CheckCircle, X 
} from 'lucide-react';

const HomePage = () => {
  const { authUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axiosInstance.get('/notifications');
        setNotifications(res.data.slice(0, 3));
      } catch (error) {
        console.log("Error fetching alerts");
      }
    };

    const fetchEvents = async () => {
      try {
        const res = await axiosInstance.get("/events/all");
        setEvents(res.data);
      } catch (error) {
        console.log("Error fetching events");
      }
    };

    fetchNotifications();
    fetchEvents();
  }, []);

  const handleToggleEvent = async (eventId, isRegistered) => {
    try {
      if (isRegistered) {
        await axiosInstance.post(`/events/leave/${eventId}`);
        toast.success("Unregistered successfully");
      } else {
        await axiosInstance.post(`/events/join/${eventId}`);
        toast.success("Successfully Registered! 🎉");
      }

      const res = await axiosInstance.get("/events/all");
      setEvents(res.data);

    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* === SECTION 1: WELCOME & STATUS === */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Welcome, {authUser?.fullName?.split(' ')[0]}! 👋
            </h1>
            <p className="text-gray-500 mt-2">
              Blood Group:{" "}
              <span className="font-bold text-[#b30000] bg-red-50 px-2 py-1 rounded">
                {authUser?.bloodGroup}
              </span>
            </p>
          </div>

          <button
            disabled={loading}
            className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold transition-all shadow-md ${
              authUser?.isAvailable
                ? 'bg-green-100 text-green-800 hover:bg-green-200 border border-green-200'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-300'
            }`}
          >
            <Power size={20} />
            {authUser?.isAvailable ? "Status: ACTIVE" : "Status: UNAVAILABLE"}
          </button>
        </div>

        {/* === SECTION 2: METRICS === */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="bg-blue-50 w-fit p-3 rounded-full mb-4">
              <MapPin className="text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-800">Your Location</h3>
            <div className="mt-4 text-xs font-mono bg-gray-50 p-2 rounded truncate text-gray-600">
              {authUser?.location?.coordinates
                ? `${authUser.location.coordinates[1].toFixed(4)}, ${authUser.location.coordinates[0].toFixed(4)}`
                : "No GPS Data"}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="bg-red-50 w-fit p-3 rounded-full mb-4">
              <Droplet className="text-[#b30000]" />
            </div>
            <h3 className="font-bold text-gray-800">Donation Impact</h3>
            <div className="mt-4 font-bold text-2xl text-gray-800">
              0 <span className="text-sm font-normal text-gray-400">Lives Saved</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="bg-purple-50 w-fit p-3 rounded-full mb-4">
              <Calendar className="text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-800">Availability</h3>
            <p className="text-sm text-gray-500 mt-1">
              You are currently{" "}
              <b>{authUser?.isAvailable ? "Available" : "Unavailable"}</b>
              {" "}for emergency requests.
            </p>
          </div>
        </div>

        {/* === SECTION 3: RECENT NOTIFICATIONS === */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
            <Bell size={20} className="text-gray-600" />
            <h3 className="font-bold text-gray-800">Recent Alerts</h3>
          </div>

          <div className="divide-y divide-gray-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <p>No recent alerts. That's good news! 🎉</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div key={notif._id} className="p-4 hover:bg-gray-50 transition flex gap-4">
                  <div className="shrink-0 mt-1">
                    <div className="size-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xs">
                      SOS
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-gray-800 text-sm">{notif.title}</h4>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* === SECTION 4: UPCOMING BLOOD DRIVES === */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="text-[#b30000]" /> Upcoming Blood Drives
            </h2>
          </div>

          {events.length === 0 ? (
            <div className="bg-white p-10 rounded-xl border border-gray-200 text-center text-gray-500">
              No upcoming events near you.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.map((event) => {
                const isRegistered = event.participants.includes(authUser._id);

                return (
                  <div
                    key={event._id}
                    className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{event.title}</h3>
                        <p className="text-sm text-gray-500">{event.organizerName}</p>
                      </div>
                      <div className="bg-red-50 text-[#b30000] font-bold px-3 py-1 rounded-lg text-xs text-center">
                        {new Date(event.date).getDate()}
                        <span className="block text-[10px] uppercase">
                          {new Date(event.date).toLocaleString('default', { month: 'short' })}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {event.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <MapPin size={14} /> {event.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users size={14} /> {event.participants.length} Joining
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleEvent(event._id, isRegistered)}
                      className={`w-full py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition duration-200 ${
                        isRegistered
                          ? "bg-red-100 text-red-700 hover:bg-red-200 border border-red-200"
                          : "bg-gray-900 text-white hover:bg-gray-800"
                      }`}
                    >
                      {isRegistered ? (
                        <>
                          <X size={16} /> Leave Drive
                        </>
                      ) : (
                        "Join Drive"
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default HomePage;
