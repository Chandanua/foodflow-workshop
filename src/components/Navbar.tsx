import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, LogOut, User, Utensils } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-orange-500 p-2 rounded-xl text-white group-hover:scale-110 transition-transform">
            <Utensils size={24} />
          </div>
          <span className="font-sans font-bold text-2xl tracking-tight text-gray-900">FoodFlow</span>
        </Link>

        <div className="flex items-center gap-8">
          {isAuthenticated ? (
            <>
              {user?.role === 'customer' && (
                <div className="flex items-center gap-6">
                  <Link to="/customer-dashboard" className="text-gray-600 hover:text-orange-500 font-medium transition-colors">
                    Explore
                  </Link>
                  <Link to="/orders" className="text-gray-600 hover:text-orange-500 font-medium transition-colors">
                    My Orders
                  </Link>
                </div>
              )}
              {user?.role === 'restaurant' && (
                <Link to="/restaurant-dashboard" className="text-gray-600 hover:text-orange-500 font-medium transition-colors">
                  Dashboard
                </Link>
              )}
              
              <div className="flex items-center gap-4 border-l pl-8 border-gray-100">
                {user?.role === 'customer' && (
                  <Link to="/checkout" className="relative text-gray-600 hover:text-orange-500 transition-colors">
                    <ShoppingCart size={24} />
                    {itemCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {itemCount}
                      </span>
                    )}
                  </Link>
                )}
                
                <div className="flex items-center gap-2 text-gray-900 border px-3 py-1.5 rounded-full bg-gray-50">
                  <User size={18} className="text-gray-400" />
                  <span className="text-sm font-medium">{user?.fullName.split(' ')[0]}</span>
                </div>

                <button 
                  onClick={() => { logout(); navigate('/'); }}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium px-4 py-2">
                Login
              </Link>
              <Link to="/register" className="bg-orange-500 text-white px-6 py-2.5 rounded-full font-bold hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-200 transition-all">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
