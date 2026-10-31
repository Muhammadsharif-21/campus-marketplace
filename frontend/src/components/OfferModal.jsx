import { useState } from 'react';
import api from '../api/axios';

function OfferModal({ listing, onClose, onOfferSubmitted }) {
  const [amount, setAmount] = useState(listing.price ? Math.round(listing.price * 0.9) : '');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid offer amount');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const res = await api.post(`/listings/${listing._id}/offer`, { amount: Number(amount) });
      if (onOfferSubmitted) onOfferSubmitted(res.data.listing);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit offer');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Make an Offer</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <p className="modal-subtitle">Item: <strong>{listing.title}</strong> (Listed Price: Rs {listing.price})</p>

        {error && <p style={{ color: 'red', margin: '8px 0' }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Your Offer Price (Rs):</label>
          <input
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter offer amount..."
            required
          />

          <button type="submit" disabled={submitting} style={{ marginTop: '12px' }}>
            {submitting ? 'Submitting Offer...' : 'Send Offer to Seller'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default OfferModal;
