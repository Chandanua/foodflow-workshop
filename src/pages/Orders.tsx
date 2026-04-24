import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'motion/react';
import { Package, Truck, Utensils, CheckCircle, Clock } from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/orders/customer');
      setOrders(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const getStatusProgress = (status: string) => {
    switch(status) {
      case 'pending': return 1;
      case 'preparing': return 2;
      case 'delivering': return 3;
      case 'delivered': return 4;
      default: return 0;
    }
  };

  if (loading) return <div className="p-12 text-center text-gray-500">Loading your orders...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-sans font-bold text-gray-900 mb-12">Track Your Orders</h1>

        <div className="space-y-8">
          {orders.map(order => {
            const progress = getStatusProgress(order.status);
            const isRejected = order.status === 'rejected';

            return (
              <div key={order.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-8">
                  <div className="flex flex-col md:flex-row justify-between gap-6 mb-12">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-bold text-gray-900">{order.restaurantName}</h2>
                        {isRejected && <span className="bg-red-50 text-red-600 text-xs font-bold px-3 py-1 rounded-full">REJECTED</span>}
                      </div>
                      <p className="text-gray-400 text-sm">Order #{order.id} • {new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-black text-gray-900">${order.totalPrice.toFixed(2)}</p>
                      <p className="text-gray-400 text-xs font-mono uppercase tracking-widest mt-1">{order.status}</p>
                    </div>
                  </div>

                  {!isRejected && order.status !== 'delivered' && (
                    <div className="relative pt-8 pb-4">
                      {/* Progress Line */}
                      <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 rounded-full" />
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(progress - 1) * 33.33}%` }}
                        className="absolute top-1/2 left-0 h-1 bg-orange-500 -translate-y-1/2 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                      />
                      
                      {/* Steps */}
                      <div className="relative flex justify-between">
                        {[
                          { icon: Package, label: 'Placed', step: 1 },
                          { icon: Utensils, label: 'Preparing', step: 2 },
                          { icon: Truck, label: 'Delivering', step: 3 },
                          { icon: CheckCircle, label: 'Delivered', step: 4 }
                        ].map((s, i) => (
                          <div key={i} className="flex flex-col items-center group">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${
                              progress >= s.step 
                              ? 'bg-orange-500 border-orange-100 text-white shadow-lg' 
                              : 'bg-white border-gray-50 text-gray-200'
                            }`}>
                              <s.icon size={20} />
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-widest mt-4 ${
                              progress >= s.step ? 'text-gray-900' : 'text-gray-300'
                            }`}>
                              {s.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {order.status === 'delivered' && (
                    <div className="bg-green-50 p-6 rounded-2xl flex items-center gap-4 text-green-700">
                      <CheckCircle size={24} />
                      <p className="font-bold">Order was delivered successfully!</p>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex justify-between items-center">
                   <div className="flex -space-x-2">
                     {JSON.parse(order.items).map((item: any, i: number) => (
                       <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-white overflow-hidden" title={item.name}>
                         {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <div className="bg-orange-100 text-[10px] text-orange-500 flex items-center justify-center h-full">🍽️</div>}
                       </div>
                     ))}
                   </div>
                   <span className="text-xs text-gray-400 font-medium">
                     {JSON.parse(order.items).length} items • Need help?
                   </span>
                </div>
              </div>
            );
          })}

          {orders.length === 0 && (
            <div className="bg-white p-20 text-center rounded-[40px] border border-gray-100">
               <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-200">
                  <Package size={40} />
               </div>
               <h3 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h3>
               <p className="text-gray-400 mb-8 max-w-xs mx-auto">Your order history will appear here once you place your first meal!</p>
               <button 
                onClick={() => window.location.href = '/customer-dashboard'}
                className="bg-orange-500 text-white px-8 py-3 rounded-full font-bold hover:shadow-xl hover:shadow-orange-100 transition-all"
               >
                 Start Ordering
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;
