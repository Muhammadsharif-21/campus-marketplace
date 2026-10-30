import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ContactModal from '../components/ContactModal';
import ChatModal from '../components/ChatModal';

function MyListings() {
  const [listings, setListings] = useState([]);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  // Modal States
  const [selectedContactAuthor, setSelectedContactAuthor] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [activeChatListing, setActiveChatListing] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    const fetchMine = async () => {
      try {
        const res = await api.get('/listings/mine');
        setListings(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setError('Could not load your listings');
        setListings([]);
      }
    };
    fetchMine();
  }, []);

  const handleResolve = async (id) => {
    try {
      await api.patch(`/listings/${id}`, { status: 'resolved' });
      setListings(
        listings.map((item) =>
          item._id === id ? { ...item, status: 'resolved' } : item
        )
      );
      setMsg('Listing marked as resolved.');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setError('Could not update the listing status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing permanently?')) return;
    try {
      await api.delete(`/listings/${id}`);
      setListings(listings.filter((item) => item._id !== id));
      setMsg('Listing removed.');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setError('Could not delete the listing');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-semibold text-[#8C7A6B] mb-4">
        <Link to="/" className="hover:text-[#C85A32]">Home</Link>
        <span>/</span>
        <span className="text-[#2C221E]">My Postings</span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#2C221E]">My Campus Listings</h1>
          <p className="text-sm text-[#8C7A6B]">Manage your active posts, view interested buyers, and resolve sold items.</p>
        </div>
        <Link
          to="/post"
          className="px-5 py-2.5 bg-[#C85A32] hover:bg-[#B04A25] text-white font-bold text-sm rounded-xl shadow-sm transition inline-flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">add_circle</span>
          Post New Item
        </Link>
      </div>

      {msg && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 text-sm font-medium rounded-xl flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">check_circle</span>
          {msg}
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-medium rounded-xl flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">error</span>
          {error}
        </div>
      )}

      {listings.length === 0 && !error && (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#E5DEC9] p-8 max-w-md mx-auto">
          <span className="material-symbols-outlined text-5xl text-[#8C7A6B] mb-3">
            post_add
          </span>
          <h3 className="text-lg font-bold text-[#2C221E] mb-1">No Listings Created</h3>
          <p className="text-sm text-[#8C7A6B] mb-6">
            You haven't listed any textbooks, electronics, or dorm items yet.
          </p>
          <Link
            to="/post"
            className="px-5 py-2.5 bg-[#C85A32] text-white font-bold text-sm rounded-xl"
          >
            Create Your First Listing
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((item) => (
          <div
            key={item._id}
            className="bg-white rounded-2xl border border-[#E5DEC9] overflow-hidden shadow-sm flex flex-col"
          >
            <div className="relative aspect-video bg-[#FAF7F2] overflow-hidden">
              {item.image ? (
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-[#8C7A6B]">
                  <span className="material-symbols-outlined text-4xl mb-1">inventory_2</span>
                  <span className="text-xs font-semibold">No Image Uploaded</span>
                </div>
              )}

              <div className="absolute top-3 left-3 flex gap-2">
                <span className="px-2.5 py-1 bg-[#2C221E]/80 backdrop-blur-sm text-white text-[11px] font-bold rounded-lg uppercase">
                  {item.category}
                </span>
                <span
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg uppercase ${
                    item.status === 'resolved'
                      ? 'bg-gray-200 text-gray-700'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {item.status}
                </span>
              </div>
            </div>

            <div className="p-5 flex flex-col flex-grow">
              <h3 className="font-bold text-[#2C221E] text-lg mb-1">{item.title}</h3>
              {item.category === 'for-sale' && (
                <p className="text-xl font-extrabold text-[#C85A32] mb-3">Rs. {item.price}</p>
              )}

              {/* Interested Users Section */}
              {item.interestedUsers?.length > 0 && (
                <div className="bg-[#FAF7F2] border border-[#E5DEC9] rounded-xl p-3 mb-4 space-y-2">
                  <p className="text-xs font-bold text-[#C85A32] uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">favorite</span>
                    Interested Students ({item.interestedUsers.length})
                  </p>
                  <div className="space-y-1">
                    {item.interestedUsers.map((user) => (
                      <div key={user._id || user} className="text-xs text-[#2C221E] flex items-center justify-between">
                        <span className="font-semibold">{user.name || 'Student'}</span>
                        <a href={`mailto:${user.email}`} className="text-[#8C7A6B] hover:underline font-mono text-[11px]">
                          {user.email}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-auto pt-4 border-t border-[#E5DEC9] grid grid-cols-2 gap-2">
                <button
                  onClick={() => setActiveChatListing(item)}
                  className="py-2 bg-[#2C221E] hover:bg-[#1A1412] text-white font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1 col-span-2 sm:col-span-1"
                >
                  <span className="material-symbols-outlined text-sm">chat</span>
                  Messages
                </button>

                {item.status === 'active' ? (
                  <button
                    onClick={() => handleResolve(item._id)}
                    className="py-2 bg-green-700 hover:bg-green-800 text-white font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1 col-span-2 sm:col-span-1"
                  >
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    Mark Resolved
                  </button>
                ) : (
                  <span className="py-2 bg-gray-100 text-gray-500 font-semibold text-xs rounded-xl flex items-center justify-center gap-1 col-span-2 sm:col-span-1">
                    Resolved
                  </span>
                )}

                <button
                  onClick={() => handleDelete(item._id)}
                  className="py-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1 col-span-2 mt-1"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                  Delete Listing
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedContactAuthor && (
        <ContactModal
          author={selectedContactAuthor}
          listing={selectedListing}
          onClose={() => setSelectedContactAuthor(null)}
        />
      )}

      {activeChatListing && (
        <ChatModal
          listing={activeChatListing}
          currentUser={currentUser}
          onClose={() => setActiveChatListing(null)}
        />
      )}
    </div>
  );
}

export default MyListings;
