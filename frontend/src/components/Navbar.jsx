import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import NotificationsModal from './NotificationsModal';

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchUnread = async () => {
    if (!token) return;
    try {
      const res = await api.get('/notifications');
      const unread = res.data.filter((n) => !n.read).length;
      setUnreadCount(unread);
    } catch (err) {
      // Ignore errors when unauthenticated or token expired
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
        />
      )}
    </>
  );
}

export default Navbar;
