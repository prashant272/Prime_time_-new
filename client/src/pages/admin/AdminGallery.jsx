import React, { useState, useEffect } from 'react';
import { 
  useGetGalleryQuery, 
  useUpdateGalleryMutation, 
  useUploadGalleryPhotoMutation 
} from '../../store/apiSlice';
import { Loader2, Save, Upload, Trash2, Image as ImageIcon, Video, Film } from 'lucide-react';

export default function AdminGallery() {
  const { data: galleryResponse, isLoading, isError, refetch } = useGetGalleryQuery();
  const [updateGallery, { isLoading: isUpdating }] = useUpdateGalleryMutation();
  const [uploadPhoto, { isLoading: isUploading }] = useUploadGalleryPhotoMutation();

  const [activeTab, setActiveTab] = useState('photos');
  const [reelsText, setReelsText] = useState('');
  const [videosText, setVideosText] = useState('');
  const [photosList, setPhotosList] = useState([]);

  useEffect(() => {
    if (galleryResponse?.data) {
      const { reels, videos, photos } = galleryResponse.data;
      setReelsText(reels ? reels.join(',\n') : '');
      setVideosText(videos ? videos.join(',\n') : '');
      setPhotosList(photos || []);
    }
  }, [galleryResponse]);

  const handleSaveReels = async () => {
    try {
      const reelsArray = reelsText
        .split(',')
        .map(url => url.trim())
        .filter(url => url !== '');
      await updateGallery({ reels: reelsArray }).unwrap();
      alert('Reels updated successfully');
    } catch (error) {
      alert('Failed to update reels');
    }
  };

  const handleSaveVideos = async () => {
    try {
      const videosArray = videosText
        .split(',')
        .map(url => url.trim())
        .filter(url => url !== '');
      await updateGallery({ videos: videosArray }).unwrap();
      alert('Videos updated successfully');
    } catch (error) {
      alert('Failed to update videos');
    }
  };

  const handlePhotoUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('images', files[i]);
      }
      
      const res = await uploadPhoto(formData).unwrap();
      if (res.success) {
        setPhotosList(res.data.photos);
        alert('Photo uploaded successfully');
      }
    } catch (error) {
      alert('Failed to upload photo');
    }
  };

  const handleDeletePhoto = async (photoUrl) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) return;

    try {
      const newPhotosList = photosList.filter(url => url !== photoUrl);
      await updateGallery({ photos: newPhotosList }).unwrap();
      setPhotosList(newPhotosList);
      alert('Photo removed successfully');
    } catch (error) {
      alert('Failed to remove photo');
    }
  };

  if (isLoading) return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
    </div>
  );

  if (isError) return (
    <div className="flex h-64 flex-col items-center justify-center text-red-500">
      <p>Error loading gallery data.</p>
      <button onClick={refetch} className="mt-4 rounded-md bg-sky-500 px-4 py-2 text-white hover:bg-sky-600">Retry</button>
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Media Gallery Management</h1>
      </div>

      <div className="flex space-x-1 rounded-xl bg-white p-1 shadow-sm border border-gray-100">
        <button
          onClick={() => setActiveTab('photos')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium leading-5 transition-all
            ${activeTab === 'photos' 
              ? 'bg-sky-50 text-sky-700 shadow'
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}
        >
          <ImageIcon className="h-5 w-5" /> Photos
        </button>
        <button
          onClick={() => setActiveTab('reels')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium leading-5 transition-all
            ${activeTab === 'reels' 
              ? 'bg-sky-50 text-sky-700 shadow'
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}
        >
          <Film className="h-5 w-5" /> Reels
        </button>
        <button
          onClick={() => setActiveTab('videos')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium leading-5 transition-all
            ${activeTab === 'videos' 
              ? 'bg-sky-50 text-sky-700 shadow'
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}
        >
          <Video className="h-5 w-5" /> Videos
        </button>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        {activeTab === 'photos' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Gallery Photos</h2>
                <p className="text-sm text-gray-500">Upload new photos directly to your media gallery.</p>
              </div>
              <div>
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-600 transition-colors">
                  {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  <span>{isUploading ? 'Uploading...' : 'Upload Photo'}</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    disabled={isUploading}
                  />
                </label>
              </div>
            </div>

            {photosList.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
                <ImageIcon className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No photos</h3>
                <p className="mt-1 text-sm text-gray-500">Upload some photos to see them here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {photosList.map((photoUrl, index) => (
                  <div key={index} className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                    <img 
                      src={photoUrl.startsWith('/') && !photoUrl.startsWith('http') ? `http://localhost:5001${photoUrl}` : photoUrl} 
                      alt={`Gallery ${index}`} 
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => handleDeletePhoto(photoUrl)}
                        className="rounded-full bg-red-500 p-2 text-white hover:bg-red-600 focus:outline-none"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reels' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-medium text-gray-900">YouTube Reels / Shorts</h2>
              <p className="text-sm text-gray-500">Paste your YouTube Short URLs here, separated by commas.</p>
            </div>
            
            <textarea
              rows={8}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm font-mono p-3 border"
              placeholder="https://www.youtube.com/shorts/U6HlrIGLbUE,&#10;https://www.youtube.com/shorts/Q8wuGQbKsc4"
              value={reelsText}
              onChange={(e) => setReelsText(e.target.value)}
            />
            
            <div className="flex justify-end">
              <button
                onClick={handleSaveReels}
                disabled={isUpdating}
                className="flex items-center gap-2 rounded-md bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-600 disabled:opacity-50"
              >
                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Reels
              </button>
            </div>
          </div>
        )}

        {activeTab === 'videos' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-medium text-gray-900">YouTube Videos</h2>
              <p className="text-sm text-gray-500">Paste your full YouTube Video URLs here, separated by commas.</p>
            </div>
            
            <textarea
              rows={8}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm font-mono p-3 border"
              placeholder="https://www.youtube.com/watch?v=FjIu3q-j9xQ,&#10;https://www.youtube.com/watch?v=33aGtyG0V9s"
              value={videosText}
              onChange={(e) => setVideosText(e.target.value)}
            />
            
            <div className="flex justify-end">
              <button
                onClick={handleSaveVideos}
                disabled={isUpdating}
                className="flex items-center gap-2 rounded-md bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-600 disabled:opacity-50"
              >
                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Videos
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
