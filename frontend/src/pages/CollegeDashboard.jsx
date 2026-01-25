import React, { useState, useEffect } from "react";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "../store/useAuthStore";
import { 
  Plus, Calendar, MapPin, Users, Edit2, X, Clock, Trash2, 
  Phone, Droplet, UserCheck, CheckCircle, Award 
} from "lucide-react";
import { toast } from "react-hot-toast";

const CollegeDashboard = () => {
  const { authUser } = useAuthStore();
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // === PARTICIPANTS STATE ===
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

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

  // === HELPER: CHECK EVENT STATUS ===
  const getEventStatus = (event) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(event.date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + (event.numberOfDays || 1));

    if (today < startDate) return "UPCOMING";
    if (today >= startDate && today < endDate) return "ACTIVE"; // Green
    return "COMPLETED"; // Red
  };

  // === HANDLE VIEW PARTICIPANTS ===
  const handleViewParticipants = async (event) => {
    setSelectedEvent(event);
    setShowParticipantsModal(true);
    setLoadingParticipants(true);
    
    try {
        const res = await axiosInstance.get(`/events/${event._id}/participants`);
        setParticipants(res.data);
    } catch (error) {
        console.error(error);
        toast.error("Could not fetch student list");
        setParticipants([]);
    } finally {
        setLoadingParticipants(false);
    }
  };

  // === ACTIONS: MARK DONATED ===
  const handleMarkDonated = async (studentId) => {
    if (!window.confirm("Confirm this student has donated blood? This will generate their certificate.")) return;

    try {
        await axiosInstance.post(`/events/${selectedEvent._id}/donated`, { studentId });
        
        // Optimistic Update
        setParticipants(prev => prev.map(p => 
            p._id === studentId ? { ...p, isVerifiedDonor: true } : p
        ));
        
        toast.success("Student Marked as Donor! Certificate Generated.");
    } catch (error) {
        toast.error("Failed to update status");
    }
  };

  // === ACTIONS: MARK PRESENT ===
  const handleMarkPresent = (studentId) => {
    toast.success("Student marked Present");
    // Logic to update local visual state if needed
  };

  // === DELETE FUNCTION ===
  const handleDelete = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      await axiosInstance.delete(`/events/${eventId}`);
      setEvents((prevEvents) => prevEvents.filter((event) => event._id !== eventId));
      toast.success("Event deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete event");
    }
  };

  // === ADD/EDIT HANDLERS ===
  const handleAddClick = () => {
    setFormData({
      title: "",
      description: "",
      date: "",
      numberOfDays: 1,
      location: authUser?.address || authUser?.location || "College Campus",
      organizerName: authUser?.collegeName || authUser?.fullName || "",
      contactNumber: authUser?.phone || "",
    });
    setIsEditing(false);
    setCurrentEventId(null);
    setShowModal(true);
  };

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
            <p className="text-gray-500">Manage your Blood Drives & Student Verifications</p>
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
              <h3 className="text-xl font-bold text-gray-400">No Events Created Yet</h3>
              <p className="text-gray-400">Click the button above to schedule your first Blood Drive.</p>
            </div>
          ) : (
            events.map((event) => {
              const status = getEventStatus(event);

              return (
                <div key={event._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition relative overflow-hidden flex flex-col">
                  
                  {/* === LIVE STATUS STRIP === */}
                  <div className={`h-2 w-full ${
                    status === 'ACTIVE' ? 'bg-green-500 animate-pulse' : 
                    status === 'COMPLETED' ? 'bg-red-500' : 'bg-gray-300'
                  }`} />

                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-red-50 p-3 rounded-lg">
                        <Calendar className="text-[#b30000]" size={24} />
                      </div>
                      
                      {/* === STATUS BADGE (Interactive if Active) === */}
                      <button
                        disabled={status !== 'ACTIVE'}
                        onClick={() => status === 'ACTIVE' && handleViewParticipants(event)}
                        className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 transition ${
                            status === 'ACTIVE' 
                            ? 'bg-green-100 text-green-700 cursor-pointer hover:bg-green-200 ring-2 ring-green-500 ring-offset-1' 
                            : status === 'COMPLETED'
                            ? 'bg-red-100 text-red-700 cursor-default'
                            : 'bg-gray-100 text-gray-500 cursor-default'
                        }`}
                      >
                        {status === 'ACTIVE' && <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />}
                        {status === 'ACTIVE' ? "LIVE NOW" : status === 'COMPLETED' ? "DONE" : "UPCOMING"}
                      </button>
                    </div>

                    <h3 className="text-xl font-bold text-gray-800 mb-2">{event.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">{event.description}</p>

                    <div className="space-y-2 text-gray-600 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                        {event.numberOfDays > 1 && <span className="text-xs bg-gray-100 px-1 rounded">(+{event.numberOfDays - 1} days)</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={16} />
                        <span>{event.location}</span>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                        <div className="text-xs text-gray-500 font-bold flex items-center gap-1">
                            <Users size={14} /> {event.participants?.length || 0} Reg.
                        </div>
                        
                        <div className="flex gap-2">
                            {/* Always allow viewing list (restored feature) */}
                            <button 
                                onClick={() => handleViewParticipants(event)} 
                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition"
                                title="View Participants List"
                            >
                                <Users size={18} />
                            </button>

                            <button onClick={() => handleEditClick(event)} className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50">
                                <Edit2 size={18} />
                            </button>
                            <button onClick={() => handleDelete(event._id)} className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* === CREATE/EDIT MODAL === */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200 shadow-2xl">
              <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
              <h2 className="text-2xl font-bold mb-6 text-gray-800">{isEditing ? "Edit Blood Drive" : "Create New Drive"}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Event Title</label>
                  <input type="text" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Date</label>
                        <input type="date" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Duration</label>
                        <input type="number" min="1" max="7" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" value={formData.numberOfDays} onChange={(e) => setFormData({ ...formData, numberOfDays: e.target.value })} />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Location</label>
                    <input type="text" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                    <textarea required rows="3" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>
                <button type="submit" className="w-full bg-[#b30000] text-white py-3 rounded-xl font-bold hover:bg-red-800 transition shadow-lg mt-2">{isEditing ? "Save Changes" : "Create Event"}</button>
              </form>
            </div>
          </div>
        )}

        {/* === LIVE ATTENDANCE / PARTICIPANTS MODAL === */}
        {showParticipantsModal && selectedEvent && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                <div className="bg-white rounded-2xl w-full max-w-3xl p-6 relative animate-in fade-in zoom-in duration-200 shadow-2xl flex flex-col max-h-[85vh]">
                    
                    <button onClick={() => setShowParticipantsModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>

                    <div className="flex items-center gap-3 mb-1">
                        {getEventStatus(selectedEvent) === 'ACTIVE' && <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />}
                        <h2 className="text-xl font-bold text-gray-800">
                            {getEventStatus(selectedEvent) === 'ACTIVE' ? "Live Attendance" : "Participant List"}
                        </h2>
                    </div>
                    <p className="text-gray-500 text-sm mb-6 border-b pb-4">Managing: <span className="font-bold text-black">{selectedEvent.title}</span></p>

                    {loadingParticipants ? (
                        <div className="flex-1 flex justify-center items-center p-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto pr-2">
                            {participants.length === 0 ? (
                                <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-xl border border-dashed">
                                    <Users size={40} className="mx-auto mb-2 opacity-20" />
                                    <p>No students have registered yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {participants.map((student) => (
                                        <div key={student._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 gap-4">
                                            
                                            {/* Student Info */}
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                                                    {student.fullName?.charAt(0) || "S"}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800">{student.fullName}</p>
                                                    <p className="text-xs text-gray-500">{student.email}</p> {/* Restored Email Display */}
                                                    <div className="flex gap-2 text-xs text-gray-500 mt-1">
                                                        <span className="bg-white px-1 rounded border flex items-center gap-1">
                                                            <Droplet size={10} className="text-red-500" /> {student.bloodGroup || "N/A"}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Phone size={10} /> {student.phone}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Actions */}
                                            <div className="flex items-center gap-3">
                                                <button 
                                                    onClick={() => handleMarkPresent(student._id)}
                                                    className="px-4 py-2 text-xs font-bold bg-white border border-gray-200 rounded-lg hover:bg-gray-100 text-gray-700 flex items-center gap-1 transition"
                                                >
                                                    <CheckCircle size={14} /> PRESENT
                                                </button>

                                                {student.isVerifiedDonor ? (
                                                    <div className="px-4 py-2 text-xs font-bold bg-green-100 text-green-700 rounded-lg flex items-center gap-1 border border-green-200">
                                                        <Award size={14} /> CERTIFIED
                                                    </div>
                                                ) : (
                                                    <button 
                                                        onClick={() => handleMarkDonated(student._id)}
                                                        className="px-4 py-2 text-xs font-bold bg-[#b30000] text-white rounded-lg hover:bg-red-800 flex items-center gap-1 transition shadow-sm"
                                                    >
                                                        <Droplet size={14} /> MARK DONATED
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    
                    <div className="mt-4 text-right text-xs text-gray-400">
                        Total Registered: {participants.length}
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default CollegeDashboard;