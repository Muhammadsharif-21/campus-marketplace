import { useState, useEffect } from 'react';
import api from '../api/axios';
import ContactModal from '../components/ContactModal';
import ChatModal from '../components/ChatModal';

const CATEGORIES = ['all', 'for-sale', 'free', 'lost', 'found'];

function Home() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');

  // Modal States
  const [selectedContactAuthor, setSelectedContactAuthor] = useState(null);
  const [selectedContactListingTitle, setSelectedContactListingTitle] = useState('');
  const [activeChatListing, setActiveChatListing] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
  const token = localStorage.getItem('token');

  const fetchListings = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (category !== 'all') params.category = category;
      if (search) params.search = search;

      const res = await api.get('/listings', { params });
      setListings(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError('Could not load listings');
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [category, search]);

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

  return (
    <div>
      <h2>Listings</h2>

      <input
        className="search"
        type="text"
        placeholder="Search by title..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="filters">
        {CATEGORIES.map((c) => (
          <button key={c} onClick={() => setCategory(c)} disabled={category === c}>
            {c}
          </button>
        ))}
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && listings.length === 0 && <p>No listings found.</p>}

      <div className="grid">
        {listings.map((item) => {
          const isInterested = item.interestedUsers?.some(
            (u) => (u._id || u) === currentUser?.id
          );
          const isAuthor = (item.postedBy?._id || item.postedBy) === currentUser?.id;

          return (
            <div key={item._id} className="card">
              {item.image ? (
                <img src={item.image} alt={item.title} />
              ) : (
                <div className="no-image">No image</div>
              )}
              <div className="card-body">
                <span className={`badge badge-${item.category}`}>{item.category}</span>
                <h3 className="card-title">{item.title}</h3>
                {item.category === 'for-sale' && <p className="price">Rs {item.price}</p>}
                <p className="card-desc">{item.description}</p>
                <p className="card-meta">Posted by {item.postedBy?.name || 'User'}</p>

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
                      setSelectedContactListingTitle(item.title);
                    }}
                  >
                    📞 Contact Details
                  </button>

                  {!isAuthor && token && (
                    <button
                      className={`btn-interest ${isInterested ? 'interested' : ''}`}
                      onClick={() => handleToggleInterest(item._id)}
                    >
                      {isInterested ? '❤️ Interested ✓' : '🤍 Interested'}
                    </button>
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
          listingTitle={selectedContactListingTitle}
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

export default Home;
