import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import CampusMap from '../components/CampusMap';

const CONDITIONS = ['Brand New', 'Like New', 'Used - Good', 'Used - Fair'];

function PostItem() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('for-sale');
  const [condition, setCondition] = useState('Used - Good');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState({
    spotName: 'Campus Central',
    lat: 37.7749,
    lng: -122.4194,
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title || !description) {
      setError('Title and Description are required.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('condition', condition);
    formData.append('price', category === 'for-sale' ? (price || 0) : 0);
    formData.append('spotName', location.spotName);
    formData.append('lat', location.lat);
    formData.append('lng', location.lng);

    if (image) {
      formData.append('image', image);
    }

    try {
      setSubmitting(true);
      await api.post('/listings', formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong posting listing');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2>Post an item</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ maxWidth: '100%' }}>
        <label style={{ fontWeight: 600 }}>Title:</label>
        <input
          type="text"
          placeholder="Title (e.g., Wireless Mouse, Organic Chem Notes)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <label style={{ fontWeight: 600 }}>Description:</label>
        <textarea
          placeholder="Detailed description of the item..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          required
        />

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontWeight: 600 }}>Category:</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="for-sale">For sale</option>
              <option value="free">Free</option>
              <option value="lost">Lost</option>
              <option value="found">Found</option>
            </select>
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ fontWeight: 600 }}>Condition:</label>
            <select value={condition} onChange={(e) => setCondition(e.target.value)}>
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {category === 'for-sale' && (
          <div>
            <label style={{ fontWeight: 600 }}>Price (Rs):</label>
            <input
              type="number"
              min="0"
              placeholder="Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
        )}

        <div>
          <label style={{ fontWeight: 600 }}>Item Image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
          />
        </div>

        <div style={{ marginTop: '12px' }}>
          <label style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>
            📍 Select Campus Meetup Spot (Live GPS & Map):
          </label>
          <CampusMap
            initialSpotName={location.spotName}
            initialLat={location.lat}
            initialLng={location.lng}
            isEditable={true}
            onLocationSelect={(loc) => setLocation(loc)}
          />
        </div>

        <button type="submit" disabled={submitting} style={{ marginTop: '16px' }}>
          {submitting ? 'Publishing...' : 'Publish Listing'}
        </button>
      </form>
    </div>
  );
}

export default PostItem;
