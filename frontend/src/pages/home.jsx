import { useState, useEffect } from 'react';
import api from '../api/axios';

function Home() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await api.get('/listings');
        setListings(res.data);
      } catch (err) {
        setError('Could not load listings');
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h2>Listings</h2>
      {listings.length === 0 && <p>No listings yet.</p>}
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