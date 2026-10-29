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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');

  const fetchUnread = async () => {
    if (!token) return;
    try {
      const res = await api.get('/notifications');
      const unread = res.data.filter((n) => !n.read).length;
      setUnreadCount(unread);
    } catch (err) {
      // ignore silently
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
    setMobileMenuOpen(false);
    navigate('/login');
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5DEC9] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-[#C85A32] text-white flex items-center justify-center font-bold text-xl shadow-md group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-2xl">storefront</span>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg text-[#2C221E] leading-none tracking-tight">
                  Campus<span className="text-[#C85A32]">Market</span>
                </span>
                <span className="text-[10px] font-semibold text-[#8C7A6B] tracking-wider uppercase">
                  Student Exchange
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/" className="font-medium text-[#2C221E] hover:text-[#C85A32] transition">
                Browse Items
              </Link>

              {token ? (
                <>
                  <Link to="/post" className="font-medium text-[#2C221E] hover:text-[#C85A32] transition">
                    + Post Item
                  </Link>
                  <Link to="/my-listings" className="font-medium text-[#2C221E] hover:text-[#C85A32] transition">
                    My Listings
                  </Link>
                  <Link to="/favorites" className="font-medium text-[#2C221E] hover:text-[#C85A32] transition flex items-center gap-1">
                    <span className="text-red-500">❤️</span> Favorites
                  </Link>

                  {/* Notification Bell */}
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-[#2C221E] hover:text-[#C85A32] hover:bg-[#FAF7F2] rounded-lg transition"
                    title="Notifications"
                  >
                    <span className="material-symbols-outlined text-2xl">notifications</span>
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 bg-[#C85A32] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* User Profile / Logout */}
                  <div className="flex items-center gap-3 pl-2 border-l border-[#E5DEC9]">
                    <span className="text-sm font-semibold text-[#2C221E]">
                      {currentUser?.name || 'Student'}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="px-3 py-1.5 text-xs font-semibold text-[#8C7A6B] hover:text-[#C85A32] hover:bg-[#FAF7F2] border border-[#E5DEC9] rounded-lg transition"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3 pl-2 border-l border-[#E5DEC9]">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-semibold text-[#C85A32] hover:bg-[#FAF7F2] rounded-lg transition"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-sm font-semibold text-white bg-[#C85A32] hover:bg-[#B04A25] rounded-lg shadow-sm transition"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-2 md:hidden">
              {token && (
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-[#2C221E] hover:bg-[#FAF7F2] rounded-lg"
                >
                  <span className="material-symbols-outlined text-2xl">notifications</span>
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-[#C85A32] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
              )}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-[#2C221E] hover:bg-[#FAF7F2] rounded-lg focus:outline-none"
                aria-label="Toggle Navigation Menu"
              >
                <span className="material-symbols-outlined text-2xl">
                  {mobileMenuOpen ? 'close' : 'menu'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#E5DEC9] bg-white px-4 pt-3 pb-6 space-y-3">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md font-medium text-[#2C221E] hover:bg-[#FAF7F2] hover:text-[#C85A32]"
            >
              Browse Items
            </Link>

            {token ? (
              <>
                <Link
                  to="/post"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md font-medium text-[#2C221E] hover:bg-[#FAF7F2] hover:text-[#C85A32]"
                >
                  + Post Item
                </Link>
                <Link
                  to="/my-listings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md font-medium text-[#2C221E] hover:bg-[#FAF7F2] hover:text-[#C85A32]"
                >
                  My Listings
                </Link>
                <Link
                  to="/favorites"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md font-medium text-[#2C221E] hover:bg-[#FAF7F2] hover:text-[#C85A32]"
                >
                  ❤️ Favorites
                </Link>
                <div className="pt-2 border-t border-[#E5DEC9] flex items-center justify-between px-3">
                  <span className="text-sm font-semibold text-[#2C221E]">
                    Signed in as {currentUser?.name || 'Student'}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1.5 text-xs font-semibold text-[#C85A32] bg-[#FAF7F2] rounded-lg border border-[#E5DEC9]"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="pt-2 border-t border-[#E5DEC9] flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-semibold text-[#C85A32] bg-[#FAF7F2] rounded-lg border border-[#E5DEC9]"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-semibold text-white bg-[#C85A32] rounded-lg"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

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
