import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { name, email, phone, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-xl bg-[#C85A32] text-white flex items-center justify-center font-bold text-2xl shadow-md">
            <span className="material-symbols-outlined text-3xl">storefront</span>
          </div>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold text-[#2C221E] tracking-tight">
          Create Account
        </h2>
        <p className="mt-2 text-center text-sm text-[#8C7A6B]">
          Join your college campus exchange network to buy, sell, and trade safely.
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

          <form className="space-y-4 max-w-none" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-[#8C7A6B] uppercase mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Alex Johnson"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#E5DEC9] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C85A32] focus:bg-white text-[#2C221E]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#8C7A6B] uppercase mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="alex@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#E5DEC9] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C85A32] focus:bg-white text-[#2C221E]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#8C7A6B] uppercase mb-1">
                Phone Number (Optional for Meetup SMS)
              </label>
              <input
                type="tel"
                placeholder="+1 (555) 019-2834"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#E5DEC9] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C85A32] focus:bg-white text-[#2C221E]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#8C7A6B] uppercase mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#E5DEC9] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C85A32] focus:bg-white text-[#2C221E]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#C85A32] hover:bg-[#B04A25] text-white font-bold rounded-xl shadow-md transition text-sm disabled:opacity-50 flex items-center justify-center gap-2 pt-2"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-lg">sync</span>
                  Creating Account...
                </>
              ) : (
                'Create Campus Account'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#E5DEC9] text-center">
            <p className="text-xs text-[#8C7A6B]">
              Already registered?{' '}
              <Link to="/login" className="font-bold text-[#C85A32] hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
