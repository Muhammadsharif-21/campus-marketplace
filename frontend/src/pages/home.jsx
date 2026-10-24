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
        type="text"
        placeholder="Search by title..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div>
        {CATEGORIES.map((c) => (
          <button key={c} onClick={() => setCategory(c)} disabled={category === c}>
            {c}
          </button>
        ))}
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && listings.length === 0 && <p>No listings found.</p>}

      {listings.map((item) => (
        <div key={item._id}>
          {item.image && <img src={item.image} alt={item.title} width="200" />}
          <h3>{item.title}</h3>
          <p>{item.description}</p>
          <p>Category: {item.category}</p>
          {item.category === 'for-sale' && <p>Price: {item.price}</p>}
          <p>Posted by {item.postedBy?.name}</p>
        </div>
      ))}
    </div>
  );
}

export default Home;