import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow bg-gray-50">
        {/* Outlet acts as a placeholder for all nested routes */}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;