import { useState, useEffect } from 'react';
import api from '../api/axios';

const CATEGORIES = ['all', 'for-sale', 'free', 'lost', 'found'];

function Home() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      setError('');
      try {
        const params = {};
        if (category !== 'all') params.category = category;
        if (search) params.search = search;

        const res = await api.get('/listings', { params });
        setListings(res.data);
      } catch (err) {
        setError('Could not load listings');
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, [category, search]);

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
        {listings.map((item) => (
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
              <p className="card-meta">Posted by {item.postedBy?.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;