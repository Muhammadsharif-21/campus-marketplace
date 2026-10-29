function ContactModal({ author, listingTitle, onClose }) {
  if (!author) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Author Contact Details</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <p className="modal-subtitle">Listing: <strong>{listingTitle}</strong></p>

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
        </div>
      </div>
    </div>
  );
}

export default ContactModal;
