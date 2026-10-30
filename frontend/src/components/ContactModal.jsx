import { useState } from 'react';
import RatingModal from './RatingModal';
import CampusMap from './CampusMap';

function ContactModal({ author, listing, onClose }) {
  const [showRatingModal, setShowRatingModal] = useState(false);
  if (!author) return null;

  const ratings = author.ratings || [];
  const avgRating = ratings.length > 0
    ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
    : null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Seller & Contact Details</h3>
            <button className="close-btn" onClick={onClose}>&times;</button>
          </div>
          {listing && <p className="modal-subtitle">Listing: <strong>{listing.title}</strong></p>}

          <div className="contact-info">
            <div className="info-row">
              <span className="info-label">Name:</span>
              <span className="info-value">{author.name || 'Anonymous'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Email:</span>
              <span className="info-value">
                <a href={`mailto:${author.email}`}>{author.email || 'N/A'}</a>
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Phone:</span>
              <span className="info-value">
                {author.phone ? (
                  <a href={`tel:${author.phone}`}>{author.phone}</a>
                ) : (
                  'Not provided'
                )}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Seller Rating:</span>
              <span className="info-value" style={{ fontWeight: 600, color: '#f59e0b' }}>
                {avgRating ? `⭐ ${avgRating} / 5 (${ratings.length} reviews)` : 'No ratings yet'}
              </span>
            </div>
          </div>

          {listing?.meetupLocation && (
            <div style={{ marginTop: '16px' }}>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '0.95rem' }}>📍 Designated Meetup Spot</h4>
              <CampusMap
                initialLat={listing.meetupLocation.lat || 37.7749}
                initialLng={listing.meetupLocation.lng || -122.4194}
                initialSpotName={listing.meetupLocation.spotName || 'Campus Central'}
                isEditable={false}
              />
            </div>
          )}

          <button
            className="btn-secondary"
            style={{ marginTop: '16px' }}
            onClick={() => setShowRatingModal(true)}
          >
            ⭐ Rate / Review Seller
          </button>
        </div>
      </div>

      {showRatingModal && (
        <RatingModal
          targetUser={author}
          onClose={() => setShowRatingModal(false)}
        />
      )}
    </>
  );
}

export default ContactModal;
