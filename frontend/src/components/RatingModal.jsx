import { useState } from 'react';
import api from '../api/axios';

function RatingModal({ targetUser, onClose, onRatingSubmitted }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!targetUser?._id && !targetUser?.id) return;
    const userId = targetUser._id || targetUser.id;

    try {
      setSubmitting(true);
      setError('');
      await api.post(`/users/${userId}/rate`, { rating: Number(rating), comment });
      if (onRatingSubmitted) onRatingSubmitted();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Rate & Review Seller</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <p className="modal-subtitle">Rating for <strong>{targetUser?.name || 'Seller'}</strong></p>

        {error && <p style={{ color: 'red', margin: '8px 0' }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Score (1 to 5 stars):</label>
          <select value={rating} onChange={(e) => setRating(e.target.value)}>
            <option value={5}>⭐⭐⭐⭐⭐ (5 - Excellent)</option>
            <option value={4}>⭐⭐⭐⭐ (4 - Very Good)</option>
            <option value={3}>⭐⭐⭐ (3 - Average)</option>
            <option value={2}>⭐⭐ (2 - Below Average)</option>
            <option value={1}>⭐ (1 - Poor)</option>
          </select>

          <label style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: '8px' }}>Comment:</label>
          <textarea
            placeholder="Share your experience dealing with this seller..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
          />

          <button type="submit" disabled={submitting} style={{ marginTop: '12px' }}>
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default RatingModal;
