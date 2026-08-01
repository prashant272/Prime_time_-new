import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  useGetAwardCategoriesQuery,
  useGetAwardEventsQuery,
  useCreateAwardEventMutation,
  useUpdateAwardEventMutation,
  useDeleteAwardEventMutation
} from '../../store/apiSlice';
import { Plus, Edit2, Trash2, X, Image as ImageIcon, Video, Calendar, MapPin } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const inputClass = "w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";

const AdminAwardEvents = () => {
  const [selectedCategory, setSelectedCategory] = useState('');

  const { data: catResponse } = useGetAwardCategoriesQuery();
  const categories = catResponse?.data || [];

  const { data: eventsResponse, isLoading } = useGetAwardEventsQuery(
    { category: selectedCategory, admin: 'true' },
    { skip: !selectedCategory }
  );
  
  // Sort events so 'upcoming' status is always at the top
  const events = (eventsResponse?.data || []).slice().sort((a, b) => {
    if (a.status === 'upcoming' && b.status !== 'upcoming') return -1;
    if (a.status !== 'upcoming' && b.status === 'upcoming') return 1;
    return 0;
  });

  const [createEvent, { isLoading: isCreating }] = useCreateAwardEventMutation();
  const [updateEvent, { isLoading: isUpdating }] = useUpdateAwardEventMutation();
  const [deleteEvent] = useDeleteAwardEventMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '', year: '', chiefGuest: '', eventDate: '', venue: '',
    shortDescription: '', narrativeHtml: '', status: 'draft', openForNomination: false, order: 0
  });

  const [heroImageFile, setHeroImageFile] = useState(null);
  const [galleryImageFiles, setGalleryImageFiles] = useState([]);

  const [videoGalleryInput, setVideoGalleryInput] = useState('');

  const [existingHero, setExistingHero] = useState(null);
  const [existingGallery, setExistingGallery] = useState([]);

  // Load first category automatically
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].slug);
    }
  }, [categories]);

  const handleOpenModal = (ev = null) => {
    if (ev) {
      setEditingEvent(ev);
      setFormData({
        title: ev.title || '',
        year: ev.year || '',
        chiefGuest: ev.chiefGuest || '',
        eventDate: ev.eventDate ? ev.eventDate.split('T')[0] : '',
        venue: ev.venue || '',
        shortDescription: ev.shortDescription || '',
        narrativeHtml: ev.narrativeHtml || '',
        status: ev.status || 'draft',
        openForNomination: ev.openForNomination || false,
        order: ev.order || 0
      });
      setVideoGalleryInput(ev.videoGallery?.map(v => v.url).join(', ') || '');
      setExistingHero(ev.heroImage?.url || null);
      setExistingGallery(ev.galleryImages || []);
    } else {
      setEditingEvent(null);
      setFormData({
        title: '', year: '', chiefGuest: '', eventDate: '', venue: '',
        shortDescription: '', narrativeHtml: '', status: 'draft', openForNomination: false, order: 0
      });
      setVideoGalleryInput('');
      setExistingHero(null);
      setExistingGallery([]);
    }
    setHeroImageFile(null);
    setGalleryImageFiles([]);
    setStatusMessage(null);
    setIsModalOpen(true);
  };

  // Removed add/remove individual video field handlers

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));

      const catObj = categories.find(c => c.slug === selectedCategory);
      if (catObj && !editingEvent) data.append('category', catObj._id);

      // Clean video gallery (remove empty ones)
      const validVideos = videoGalleryInput.split(',')
        .map(v => v.trim())
        .filter(v => v !== '')
        .map(url => ({ url, title: '' }));
      data.append('videoGallery', JSON.stringify(validVideos));

      if (heroImageFile) data.append('heroImage', heroImageFile);
      if (galleryImageFiles.length > 0) {
        Array.from(galleryImageFiles).forEach(file => data.append('galleryImages', file));
      }

      if (editingEvent) {
        // Keep existing gallery images
        data.append('existingGalleryImages', JSON.stringify(existingGallery));
        await updateEvent({ id: editingEvent._id, formData: data }).unwrap();
        setStatusMessage({ type: 'success', text: 'Event updated successfully!' });
      } else {
        await createEvent(data).unwrap();
        setStatusMessage({ type: 'success', text: 'Event created successfully!' });
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Auto-close form after short delay on success
      setTimeout(() => {
        setIsModalOpen(false);
        setStatusMessage(null);
      }, 1500);

    } catch (err) {
      const errMsg = err.data?.message || err.error || err.message || JSON.stringify(err);
      setStatusMessage({ type: 'error', text: `Action failed: ${errMsg}` });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      await deleteEvent(id).unwrap();
    }
  };

  const isSaving = isCreating || isUpdating;

  if (isModalOpen) {
    return (
      <div className="space-y-8 max-w-5xl mx-auto p-4 md:p-8">
        <Helmet><title>{editingEvent ? "Edit Event" : "Create New Event"} | Admin</title></Helmet>

        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-4 z-10">
          <h2 className="text-2xl font-bold text-slate-800">{editingEvent ? "Edit Event" : "Create New Event"}</h2>
          <button onClick={() => { setIsModalOpen(false); setStatusMessage(null); }} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {statusMessage && (
          <div className={`p-4 rounded-xl font-medium border ${statusMessage.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
            {statusMessage.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Basic Info */}
            <div className="space-y-5 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Basic Information</h3>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Event Title *</label>
                <input required className={inputClass} value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Global Education Awards 2026" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Year *</label>
                <div className="flex gap-4">
                  <input required className={inputClass} value={formData.year} onChange={e => setFormData({ ...formData, year: e.target.value })} placeholder="e.g. 2026" />
                  <div className="w-1/3">
                    <input type="number" className={inputClass} value={formData.order} onChange={e => setFormData({ ...formData, order: Number(e.target.value) })} placeholder="Order" title="Display Order" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Status</label>
                <select className={inputClass} value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                  <option value="upcoming">Upcoming</option>
                  <option value="past">Past</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>

            {/* Event Details */}
            <div className="space-y-5 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Event Details</h3>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Venue</label>
                <input className={inputClass} value={formData.venue} onChange={e => setFormData({ ...formData, venue: e.target.value })} placeholder="City, Country" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Date</label>
                <input type="date" className={inputClass} value={formData.eventDate} onChange={e => setFormData({ ...formData, eventDate: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Chief Guest</label>
                <input className={inputClass} value={formData.chiefGuest} onChange={e => setFormData({ ...formData, chiefGuest: e.target.value })} placeholder="e.g. Mrs. Waluscha De Sousa" />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Short Event Description (Hero Banner)</label>
              <textarea className={`${inputClass} min-h-[80px]`} value={formData.shortDescription} onChange={e => setFormData({ ...formData, shortDescription: e.target.value })} placeholder="Brief summary for the top banner..." />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Detail Event Description (HTML allowed)</label>
              <textarea className={`${inputClass} min-h-[120px]`} value={formData.narrativeHtml} onChange={e => setFormData({ ...formData, narrativeHtml: e.target.value })} placeholder="Describe the event..." />
            </div>
          </div>

          {/* Media Section */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-8">
            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Media Assets</h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Hero Image */}
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-slate-700">Hero Image</label>
                {(existingHero || heroImageFile) && (
                  <div className="relative w-full h-40 rounded-lg overflow-hidden border border-slate-200 group">
                    <img src={heroImageFile ? URL.createObjectURL(heroImageFile) : existingHero} alt="Hero" className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 bg-slate-900/80 px-2 py-1 rounded text-xs text-white font-medium shadow-sm">{heroImageFile ? 'New Selection' : 'Current Image'}</div>
                    {heroImageFile && (
                      <button type="button" onClick={() => setHeroImageFile(null)} className="absolute inset-0 bg-red-600/90 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity font-bold">
                        Remove Selection
                      </button>
                    )}
                  </div>
                )}
                <div className="relative">
                  <input type="file" id="hero-upload" accept="image/*" onChange={e => setHeroImageFile(e.target.files[0])} className="hidden" />
                  <label htmlFor="hero-upload" className="flex flex-col items-center justify-center w-full py-6 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer text-slate-500 hover:text-blue-600">
                    <ImageIcon size={24} className="mb-2" />
                    <span className="text-sm font-medium">{existingHero ? 'Replace Image' : 'Upload Hero Image'}</span>
                  </label>
                </div>
              </div>

              {/* Gallery Images */}
              {formData.status !== 'upcoming' && (
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-slate-700">Photo Gallery</label>

                  {existingGallery.length > 0 && (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Current Gallery ({existingGallery.length})</p>
                      <div className="flex flex-wrap gap-3">
                        {existingGallery.map((img, i) => (
                          <div key={i} className="relative w-16 h-16 rounded-md overflow-hidden border border-slate-300 shadow-sm group">
                            <img src={img.url} alt="Archive" className="w-full h-full object-cover" />
                            <button type="button" onClick={() => setExistingGallery(prev => prev.filter((_, idx) => idx !== i))} className="absolute inset-0 bg-red-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {galleryImageFiles.length > 0 && (
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                      <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-3">Selected to Upload ({galleryImageFiles.length})</p>
                      <div className="flex flex-wrap gap-3">
                        {Array.from(galleryImageFiles).map((file, i) => (
                          <div key={i} className="relative w-16 h-16 rounded-md overflow-hidden border border-blue-300 shadow-sm group">
                            <img src={URL.createObjectURL(file)} alt="Staged" className="w-full h-full object-cover" />
                            <button type="button" onClick={() => {
                              const dt = new DataTransfer();
                              Array.from(galleryImageFiles).filter((_, idx) => idx !== i).forEach(f => dt.items.add(f));
                              setGalleryImageFiles(dt.files);
                            }} className="absolute inset-0 bg-red-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="relative">
                    <input type="file" id="gallery-upload" multiple accept="image/*" onChange={e => setGalleryImageFiles(e.target.files)} className="hidden" />
                    <label htmlFor="gallery-upload" className="flex flex-col items-center justify-center w-full py-6 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer text-slate-500 hover:text-blue-600">
                      <Plus size={24} className="mb-2" />
                      <span className="text-sm font-medium">Add Photos</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Video Links */}
            {formData.status !== 'upcoming' && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2"><Video size={16} /> YouTube Video Links</label>
                <textarea className={`${inputClass} min-h-[80px] font-mono text-sm`} placeholder="https://youtube.com/watch?v=..., https://youtu.be/..." value={videoGalleryInput} onChange={e => setVideoGalleryInput(e.target.value)} />
                <p className="text-xs text-slate-500 mt-1">Separate multiple URLs with commas.</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4 pb-12">
            <button type="button" onClick={() => { setIsModalOpen(false); setStatusMessage(null); }} className="px-6 py-2.5 text-slate-700 font-semibold hover:bg-slate-200 rounded-lg transition-colors" disabled={isSaving}>Cancel</button>
            <button type="submit" disabled={isSaving} className="px-8 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {isSaving ? 'Saving Event Data...' : 'Save Event Data'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 md:p-8">
      <Helmet><title>Manage Award Events | Admin</title></Helmet>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Award Events Management</h1>
          <p className="text-slate-500 text-sm mt-1">Create and manage award ceremonies and summits.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={20} /> Add New Event
        </button>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center gap-4">
        <label className="font-semibold text-slate-700 whitespace-nowrap">Filter by Category:</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full md:max-w-xs bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="" disabled>Select a Category...</option>
          {categories.map(c => <option key={c._id} value={c.slug}>{c.name}</option>)}
        </select>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin" />
          <p className="font-medium text-slate-500">Loading events...</p>
        </div>
      )}

      {/* Data Table */}
      {!isLoading && selectedCategory && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Order</th>
                  <th className="px-6 py-4">Event Details</th>
                  <th className="px-6 py-4">Date & Venue</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {events.map((ev) => (
                  <tr key={ev._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-700 text-base">{ev.order || 0}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                          {ev.heroImage?.url ? (
                            <img src={ev.heroImage.url} alt={ev.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400"><ImageIcon size={20} /></div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-base">{ev.title}</p>
                          <p className="text-slate-500 mt-0.5">Year: {ev.year}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-1.5 text-slate-700"><Calendar size={14} className="text-blue-500" /> {ev.eventDate ? new Date(ev.eventDate).toLocaleDateString() : 'N/A'}</span>
                        <span className="flex items-center gap-1.5 text-slate-700"><MapPin size={14} className="text-emerald-500" /> {ev.venue || 'TBD'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${ev.status === 'past' ? 'bg-slate-100 text-slate-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {ev.status.charAt(0).toUpperCase() + ev.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleOpenModal(ev)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleDelete(ev._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {events.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <p className="text-slate-500 text-base font-medium">No events found in this category.</p>
                      <button onClick={() => handleOpenModal()} className="mt-4 text-blue-600 hover:underline font-medium">Create the first event</button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminAwardEvents;
