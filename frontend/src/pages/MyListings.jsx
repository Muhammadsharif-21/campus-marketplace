import { useState, useEffect } from 'react';
import api from '../api/axios';
import ContactModal from '../components/ContactModal';
import ChatModal from '../components/ChatModal';

function MyListings() {
  const [listings, setListings] = useState([]);
  const [error, setError] = useState('');

  // Modal States
  const [selectedContactAuthor, setSelectedContactAuthor] = useState(null);
  const [selectedContactListingTitle, setSelectedContactListingTitle] = useState('');
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
    } catch (err) {
      setError('Could not update the listing');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this listing?')) return;
    try {
      await api.delete(`/listings/${id}`);
      setListings(listings.filter((item) => item._id !== id));
    } catch (err) {
      setError('Could not delete the listing');
    }
  };

  return (
    <div>
      <h2>My listings</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {listings.length === 0 && !error && <p>You haven't posted anything yet.</p>}

      <div className="grid">
        {listings.map((item) => (
          <div key={item._id} className="card">
            {item.image ? (
              <img src={item.image} alt={item.title} />
            ) : (
              <div className="no-image">No image</div>
            )}
            <div className="card-body">
              <div>
                <span className={`badge badge-${item.category}`}>{item.category}</span>{' '}
                <span className={`badge badge-${item.status}`}>{item.status}</span>
              </div>
              <h3 className="card-title">{item.title}</h3>
              {item.category === 'for-sale' && <p className="price">Rs {item.price}</p>}

              {item.interestedUsers?.length > 0 && (
                <div className="interested-section">
                  <p className="interested-title">Interested Users ({item.interestedUsers.length}):</p>
                  <ul className="interested-list">
                    {item.interestedUsers.map(user => (
                      <li key={user._id || user}>
                        {user.name} ({user.email})
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="actions">
                <button
                  className="btn-chat"
                  onClick={() => setActiveChatListing(item)}
                >
                  💬 Chat
                </button>
                {item.status === 'active' && (
                  <button className="btn-success" onClick={() => handleResolve(item._id)}>
                    Mark resolved
                  </button>
                )}
                <button className="btn-danger" onClick={() => handleDelete(item._id)}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
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

export default MyListings;
