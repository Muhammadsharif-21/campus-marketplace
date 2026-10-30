import { useState, useEffect } from 'react';
import api from '../api/axios';

function NotificationsModal({ onClose, onOpenChatForListing }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleNotificationClick = async (n) => {
    if (!n.read) {
      try {
        await api.patch(`/notifications/${n._id}/read`);
        setNotifications(notifications.map(item => item._id === n._id ? { ...item, read: true } : item));
      } catch (err) {
        console.error('Error marking as read', err);
      }
    }

    if (n.listing) {
      onClose();
      if (onOpenChatForListing) {
        onOpenChatForListing(n.listing);
      }
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Error marking all as read', err);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Notifications</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        {notifications.some(n => !n.read) && (
          <button className="btn-secondary" style={{ marginBottom: 12 }} onClick={handleMarkAllRead}>
            Mark all as read
          </button>
        )}

        <div className="notification-list">
          {loading ? (
            <p>Loading notifications...</p>
          ) : notifications.length === 0 ? (
            <p>No notifications yet.</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                className={`notification-item ${n.read ? 'read' : 'unread'}`}
                onClick={() => handleNotificationClick(n)}
              >
                <div className="notif-message">{n.message}</div>
                <div className="notif-meta">
                  <span>{new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {n.listing && <span className="notif-chat-hint">Click to open chat 💬</span>}
                  {!n.read && <span className="notif-badge">New</span>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default NotificationsModal;
