import React, { useState, useEffect } from 'react';
import { axiosInstance } from '../lib/axios';
import { Calendar, MapPin, Users, PlusCircle, Trash2, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';

const CollegeDashboard = () => {
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New Event Form State
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    location: ""
  });

  // Fetch Events on Load
  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      const res = await axiosInstance.get('/college/my-events');
      setEvents(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/college/create-event', newEvent);
      toast.success("Blood Drive Created Successfully!");
      setIsModalOpen(false);
      fetchMyEvents(); // Refresh list
      setNewEvent({ title: "", date: "", location: "" }); // Reset form
    } catch (error) {
      toast.error("Failed to create event");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">College Dashboard</h1>
                <p className="text-gray-500">Manage your Blood Drive events here.</p>
            </div>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-indigo-700 text-white px-5 py-3 rounded-xl font-bold hover:bg-indigo-800 transition shadow-lg"
            >
                <PlusCircle size={20} /> Create New Event
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
                events.map(event => (
                    <div key={event._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-indigo-50 p-3 rounded-lg">
                                <Calendar className="text-indigo-600" size={24} />
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                new Date(event.date).toDateString() === new Date().toDateString() 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                                {new Date(event.date).toDateString() === new Date().toDateString() ? 'Active Today' : 'Upcoming'}
                            </span>
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{event.title}</h3>
                        
                        <div className="space-y-2 text-gray-600 text-sm mb-6">
                            <div className="flex items-center gap-2">
                                <Clock size={16} />
                                <span>{new Date(event.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin size={16} />
                                <span>{event.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users size={16} />
                                <span>{event.participants.length} Registered</span>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>

        {/* Create Modal */}
        {isModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">Schedule Blood Drive</h2>
                    <form onSubmit={handleCreateEvent} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Event Title</label>
                            <input 
                                className="w-full p-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="e.g., Annual CSE Blood Camp"
                                value={newEvent.title}
                                onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Date</label>
                            <input 
                                type="date"
                                className="w-full p-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={newEvent.date}
                                onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Campus Location</label>
                            <input 
                                className="w-full p-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="e.g., Main Auditorium"
                                value={newEvent.location}
                                onChange={e => setNewEvent({...newEvent, location: e.target.value})}
                                required
                            />
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button 
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 py-3 font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                className="flex-1 py-3 font-bold text-white bg-indigo-700 hover:bg-indigo-800 rounded-xl transition shadow-lg"
                            >
                                Create Event
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default CollegeDashboard;