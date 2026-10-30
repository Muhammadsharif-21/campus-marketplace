import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import CampusMap from '../components/CampusMap';

const CONDITIONS = ['Brand New', 'Like New', 'Used - Good', 'Used - Fair'];

function PostItem() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('for-sale');
  const [condition, setCondition] = useState('Used - Good');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState({
    spotName: 'Campus Central Student Union',
    lat: 37.7749,
    lng: -122.4194,
  });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!title || !description) {
      setError('Title and Description are required.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('condition', condition);
    formData.append('price', category === 'for-sale' ? (price || 0) : 0);
    formData.append('spotName', location.spotName);
    formData.append('lat', location.lat);
    formData.append('lng', location.lng);

    if (image) {
      formData.append('image', image);
    }

    try {
      setSubmitting(true);
      await api.post('/listings', formData);
      setSuccessMsg('Your campus listing has been created successfully!');
      setTimeout(() => {
        navigate('/');
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create listing. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Header Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-[#8C7A6B] mb-4">
        <Link to="/" className="hover:text-[#C85A32]">Home</Link>
        <span>/</span>
        <span className="text-[#2C221E]">Post Listing</span>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5DEC9] p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#E5DEC9]">
          <div className="w-12 h-12 rounded-xl bg-[#F5EBE6] text-[#C85A32] flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">add_circle</span>
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-[#2C221E]">List an Item on Campus</h2>
            <p className="text-xs text-[#8C7A6B]">Share textbooks, electronics, dorm items, or lost & found reports with fellow students.</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-medium rounded-xl flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">error</span>
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 text-sm font-medium rounded-xl flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">check_circle</span>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 max-w-none">
          <div>
            <label className="block text-xs font-bold text-[#8C7A6B] uppercase mb-1">
              Listing Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Organic Chemistry 8th Ed Textbook, Ergonomic Chair, Airpods Pro"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#E5DEC9] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C85A32] focus:bg-white text-[#2C221E]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#8C7A6B] uppercase mb-1">
              Item Description <span className="text-red-500">*</span>
            </label>
            <textarea
              placeholder="Describe condition, edition, brand, reason for selling, or any minor defects..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#E5DEC9] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C85A32] focus:bg-white text-[#2C221E]"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#8C7A6B] uppercase mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#E5DEC9] rounded-xl text-sm text-[#2C221E] focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
              >
                <option value="for-sale">For Sale (Price required)</option>
                <option value="free">Free Giveaway</option>
                <option value="lost">Lost Item</option>
                <option value="found">Found Item</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#8C7A6B] uppercase mb-1">
                Condition
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#E5DEC9] rounded-xl text-sm text-[#2C221E] focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
              >
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {category === 'for-sale' && (
            <div>
              <label className="block text-xs font-bold text-[#8C7A6B] uppercase mb-1">
                Selling Price (Rs.) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#E5DEC9] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C85A32] focus:bg-white text-[#2C221E]"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#8C7A6B] uppercase mb-1">
              Item Photo (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className="w-full px-4 py-2 bg-[#FAF7F2] border border-[#E5DEC9] rounded-xl text-sm text-[#8C7A6B] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#C85A32] file:text-white hover:file:bg-[#B04A25]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#8C7A6B] uppercase mb-2">
              📍 Campus Meetup Location & GPS Coordinates
            </label>
            <CampusMap
              initialSpotName={location.spotName}
              initialLat={location.lat}
              initialLng={location.lng}
              isEditable={true}
              onLocationSelect={(loc) => setLocation(loc)}
            />
          </div>

          <div className="pt-4 border-t border-[#E5DEC9] flex items-center justify-end gap-3">
            <Link
              to="/"
              className="px-5 py-2.5 bg-white border border-[#E5DEC9] text-[#2C221E] hover:bg-[#FAF7F2] font-semibold text-sm rounded-xl transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-[#C85A32] hover:bg-[#B04A25] text-white font-bold text-sm rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="material-symbols-outlined text-lg animate-spin">sync</span>
                  Publishing...
                </>
              ) : (
                'Publish Campus Listing'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PostItem;
