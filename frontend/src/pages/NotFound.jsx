import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="w-24 h-24 bg-[#F5EBE6] text-[#C85A32] rounded-full flex items-center justify-center mb-6 shadow-sm">
        <span className="material-symbols-outlined text-5xl">search_off</span>
      </div>
      <h1 className="text-4xl font-extrabold text-[#2C221E] tracking-tight mb-2">404 - Page Not Found</h1>
      <p className="text-[#8C7A6B] max-w-md mb-8 text-lg">
        Oops! The campus item or page you are looking for seems to have vanished or moved to another spot.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#C85A32] hover:bg-[#B04A25] text-white font-semibold rounded-xl transition shadow-sm"
        >
          <span className="material-symbols-outlined text-xl">home</span>
          Return to Marketplace Home
        </Link>
        <Link
          to="/post"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-[#E5DEC9] text-[#2C221E] hover:bg-[#FAF7F2] font-semibold rounded-xl transition"
        >
          <span className="material-symbols-outlined text-xl">add_circle</span>
          Post an Item
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
