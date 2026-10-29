import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';

function ChatModal({ listing, currentUser, onClose }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/messages/${listing._id}`);
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
  }, [listing._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      setError('');
      // Determine receiver: if user is seller, specify receiver from latest buyer message or listing author
      let receiverId = undefined;
      if (listing.postedBy?._id === currentUser?.id || listing.postedBy === currentUser?.id) {
        // Find last message from other user to respond to
        const otherMsg = messages.find(m => (m.sender?._id || m.sender) !== currentUser?.id);
        if (otherMsg) {
          receiverId = otherMsg.sender?._id || otherMsg.sender;
        }
      }

      await api.post(`/messages/${listing._id}`, { text, receiverId });
      setText('');
      fetchMessages();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content chat-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Chat about "{listing.title}"</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

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
