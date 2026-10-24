import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/home';
import PostItem from './pages/PostItems';
import Navbar from './components/Navbar';
import MyListings from './pages/MyListings';


function App() {
  return (
  <>
    <Navbar />
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/post" element={<PostItem />} />
      <Route path="/" element={<Home />} />
      <Route path="/my-listings" element={<MyListings />} />
    </Routes>
  </>
);
}

export default App;