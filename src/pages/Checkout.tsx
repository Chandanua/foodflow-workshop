import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'motion/react';
import { CheckCircle2, ShoppingBag, CreditCard, MapPin, Truck } from 'lucide-react';

const Checkout = () => {
  const { cart, totalPrice, clearCart, itemCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOrdered, setIsOrdered] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    setLoading(true);
    try {
      await axios.post('/api/orders', {
        customerId: user.id,
        restaurantId: cart[0].restaurantId, // Assuming all items from same restaurant for simplicity
        items: cart,
        totalPrice: totalPrice
      });
      setIsOrdered(true);
      clearCart();
    } catch (err) {
      console.error(err);
      alert('Order failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isOrdered) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="bg-green-100 text-green-600 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <CheckCircle2 size={48} />
          </div>
          <h1 className="text-4xl font-sans font-bold text-gray-900 mb-4">Order Placed!</h1>
          <p className="text-gray-500 mb-12 text-lg">Your meal is being prepared and will be with you shortly. Enjoy!</p>
          <button 
            onClick={() => navigate('/customer-dashboard')}
            className="bg-orange-500 text-white px-10 py-4 rounded-full font-bold hover:bg-orange-600 transition-all shadow-xl shadow-orange-100"
          >
            Explore More
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-sans font-bold text-gray-900 mb-8 flex items-center gap-3">
          <ShoppingBag className="text-orange-500" />
          Checkout
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            {/* Shipping Info */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <MapPin className="text-orange-500" size={18} />
                Delivery Address
              </h3>
              <div className="space-y-4">
                <input type="text" placeholder="Street Address" className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3" defaultValue="123 Foodie St, Gourmet City" />
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="Apt/Suite" className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3" />
                  <input type="text" placeholder="Zip Code" className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3" defaultValue="90210" />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <CreditCard className="text-orange-500" size={18} />
                Payment Method
              </h3>
              <div className="flex items-center gap-4 p-4 border border-orange-500 bg-orange-50 rounded-2xl">
                <div className="bg-white p-2 rounded-lg shadow-sm">
                  <CreditCard className="text-orange-500" />
                </div>
                <div>
                  <p className="font-bold">Credit Card</p>
                  <p className="text-xs text-gray-500">Ending in **** 4242</p>
                </div>
                <div className="ml-auto w-4 h-4 rounded-full border-4 border-orange-500" />
              </div>
            </div>
          </div>

          <div>
            {/* Summary */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm sticky top-32">
              <h3 className="text-xl font-bold mb-8">Order Summary</h3>
              <div className="space-y-4 mb-8">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.quantity}x {item.name}</span>
                    <span className="font-bold">${(item.quantity * item.price).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-6 space-y-3">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Delivery</span>
                  <span className="text-green-600 font-bold">$0.00</span>
                </div>
                <div className="flex justify-between text-gray-900 font-black text-2xl pt-4">
                  <span>Total</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <button 
                onClick={handlePlaceOrder}
                disabled={loading || itemCount === 0}
                className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold text-lg mt-10 hover:bg-orange-600 transition-all shadow-xl shadow-orange-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : `Place Order • $${totalPrice.toFixed(2)}`}
              </button>
              
              <div className="flex items-center justify-center gap-2 mt-6 text-gray-400 text-xs font-mono uppercase tracking-widest">
                <Truck size={14} />
                Est. Delivery: 25-35 mins
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
