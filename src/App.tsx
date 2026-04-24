/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Register from './pages/Register';
import Login from './pages/Login';
import CustomerDashboard from './pages/CustomerDashboard';
import RestaurantDashboard from './pages/RestaurantDashboard';
import Menu from './pages/Menu';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';

const ProtectedRoute = ({ children, role }: { children: React.ReactNode, role?: 'customer' | 'restaurant' }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (role && user?.role !== role) return <Navigate to="/" />;
  
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-white">
            <Navbar />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              
              <Route 
                path="/customer-dashboard" 
                element={
                  <ProtectedRoute role="customer">
                    <CustomerDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/restaurant-dashboard" 
                element={
                  <ProtectedRoute role="restaurant">
                    <RestaurantDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route path="/menu/:id" element={<Menu />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route 
                path="/orders" 
                element={
                  <ProtectedRoute role="customer">
                    <Orders />
                  </ProtectedRoute>
                } 
              />
            </Routes>
            <footer className="bg-gray-900 text-white py-12 px-6">
              <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
                <div className="col-span-2">
                  <h3 className="text-2xl font-bold mb-4">FoodFlow</h3>
                  <p className="text-gray-400 max-w-sm">Bringing the joy of food directly to your doorstep. The best local restaurants, just a click away.</p>
                </div>
                <div>
                  <h4 className="font-bold mb-4">Quick Links</h4>
                  <ul className="space-y-2 text-gray-400 text-sm">
                    <li><a href="#" className="hover:text-orange-500 transition-colors">About Us</a></li>
                    <li><a href="#" className="hover:text-orange-500 transition-colors">Become a Partner</a></li>
                    <li><a href="#" className="hover:text-orange-500 transition-colors">Corporate Accounts</a></li>
                    <li><a href="#" className="hover:text-orange-500 transition-colors">Help Center</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold mb-4">Newsletter</h4>
                  <div className="flex gap-2">
                    <input type="text" placeholder="Email" className="bg-white/10 rounded-lg px-4 py-2 flex-1 focus:outline-none focus:ring-1 focus:ring-orange-500" />
                    <button className="bg-orange-500 px-4 py-2 rounded-lg font-bold">Join</button>
                  </div>
                </div>
              </div>
              <div className="max-w-7xl mx-auto border-t border-white/10 mt-12 pt-8 text-center text-gray-500 text-sm">
                &copy; 2026 FoodFlow Delivery. All rights reserved.
              </div>
            </footer>
          </div>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

