import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setResetToken('');
    setLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', { email });
      setSuccess(res.data.message || 'Password reset link generated successfully.');
      if (res.data.resetToken) {
        setResetToken(res.data.resetToken);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please check your email and try again.');
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
          Forgot Password?
        </h2>
        <p className="mt-2 text-center text-sm text-[#8C7A6B]">
          Enter your registered student email address to receive password reset instructions.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 border border-[#E5DEC9] shadow-sm rounded-2xl sm:px-10">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-medium rounded-xl flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">error</span>
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 text-sm font-medium rounded-xl space-y-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">check_circle</span>
                <span>{success}</span>
              </div>
              {resetToken && (
                <div className="pt-2 border-t border-green-200">
                  <p className="text-xs text-green-700 mb-2">
                    Click below to set your new password:
                  </p>
                  <button
                    onClick={() => navigate(`/reset-password/${resetToken}`)}
                    className="w-full py-2.5 px-4 bg-[#C85A32] hover:bg-[#B04A25] text-white font-bold rounded-lg shadow-sm transition text-xs flex items-center justify-center gap-1.5"
                  >
                    Proceed to Reset Password
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              )}
            </div>
          )}

          <form className="space-y-5 max-w-none" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-[#8C7A6B] uppercase mb-1">
                Student Email Address
              </label>
              <input
                type="email"
                placeholder="student@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#E5DEC9] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C85A32] focus:bg-white text-[#2C221E]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#C85A32] hover:bg-[#B04A25] text-white font-bold rounded-xl shadow-md transition text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-lg">sync</span>
                  Sending Request...
                </>
              ) : (
                'Send Reset Instructions'
              )}
            </button>
          </form>

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
