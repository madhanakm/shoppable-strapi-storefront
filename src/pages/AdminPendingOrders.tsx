import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PendingOrdersManager from '@/components/PendingOrdersManager';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const AdminPendingOrders = () => {
  const { user, isAuthenticated } = useAuth();
  
  // Check if user is admin (you can modify this logic based on your admin identification)
  const isAdmin = user?.email === 'admin@dharaniherbbals.com' || user?.role === 'admin';
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
              Admin Panel
            </h1>
            <p className="text-gray-600 text-lg">Manage pending orders and customer requests</p>
          </div>
          
          <PendingOrdersManager />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminPendingOrders;