import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim() || !name.trim()) {
      setError('Please provide your email address and full name.');
      return;
    }

    if (password.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/reset-password', {
        email: email.trim(),
        name: name.trim(),
        password,
      });

      setSuccess(res.data.message || 'Password has been reset successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 1800);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to reset password. Please verify your registered email and name.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-xl bg-[#C85A32] text-white flex items-center justify-center font-bold text-2xl shadow-md">
            <span className="material-symbols-outlined text-3xl">lock_reset</span>
          </div>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold text-[#2C221E] tracking-tight">
          Reset Your Password
        </h2>
        <p className="mt-2 text-center text-sm text-[#8C7A6B]">
          Verify your student account details to set a new password instantly.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 border border-[#E5DEC9] shadow-sm rounded-2xl sm:px-10">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-medium rounded-xl flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">error</span>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 text-sm font-medium rounded-xl space-y-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">check_circle</span>
                <span>{success}</span>
              </div>
              <p className="text-xs text-green-700">
                Redirecting you to the sign-in page...
              </p>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full py-2.5 px-4 bg-[#C85A32] hover:bg-[#B04A25] text-white font-bold rounded-lg shadow-sm transition text-xs flex items-center justify-center gap-1.5"
              >
                Sign In Now
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          )}

          {!success && (
            <form className="space-y-4 max-w-none" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-bold text-[#8C7A6B] uppercase mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#E5DEC9] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C85A32] focus:bg-white text-[#2C221E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8C7A6B] uppercase mb-1">
                  Account Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alex Johnson"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#E5DEC9] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C85A32] focus:bg-white text-[#2C221E]"
                />
                <p className="mt-1 text-[11px] text-[#8C7A6B]">
                  Used to verify account ownership without relying on external email delivery.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8C7A6B] uppercase mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#E5DEC9] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C85A32] focus:bg-white text-[#2C221E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8C7A6B] uppercase mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  placeholder="Re-enter your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#E5DEC9] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C85A32] focus:bg-white text-[#2C221E]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[#C85A32] hover:bg-[#B04A25] text-white font-bold rounded-xl shadow-md transition text-sm disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-lg">sync</span>
                    Resetting Password...
                  </>
                ) : (
                  'Reset & Update Password'
                )}
              </button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-[#E5DEC9] text-center">
            <p className="text-xs text-[#8C7A6B]">
              Remembered your password?{' '}
              <Link to="/login" className="font-bold text-[#C85A32] hover:underline">
                Back to Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
