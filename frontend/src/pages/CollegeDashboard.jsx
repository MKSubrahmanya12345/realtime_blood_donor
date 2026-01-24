import React, { useState, useEffect } from "react";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "../store/useAuthStore";
import { Plus, Calendar, MapPin, Users, Edit2, X, Clock } from "lucide-react";
import { toast } from "react-hot-toast";

const CollegeDashboard = () => {
  const { authUser } = useAuthStore();
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // === EDIT STATE ===
  const [isEditing, setIsEditing] = useState(false);
  const [currentEventId, setCurrentEventId] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    numberOfDays: 1,
    location: "",
    organizerName: authUser?.collegeName || "",
    contactNumber: authUser?.phone || "",
  });

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      const res = await axiosInstance.get("/events/my-events");
      setEvents(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load events");
    }
  };

  // === ADD MODE ===
    const handleAddClick = () => {
        setFormData({
            title: "",
            description: "",
            date: "",
            numberOfDays: 1,
            // Pre-fill visual feedback for the user
            location: authUser?.address || authUser?.location || "College Campus",
            organizerName: authUser?.collegeName || authUser?.fullName || "",
            contactNumber: authUser?.phone || "",
        });
        setIsEditing(false);
        setCurrentEventId(null);
        setShowModal(true);
    };

  // === EDIT MODE ===
  const handleEditClick = (event) => {
    setFormData({
      title: event.title,
      description: event.description,
      date: new Date(event.date).toISOString().split("T")[0],
      numberOfDays: event.numberOfDays || 1,
      location: event.location,
      organizerName: event.organizerName,
      contactNumber: event.contactNumber,
    });
    setCurrentEventId(event._id);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axiosInstance.put(`/events/${currentEventId}`, formData);
        toast.success("Event Updated Successfully!");
      } else {
        await axiosInstance.post("/events/create", formData);
        toast.success("Event Created Successfully!");
      }

      setShowModal(false);
      fetchMyEvents();
    } catch (error) {
      console.error(error);
      toast.error("Operation Failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">College Dashboard</h1>
            <p className="text-gray-500">
              Manage your Blood Drives & Student Verifications
            </p>
          </div>
          <button
            onClick={handleAddClick}
            className="flex items-center gap-2 bg-[#b30000] text-white px-5 py-3 rounded-xl font-bold hover:bg-red-800 transition shadow-lg"
          >
            <Plus size={20} /> Create Drive
          </button>
        </div>

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-white rounded-2xl shadow-sm border border-dashed border-gray-300">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-400">
                No Events Created Yet
              </h3>
              <p className="text-gray-400">
                Click the button above to schedule your first Blood Drive.
              </p>
            </div>
          ) : (
            events.map((event) => (
              <div
                key={event._id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-red-50 p-3 rounded-lg">
                      <Calendar className="text-[#b30000]" size={24} />
                    </div>
                    <button
                      onClick={() => handleEditClick(event)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition"
                    >
                      <Edit2 size={18} />
                    </button>
                  </div>

                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {event.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {event.description}
                  </p>

                  <div className="space-y-2 text-gray-600 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      <span>
                        {new Date(event.date).toLocaleDateString()}
                        {event.numberOfDays > 1 &&
                          ` (+${event.numberOfDays - 1} days)`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin size={16} />
                      <span>{event.location}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Users size={16} />
                      <span>
                        {event.participants?.length || 0} Students Joined
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200 shadow-2xl">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>

              <h2 className="text-2xl font-bold mb-6 text-gray-800">
                {isEditing ? "Edit Blood Drive" : "Create New Drive"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Event Title
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      Duration (Days)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="7"
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                      value={formData.numberOfDays}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          numberOfDays: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    required
                    rows="3"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#b30000] text-white py-3 rounded-xl font-bold hover:bg-red-800 transition shadow-lg mt-2"
                >
                  {isEditing ? "Save Changes" : "Create Event"}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CollegeDashboard;
