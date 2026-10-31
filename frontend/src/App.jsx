import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Home from './pages/home';
import PostItem from './pages/PostItems';
import MyListings from './pages/MyListings';
import Favorites from './pages/Favorites';
import NotFound from './pages/NotFound';
import api from './api/axios';

function App() {
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          localStorage.setItem('user', JSON.stringify({
            id: res.data._id,
            name: res.data.name,
            email: res.data.email,
            phone: res.data.phone || ''
          }));
        } catch (err) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    };
    checkAuth();
  }, []);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/post"
          element={
            <ProtectedRoute>
              <PostItem />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-listings"
          element={
            <ProtectedRoute>
              <MyListings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/favorites"
          element={
            <ProtectedRoute>
              <Favorites />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
