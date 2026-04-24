import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Restaurant, MenuItem } from '../types';
import { Plus, Minus, ShoppingBag, ArrowLeft, Star, Clock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'motion/react';

const Menu = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, cart, updateQuantity, totalPrice, itemCount } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [restRes, menuRes] = await Promise.all([
          axios.get(`/api/restaurants/${id}`),
          axios.get(`/api/menu/${id}`)
        ]);
        setRestaurant(restRes.data);
        setMenu(menuRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="p-12 text-center text-gray-500">Loading Menu...</div>;

  return (
    <div className="min-h-screen bg-white">
      {/* Restaurant Header */}
      <div className="relative h-[400px] bg-gray-900">
        <img 
          src={restaurant?.image || "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2000&auto=format&fit=crop"} 
          alt={restaurant?.name} 
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto w-full px-6 pb-12">
            <Link to="/customer-dashboard" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors">
              <ArrowLeft size={20} />
              Back to Restaurants
            </Link>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-5xl font-sans font-bold text-white mb-4 tracking-tight">{restaurant?.name}</h1>
                <div className="flex items-center gap-6 text-white/90">
                  <div className="flex items-center gap-2">
                    <Star size={20} className="text-orange-400 fill-orange-400" />
                    <span className="font-bold">{restaurant?.rating || '4.8'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={20} className="text-white/60" />
                    <span>{restaurant?.deliveryTime || '25-35 min'}</span>
                  </div>
                  <div className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-sm">
                    {restaurant?.cuisine}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-3 gap-12">
        {/* Menu Items */}
        <div className="lg:col-span-2 space-y-12">
          {['Main Course', 'Appetizers', 'Drinks', 'Desserts'].map(category => {
            const items = menu.filter(i => (i.category || 'Main Course') === category);
            if (items.length === 0 && category !== 'Main Course') return null;
            
            return (
              <div key={category}>
                <h2 className="text-2xl font-bold text-gray-900 mb-8 border-l-4 border-orange-500 pl-4">{category}</h2>
                <div className="grid sm:grid-cols-1 gap-6">
                  {(items.length > 0 ? items : menu).map(item => {
                    if (items.length === 0 && category !== 'Main Course') return null;
                    const cartItem = cart.find(i => i.id === item.id);
                    
                    return (
                      <div key={item.id} className="bg-white border border-gray-100 rounded-3xl p-6 flex gap-6 hover:shadow-xl transition-all group">
                        <div className="w-32 h-32 rounded-2xl bg-gray-50 overflow-hidden border border-gray-100 flex-shrink-0">
                          {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-bold text-gray-900">{item.name}</h3>
                            <span className="text-orange-600 font-bold text-lg">${item.price.toFixed(2)}</span>
                          </div>
                          <p className="text-gray-500 text-sm mb-6 leading-relaxed">{item.description}</p>
                          
                          <div className="flex justify-end">
                            {cartItem ? (
                              <div className="flex items-center gap-4 bg-orange-50 px-4 py-2 rounded-xl">
                                <button 
                                  onClick={() => updateQuantity(item.id, -1)}
                                  className="text-orange-600 hover:scale-110 transition-transform"
                                >
                                  <Minus size={18} />
                                </button>
                                <span className="font-bold text-gray-900">{cartItem.quantity}</span>
                                <button 
                                  onClick={() => updateQuantity(item.id, 1)}
                                  className="text-orange-600 hover:scale-110 transition-transform"
                                >
                                  <Plus size={18} />
                                </button>
                              </div>
                            ) : (
                              <button 
                                onClick={() => addToCart(item)}
                                className="bg-orange-500 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-orange-600 transition-colors shadow-lg shadow-orange-100"
                              >
                                <Plus size={18} />
                                Add to Cart
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {menu.length === 0 && (
                    <div className="py-12 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                      <p className="text-gray-400">This restaurant hasn't added any menu items yet.</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar Cart */}
        <div className="lg:col-span-1">
          <div className="sticky top-32 bg-gray-50 rounded-[40px] p-8 border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <ShoppingBag size={24} className="text-orange-500" />
              Your Order
            </h3>

            <div className="space-y-6 mb-12">
              <AnimatePresence>
                {cart.map(item => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex justify-between items-center"
                  >
                    <div className="flex-1 mr-4">
                      <p className="font-bold text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-400">{item.quantity} x ${item.price.toFixed(2)}</p>
                    </div>
                    <span className="font-bold text-gray-900">${(item.quantity * item.price).toFixed(2)}</span>
                  </motion.div>
                ))}
              </AnimatePresence>

              {cart.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 text-gray-300">
                    <ShoppingBag size={24} />
                  </div>
                  <p className="text-gray-400 text-sm">Your cart is empty.</p>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 pt-6 space-y-4">
              <div className="flex justify-between text-gray-500 text-sm">
                <span>Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500 text-sm">
                <span>Delivery Fee</span>
                <span className="text-green-600 font-bold">FREE</span>
              </div>
              <div className="flex justify-between text-gray-900 font-bold text-xl pt-2">
                <span>Total</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              
              <Link 
                to="/checkout"
                className={`w-full block text-center py-4 rounded-2xl font-bold transition-all mt-8 ${
                  itemCount > 0 
                  ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-xl shadow-orange-100' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Checkout
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu;
