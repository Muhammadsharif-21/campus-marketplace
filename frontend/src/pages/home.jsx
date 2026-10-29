import { useState, useEffect } from 'react';
import api from '../api/axios';
import ContactModal from '../components/ContactModal';
import ChatModal from '../components/ChatModal';
import OfferModal from '../components/OfferModal';

const CATEGORIES = ['all', 'for-sale', 'free', 'lost', 'found'];
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
      setError('Could not load listings');
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
        setFavorites(res.data.map(item => item._id || item));
      }
    } catch (err) {
      // Ignore
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
      alert('Please log in to mark interest');
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
      alert('Please log in to save favorites');
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
    <div>
      <h2>Listings</h2>

      {/* Search and Filters Bar */}
      <div className="filter-panel">
        <input
          className="search"
          type="text"
          placeholder="Search by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="filter-row">
          <div className="filter-group">
            <label>Category:</label>
            <div className="filters">
              {CATEGORIES.map((c) => (
                <button key={c} onClick={() => setCategory(c)} disabled={category === c}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label>Condition:</label>
            <select value={condition} onChange={(e) => setCondition(e.target.value)}>
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>{c === 'all' ? 'All Conditions' : c}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Price Range (Rs):</label>
            <div className="price-inputs">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="filter-group">
            <label>Sort By:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="most_interested">Most Interested</option>
            </select>
          </div>
        </div>
      </div>

      {loading && <p>Loading listings...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && listings.length === 0 && <p>No listings found matching criteria.</p>}

      <div className="grid">
        {listings.map((item) => {
          const isInterested = item.interestedUsers?.some(
            (u) => (u._id || u) === currentUser?.id
          );
          const isFavorite = favorites.includes(item._id);
          const isAuthor = (item.postedBy?._id || item.postedBy) === currentUser?.id;

          const ratings = item.postedBy?.ratings || [];
          const avgRating = ratings.length > 0
            ? (ratings.reduce((s, r) => s + r.rating, 0) / ratings.length).toFixed(1)
            : null;

          return (
            <div key={item._id} className="card">
              <div className="card-image-wrapper">
                {item.image ? (
                  <img src={item.image} alt={item.title} />
                ) : (
                  <div className="no-image">No image</div>
                )}
                {token && (
                  <button
                    className={`fav-btn ${isFavorite ? 'active' : ''}`}
                    onClick={() => handleToggleFavorite(item._id)}
                    title={isFavorite ? 'Remove from Favorites' : 'Save to Favorites'}
                  >
                    {isFavorite ? '❤️' : '🤍'}
                  </button>
                )}
              </div>

              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={`badge badge-${item.category}`}>{item.category}</span>
                  <span className="badge-condition">{item.condition || 'Used'}</span>
                </div>

                <h3 className="card-title">{item.title}</h3>
                {item.category === 'for-sale' && <p className="price">Rs {item.price}</p>}
                <p className="card-desc">{item.description}</p>

                <p className="card-meta">
                  Posted by <strong>{item.postedBy?.name || 'User'}</strong>
                  {avgRating && <span className="seller-star-badge"> ⭐ {avgRating}</span>}
                </p>

                {item.meetupLocation?.spotName && (
                  <p className="location-meta">📍 Meetup: {item.meetupLocation.spotName}</p>
                )}

                {item.interestedUsers?.length > 0 && (
                  <p className="interested-count">
                    👥 {item.interestedUsers.length} interested
                  </p>
                )}

                <div className="card-action-buttons">
                  <button
                    className="btn-info"
                    onClick={() => {
                      setSelectedContactAuthor(item.postedBy);
                      setSelectedListing(item);
                    }}
                  >
                    📞 Contact & Location
                  </button>

                  {!isAuthor && token && (
                    <>
                      <button
                        className={`btn-interest ${isInterested ? 'interested' : ''}`}
                        onClick={() => handleToggleInterest(item._id)}
                      >
                        {isInterested ? '❤️ Interested ✓' : '🤍 Interested'}
                      </button>

                      {item.category === 'for-sale' && (
                        <button
                          className="btn-offer"
                          onClick={() => setOfferListing(item)}
                        >
                          💰 Make an Offer
                        </button>
                      )}
                    </>
                  )}

                  {token && (
                    <button
                      className="btn-chat"
                      onClick={() => setActiveChatListing(item)}
                    >
                      💬 Chat
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
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

export default Home;
