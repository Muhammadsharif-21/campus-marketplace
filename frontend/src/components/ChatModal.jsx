import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';

function ChatModal({ listing, currentUser, onClose }) {
  const [messages, setMessages] = useState([]);
  const [currentListing, setCurrentListing] = useState(listing);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const isSeller = (currentListing.postedBy?._id || currentListing.postedBy) === currentUser?.id;

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/messages/${currentListing._id}`);
      setMessages(res.data);
    } catch (err) {
      console.error('Failed to load messages', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [currentListing._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleRespondOffer = async (offerId, status) => {
    try {
      setError('');
      const res = await api.post(`/listings/${currentListing._id}/respond-offer`, { offerId, status });
      setCurrentListing(res.data.listing);
      fetchMessages();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update offer');
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      setError('');
      let receiverId = undefined;
      if (isSeller) {
        const otherMsg = messages.find(m => (m.sender?._id || m.sender) !== currentUser?.id);
        if (otherMsg) {
          receiverId = otherMsg.sender?._id || otherMsg.sender;
        }
      }

      await api.post(`/messages/${currentListing._id}`, { text, receiverId });
      setText('');
      fetchMessages();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message');
    }
  };

  const pendingOffers = currentListing.offers?.filter(o => o.status === 'pending') || [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content chat-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Chat about "{currentListing.title}"</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        {isSeller && pendingOffers.length > 0 && (
          <div className="offers-banner">
            <p className="offers-title">Pending Buyer Offers:</p>
            {pendingOffers.map((off) => (
              <div key={off._id} className="offer-row">
                <span>Offer: <strong>Rs {off.amount}</strong></span>
                <div className="offer-actions">
                  <button className="btn-success" onClick={() => handleRespondOffer(off._id, 'accepted')}>Accept</button>
                  <button className="btn-danger" onClick={() => handleRespondOffer(off._id, 'declined')}>Decline</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && <p style={{ color: 'red', margin: '8px 0' }}>{error}</p>}

        <div className="chat-messages">
          {loading ? (
            <p>Loading messages...</p>
          ) : messages.length === 0 ? (
            <p className="no-msg">No messages yet. Start the conversation!</p>
          ) : (
            messages.map((msg) => {
              const isMine = (msg.sender?._id || msg.sender) === currentUser?.id;
              return (
                <div key={msg._id} className={`chat-bubble ${isMine ? 'mine' : 'theirs'}`}>
                  <div className="sender-name">{isMine ? 'You' : msg.sender?.name || 'User'}</div>
                  <div className="message-text">{msg.text}</div>
                  <div className="message-time">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="chat-form">
          <input
            type="text"
            placeholder="Type your message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
}

export default ChatModal;
