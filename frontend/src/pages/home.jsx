import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ContactModal from '../components/ContactModal';
import ChatModal from '../components/ChatModal';
import OfferModal from '../components/OfferModal';

const CATEGORIES = [
  { id: 'all', label: 'All Items', icon: 'grid_view' },
  { id: 'for-sale', label: 'For Sale', icon: 'sell' },
  { id: 'free', label: 'Free Giveaways', icon: 'volunteer_activism' },
  { id: 'lost', label: 'Lost Items', icon: 'search' },
  { id: 'found', label: 'Found Items', icon: 'check_circle' },
];

const CONDITIONS = ['all', 'Brand New', 'Like New', 'Used - Good', 'Used - Fair'];

function Home() {
  const [listings, setListings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Sorting
  const [category, setCategory] = useState('all');
  const [condition, setCondition] = useState('all');
  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Modal States
  const [selectedContactAuthor, setSelectedContactAuthor] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [activeChatListing, setActiveChatListing] = useState(null);
  const [offerListing, setOfferListing] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
  const token = localStorage.getItem('token');

  const fetchListings = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (category !== 'all') params.category = category;
      if (condition !== 'all') params.condition = condition;
      if (search) params.search = search;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (sortBy) params.sortBy = sortBy;

      const res = await api.get('/listings', { params });
      setListings(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError('Could not load listings. Please check your connection.');
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserFavorites = async () => {
    if (!token) return;
    try {
      const res = await api.get('/users/favorites');
      if (Array.isArray(res.data)) {
        setFavorites(res.data.map((item) => item._id || item));
      }
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    fetchListings();
  }, [category, condition, search, minPrice, maxPrice, sortBy]);

  useEffect(() => {
    fetchUserFavorites();
  }, [token]);

  const handleToggleInterest = async (listingId) => {
    if (!token) {
      alert('Please log in to express interest in this item.');
      return;
    }
    try {
      const res = await api.post(`/listings/${listingId}/interest`);
      setListings(listings.map((item) => (item._id === listingId ? res.data.listing : item)));
    } catch (err) {
      alert(err.response?.data?.message || 'Could not update interest');
    }
  };

  const handleToggleFavorite = async (listingId) => {
    if (!token) {
      alert('Please log in to save items to your favorites.');
      return;
    }
    try {
      const res = await api.post('/users/favorites', { listingId });
      setFavorites(res.data.favorites || []);
    } catch (err) {
      alert('Could not update favorites');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF7F2]">
      {/* Compact Hero Banner */}
      <div className="bg-[#2C221E] text-white py-6 px-4 sm:px-6 lg:px-8 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Buy, Sell & Trade on <span className="text-[#E0A96D]">Campus</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/post"
              className="px-5 py-2.5 bg-[#C85A32] hover:bg-[#B04A25] text-white font-bold rounded-xl transition shadow-sm inline-flex items-center gap-2 text-sm"
            >
              <span className="material-symbols-outlined text-lg">add_circle</span>
              List an Item
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Category Chip Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
                category === cat.id
                  ? 'bg-[#C85A32] text-white shadow-sm'
                  : 'bg-white text-[#2C221E] hover:bg-[#F5EBE6] border border-[#E5DEC9]'
              }`}
            >
              <span className="material-symbols-outlined text-lg">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-white rounded-2xl p-5 border border-[#E5DEC9] shadow-sm mb-8 space-y-4">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#8C7A6B]">
              search
            </span>
            <input
              type="text"
              placeholder="Search textbooks, laptop, bike, dorm items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#FAF7F2] border border-[#E5DEC9] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C85A32] focus:bg-white text-[#2C221E]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-[#8C7A6B] uppercase mb-1">
                Item Condition
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DEC9] rounded-lg text-sm text-[#2C221E] focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
              >
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>
                    {c === 'all' ? 'All Conditions' : c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#8C7A6B] uppercase mb-1">
                Price Filter (Rs.)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DEC9] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
                />
                <span className="text-[#8C7A6B] font-bold">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DEC9] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#8C7A6B] uppercase mb-1">
                Sort Listings
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DEC9] rounded-lg text-sm text-[#2C221E] focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="most_interested">Most Interested</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading / Error States */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 text-[#8C7A6B]">
            <span className="material-symbols-outlined text-4xl animate-spin mb-2">sync</span>
            <p className="font-semibold text-sm">Loading active campus listings...</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl mb-6 text-sm flex items-center gap-2">
            <span className="material-symbols-outlined">error</span>
            {error}
          </div>
        )}

        {!loading && !error && listings.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#E5DEC9] p-8 max-w-md mx-auto">
            <span className="material-symbols-outlined text-5xl text-[#8C7A6B] mb-3">
              search_off
            </span>
            <h3 className="text-lg font-bold text-[#2C221E] mb-1">No Listings Found</h3>
            <p className="text-sm text-[#8C7A6B] mb-6">
              Try adjusting your search criteria or price filters to view active campus items.
            </p>
            <button
              onClick={() => {
                setCategory('all');
                setCondition('all');
                setSearch('');
                setMinPrice('');
                setMaxPrice('');
              }}
              className="px-4 py-2 bg-[#C85A32] text-white font-semibold rounded-lg text-sm"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* Listings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {listings.map((item) => {
            const isInterested = item.interestedUsers?.some(
              (u) => (u._id || u) === currentUser?.id
            );
            const isFavorite = favorites.includes(item._id);
            const isAuthor = (item.postedBy?._id || item.postedBy) === currentUser?.id;

            const ratings = item.postedBy?.ratings || [];
            const avgRating =
              ratings.length > 0
                ? (ratings.reduce((s, r) => s + r.rating, 0) / ratings.length).toFixed(1)
                : null;

            return (
              <div
                key={item._id}
                className="bg-white rounded-2xl border border-[#E5DEC9] overflow-hidden shadow-sm hover:shadow-md transition flex flex-col group"
              >
                {/* Image Wrap */}
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
                      <span className="text-xs font-semibold">No Image Uploaded</span>
                    </div>
                  )}

                  {/* Favorite Toggle */}
                  {token && (
                    <button
                      onClick={() => handleToggleFavorite(item._id)}
                      className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-lg shadow-md hover:bg-white transition"
                      title={isFavorite ? 'Remove from Favorites' : 'Save to Favorites'}
                    >
                      {isFavorite ? '❤️' : '🤍'}
                    </button>
                  )}

                  {/* Category Pill */}
                  <div className="absolute top-3 left-3 flex gap-1">
                    <span className="px-2.5 py-1 bg-[#2C221E]/80 backdrop-blur-sm text-white text-[11px] font-bold rounded-lg uppercase tracking-wider">
                      {item.category}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 flex flex-col flex-grow">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-bold text-[#2C221E] text-base line-clamp-1">
                      {item.title}
                    </h3>
                    <span className="text-xs font-semibold text-[#8C7A6B] px-2 py-0.5 bg-[#FAF7F2] border border-[#E5DEC9] rounded">
                      {item.condition || 'Used'}
                    </span>
                  </div>

                  {item.category === 'for-sale' ? (
                    <p className="text-xl font-extrabold text-[#C85A32] mb-2">
                      Rs. {item.price}
                    </p>
                  ) : (
                    <p className="text-sm font-bold text-green-700 mb-2 uppercase tracking-wide">
                      {item.category}
                    </p>
                  )}

                  <p className="text-xs text-[#8C7A6B] line-clamp-2 mb-3 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="mt-auto pt-3 border-t border-[#E5DEC9] space-y-1 text-xs">
                    <div className="flex items-center justify-between text-[#2C221E]">
                      <span className="font-semibold flex items-center gap-1 truncate">
                        <span className="material-symbols-outlined text-sm text-[#8C7A6B]">
                          person
                        </span>
                        {item.postedBy?.name || 'Student'}
                      </span>
                      {avgRating && (
                        <span className="font-bold text-amber-600 flex items-center gap-0.5">
                          ⭐ {avgRating}
                        </span>
                      )}
                    </div>

                    {item.meetupLocation?.spotName && (
                      <p className="text-[#8C7A6B] flex items-center gap-1 text-[11px] truncate">
                        <span className="material-symbols-outlined text-sm text-[#C85A32]">
                          location_on
                        </span>
                        {item.meetupLocation.spotName}
                      </p>
                    )}

                    {item.interestedUsers?.length > 0 && (
                      <p className="text-[#C85A32] font-semibold text-[11px] flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">favorite</span>
                        {item.interestedUsers.length} student(s) interested
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <button
                      onClick={() => {
                        setSelectedContactAuthor(item.postedBy);
                        setSelectedListing(item);
                      }}
                      className="w-full py-2 bg-[#FAF7F2] hover:bg-[#F5EBE6] text-[#2C221E] font-semibold text-xs border border-[#E5DEC9] rounded-lg transition flex items-center justify-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">contact_phone</span>
                      Contact
                    </button>

                    {token && (
                      <button
                        onClick={() => setActiveChatListing(item)}
                        className="w-full py-2 bg-[#2C221E] hover:bg-[#1A1412] text-white font-semibold text-xs rounded-lg transition flex items-center justify-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">chat</span>
                        Chat
                      </button>
                    )}

                    {!isAuthor && token && (
                      <>
                        <button
                          onClick={() => handleToggleInterest(item._id)}
                          className={`w-full py-2 font-semibold text-xs rounded-lg transition flex items-center justify-center gap-1 col-span-1 ${
                            isInterested
                              ? 'bg-red-50 text-red-600 border border-red-200'
                              : 'bg-white hover:bg-gray-50 text-[#2C221E] border border-[#E5DEC9]'
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm text-red-500">
                            {isInterested ? 'favorite' : 'favorite_border'}
                          </span>
                          {isInterested ? 'Interested' : 'Interest'}
                        </button>

                        {item.category === 'for-sale' && (
                          <button
                            onClick={() => setOfferListing(item)}
                            className="w-full py-2 bg-[#C85A32] hover:bg-[#B04A25] text-white font-semibold text-xs rounded-lg transition flex items-center justify-center gap-1 col-span-1"
                          >
                            <span className="material-symbols-outlined text-sm">payments</span>
                            Offer
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#2C221E] text-[#E5DEC9] pt-12 pb-8 border-t border-white/10 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#C85A32] text-white flex items-center justify-center font-bold text-lg">
                  <span className="material-symbols-outlined text-xl">storefront</span>
                </div>
                <span className="font-extrabold text-white text-lg">CampusMarket</span>
              </div>
              <p className="text-xs text-[#8C7A6B] leading-relaxed">
                The trusted peer-to-peer marketplace for college campus students.
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold text-sm mb-3 uppercase tracking-wider">Quick Links</h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/" className="hover:text-white transition">Browse All Items</Link></li>
                <li><Link to="/post" className="hover:text-white transition">Post New Item</Link></li>
                <li><Link to="/my-listings" className="hover:text-white transition">My Listings</Link></li>
                <li><Link to="/favorites" className="hover:text-white transition">Saved Favorites</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-sm mb-3 uppercase tracking-wider">Categories</h4>
              <ul className="space-y-2 text-xs">
                <li><button onClick={() => setCategory('for-sale')} className="hover:text-white transition text-left">Textbooks & Books</button></li>
                <li><button onClick={() => setCategory('for-sale')} className="hover:text-white transition text-left">Electronics & Laptops</button></li>
                <li><button onClick={() => setCategory('free')} className="hover:text-white transition text-left">Free Campus Giveaways</button></li>
                <li><button onClick={() => setCategory('lost')} className="hover:text-white transition text-left">Lost & Found Portal</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-sm mb-3 uppercase tracking-wider">Campus Support</h4>
              <p className="text-xs text-[#8C7A6B] mb-2">Have questions or need assistance?</p>
              <a
                href="mailto:support@campusmarketplace.edu"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E0A96D] hover:underline"
              >
                <span className="material-symbols-outlined text-sm">mail</span>
                support@campusmarketplace.edu
              </a>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8C7A6B] gap-4">
            <p>© 2026 Campus Marketplace. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span className="hover:text-white transition cursor-pointer">Privacy Policy</span>
              <span>•</span>
              <span className="hover:text-white transition cursor-pointer">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
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

export default Home;
