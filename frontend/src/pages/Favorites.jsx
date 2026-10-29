import { useState, useEffect } from 'react';
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
      setFavorites(favorites.filter(f => f._id !== listingId));
    } catch (err) {
      alert('Failed to remove from favorites');
    }
  };

  return (
    <div>
      <h2>❤️ My Favorite Listings</h2>
      {loading && <p>Loading favorites...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && favorites.length === 0 && (
        <p>You haven't saved any listings to your favorites yet.</p>
      )}

      <div className="grid">
        {favorites.map((item) => (
          <div key={item._id} className="card">
            {item.image ? (
              <img src={item.image} alt={item.title} />
            ) : (
              <div className="no-image">No image</div>
            )}
            <div className="card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={`badge badge-${item.category}`}>{item.category}</span>
                <span className="badge-condition">{item.condition || 'Used'}</span>
              </div>

              <h3 className="card-title">{item.title}</h3>
              {item.category === 'for-sale' && <p className="price">Rs {item.price}</p>}
              <p className="card-desc">{item.description}</p>

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

                <button className="btn-chat" onClick={() => setActiveChatListing(item)}>
                  💬 Chat
                </button>

                <button
                  className="btn-danger"
                  style={{ fontSize: '0.8rem', padding: '4px 8px' }}
                  onClick={() => handleRemoveFavorite(item._id)}
                >
                  💔 Remove
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
