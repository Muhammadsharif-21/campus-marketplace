import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import NotificationsModal from './NotificationsModal';
import ChatModal from './ChatModal';

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [chatListing, setChatListing] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');

  const fetchUnread = async () => {
    if (!token) return;
    try {
      const res = await api.get('/notifications');
      const unread = res.data.filter((n) => !n.read).length;
      setUnreadCount(unread);
    } catch (err) {
      // Ignore
    }
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 5000);
    return () => clearInterval(interval);
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <>
      <nav>
        <Link to="/">Campus Marketplace</Link>
        {token ? (
          <>
            <Link to="/post">Post item</Link>
            <Link to="/my-listings">My listings</Link>
            <button
              className="notif-nav-btn"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              Notifications {unreadCount > 0 && <span className="notif-count">{unreadCount}</span>}
            </button>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>

      {showNotifications && (
        <NotificationsModal
          onClose={() => {
            setShowNotifications(false);
            fetchUnread();
          }}
          onOpenChatForListing={(listing) => {
            setChatListing(listing);
          }}
        />
      )}

      {chatListing && (
        <ChatModal
          listing={chatListing}
          currentUser={currentUser}
          onClose={() => setChatListing(null)}
        />
      )}
    </>
  );
}

export default Navbar;
