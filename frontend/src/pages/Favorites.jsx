import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ContactModal from '../components/ContactModal';
import ChatModal from '../components/ChatModal';
import OfferModal from '../components/OfferModal';

function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [selectedContactAuthor, setSelectedContactAuthor] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [activeChatListing, setActiveChatListing] = useState(null);
  const [offerListing, setOfferListing] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/favorites');
      setFavorites(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError('Could not load favorites');
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRemoveFavorite = async (listingId) => {
    try {
      await api.post('/users/favorites', { listingId });
      setFavorites(favorites.filter((f) => f._id !== listingId));
    } catch (err) {
      alert('Failed to remove from favorites');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-semibold text-[#8C7A6B] mb-4">
        <Link to="/" className="hover:text-[#C85A32]">Home</Link>
        <span>/</span>
        <span className="text-[#2C221E]">Saved Favorites</span>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#2C221E] flex items-center gap-2">
          <span className="text-red-500">❤️</span> Saved Campus Items
        </h1>
        <p className="text-sm text-[#8C7A6B]">Keep track of items you're interested in buying or trading later.</p>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-16 text-[#8C7A6B]">
          <span className="material-symbols-outlined text-4xl animate-spin mb-2">sync</span>
          <p className="font-semibold text-sm">Loading your saved favorites...</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl mb-6 text-sm flex items-center gap-2">
          <span className="material-symbols-outlined">error</span>
          {error}
        </div>
      )}

      {!loading && !error && favorites.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#E5DEC9] p-8 max-w-md mx-auto">
          <span className="material-symbols-outlined text-5xl text-[#8C7A6B] mb-3">
            favorite_border
          </span>
          <h3 className="text-lg font-bold text-[#2C221E] mb-1">No Saved Favorites</h3>
          <p className="text-sm text-[#8C7A6B] mb-6">
            Click the heart icon on any campus listing to bookmark items here.
          </p>
          <Link
            to="/"
            className="px-5 py-2.5 bg-[#C85A32] text-white font-bold text-sm rounded-xl"
          >
            Browse Marketplace
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {favorites.map((item) => (
          <div
            key={item._id}
            className="bg-white rounded-2xl border border-[#E5DEC9] overflow-hidden shadow-sm flex flex-col group"
          >
            <div className="relative aspect-video sm:aspect-square bg-[#FAF7F2] overflow-hidden">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-[#8C7A6B]">
                  <span className="material-symbols-outlined text-4xl mb-1">inventory_2</span>
                  <span className="text-xs font-semibold">No Image</span>
                </div>
              )}

              <button
                onClick={() => handleRemoveFavorite(item._id)}
                className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-lg shadow-md hover:bg-white text-red-500 transition"
                title="Remove from Favorites"
              >
                💔
              </button>
            </div>

            <div className="p-4 flex flex-col flex-grow">
              <h3 className="font-bold text-[#2C221E] text-base line-clamp-1 mb-1">
                {item.title}
              </h3>
              {item.category === 'for-sale' ? (
                <p className="text-lg font-extrabold text-[#C85A32] mb-2">Rs. {item.price}</p>
              ) : (
                <p className="text-xs font-bold text-green-700 mb-2 uppercase">{item.category}</p>
              )}

              <p className="text-xs text-[#8C7A6B] line-clamp-2 mb-4">{item.description}</p>

              <div className="mt-auto grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setSelectedContactAuthor(item.postedBy);
                    setSelectedListing(item);
                  }}
                  className="py-2 bg-[#FAF7F2] hover:bg-[#F5EBE6] text-[#2C221E] font-semibold text-xs border border-[#E5DEC9] rounded-lg transition flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">contact_phone</span>
                  Contact
                </button>

                <button
                  onClick={() => setActiveChatListing(item)}
                  className="py-2 bg-[#2C221E] hover:bg-[#1A1412] text-white font-semibold text-xs rounded-lg transition flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">chat</span>
                  Chat
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

      {offerListing && (
        <OfferModal
          listing={offerListing}
          onClose={() => setOfferListing(null)}
        />
      )}
    </div>
  );
}

export default Favorites;
