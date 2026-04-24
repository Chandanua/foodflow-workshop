import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit3, Package, DollarSign, List, CheckCircle, XCircle, Clock } from 'lucide-react';
import { MenuItem, Restaurant } from '../types';
import { useAuth } from '../context/AuthContext';

const RestaurantDashboard = () => {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'menu' | 'orders'>('orders');
  const [showAddForm, setShowAddForm] = useState(false);
  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: ''
  });

  const fetchData = async () => {
    try {
      const restRes = await axios.get(`/api/restaurants/owner/${user?.id}`);
      setRestaurant(restRes.data);
      if (restRes.data) {
        const [menuRes, orderRes] = await Promise.all([
          axios.get(`/api/menu/${restRes.data.id}`),
          axios.get(`/api/orders/restaurant/${restRes.data.id}`)
        ]);
        setMenu(menuRes.data);
        setOrders(orderRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Poll for new orders every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleUpdateOrderStatus = async (orderId: number, status: string) => {
    try {
      await axios.patch(`/api/orders/${orderId}/status`, { status });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/menu', {
        ...itemForm,
        price: parseFloat(itemForm.price),
        restaurantId: restaurant?.id
      });
      fetchData();
      setShowAddForm(false);
      setItemForm({ name: '', description: '', price: '', category: '', image: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await axios.delete(`/api/menu/${id}`);
      setMenu(menu.filter(i => i.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-12 text-center text-gray-500">Loading Dashboard...</div>;

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const activeOrders = orders.filter(o => ['preparing', 'delivering'].includes(o.status));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-sans font-bold text-gray-900 mb-2">Business Console</h1>
            <p className="text-gray-500 font-medium">{restaurant?.name || 'My Restaurant'}</p>
          </div>
          
          <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
            <button 
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'orders' ? 'bg-orange-500 text-white shadow-lg shadow-orange-100' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Orders ({orders.filter(o => o.status !== 'delivered' && o.status !== 'rejected').length})
            </button>
            <button 
              onClick={() => setActiveTab('menu')}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'menu' ? 'bg-orange-500 text-white shadow-lg shadow-orange-100' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Menu items
            </button>
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: "Total Revenue", value: `$${orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.totalPrice, 0).toFixed(2)}`, icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
            { label: "Pending Orders", value: pendingOrders.length.toString(), icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Live Orders", value: activeOrders.length.toString(), icon: Clock, color: "text-orange-600", bg: "bg-orange-50" }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-mono uppercase tracking-widest text-gray-400 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl`}>
                <stat.icon size={24} />
              </div>
            </div>
          ))}
        </div>

        {activeTab === 'orders' ? (
          <div className="grid gap-8">
            {/* New Orders Section */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                New Requests
              </h2>
              <div className="grid gap-4">
                {pendingOrders.map(order => (
                  <div key={order.id} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between gap-8">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">Order #{order.id}</span>
                        <span className="text-gray-400 text-sm">{new Date(order.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <h4 className="font-bold text-lg mb-2">Customer: {order.customerName}</h4>
                      <div className="space-y-1">
                        {JSON.parse(order.items).map((item: any) => (
                          <p key={item.id} className="text-gray-500 text-sm">
                            <span className="font-bold text-gray-900">{item.quantity}x</span> {item.name}
                          </p>
                        ))}
                      </div>
                      <p className="mt-4 font-black text-xl text-gray-900">Total: ${order.totalPrice.toFixed(2)}</p>
                    </div>
                    <div className="flex md:flex-col justify-end gap-3">
                      <button 
                        onClick={() => handleUpdateOrderStatus(order.id, 'preparing')}
                        className="bg-green-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle size={18} />
                        Accept Order
                      </button>
                      <button 
                         onClick={() => handleUpdateOrderStatus(order.id, 'rejected')}
                        className="bg-gray-100 text-gray-500 px-8 py-3 rounded-xl font-bold hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center gap-2"
                      >
                        <XCircle size={18} />
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
                {pendingOrders.length === 0 && (
                  <div className="bg-white/50 p-12 text-center rounded-3xl border border-dashed border-gray-200">
                    <p className="text-gray-400">No new order requests at the moment.</p>
                  </div>
                )}
              </div>
            </section>

            {/* In Progress Section */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-6">In Progress</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {activeOrders.map(order => (
                  <div key={order.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <span className={`text-[10px] font-bold uppercase tracking-[0.2em] px-2 py-0.5 rounded ${order.status === 'preparing' ? 'bg-orange-100 text-orange-600' : 'bg-purple-100 text-purple-600'}`}>
                          {order.status}
                        </span>
                        <h4 className="font-bold mt-2">Order #{order.id} • {order.customerName}</h4>
                      </div>
                      <span className="font-bold text-gray-900">${order.totalPrice.toFixed(2)}</span>
                    </div>
                    
                    <div className="mb-6 space-y-1">
                      {JSON.parse(order.items).slice(0, 2).map((item: any) => (
                        <p key={item.id} className="text-xs text-gray-500">{item.quantity}x {item.name}</p>
                      ))}
                      {JSON.parse(order.items).length > 2 && <p className="text-[10px] text-gray-300">+{JSON.parse(order.items).length - 2} more items</p>}
                    </div>

                    <div className="flex gap-2">
                      {order.status === 'preparing' ? (
                        <button 
                          onClick={() => handleUpdateOrderStatus(order.id, 'delivering')}
                          className="flex-1 bg-orange-500 text-white py-2 rounded-xl text-sm font-bold hover:bg-orange-600"
                        >
                          Send for Delivery
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                          className="flex-1 bg-gray-900 text-white py-2 rounded-xl text-sm font-bold hover:bg-black"
                        >
                          Mark Delivered
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Your Menu</h2>
              <button 
                onClick={() => setShowAddForm(true)}
                className="bg-orange-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-orange-600 transition-colors"
              >
                <Plus size={18} />
                Add Item
              </button>
            </div>

            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left py-4 px-8 text-xs font-mono uppercase tracking-widest text-gray-400">Item</th>
                  <th className="text-left py-4 px-8 text-xs font-mono uppercase tracking-widest text-gray-400">Category</th>
                  <th className="text-left py-4 px-8 text-xs font-mono uppercase tracking-widest text-gray-400">Price</th>
                  <th className="text-right py-4 px-8 text-xs font-mono uppercase tracking-widest text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {menu.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200">
                          {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-400 line-clamp-1">{item.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-8 text-sm text-gray-500">{item.category}</td>
                    <td className="py-4 px-8 text-sm font-bold text-gray-900">${item.price.toFixed(2)}</td>
                    <td className="py-4 px-8">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                          <Edit3 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddForm && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl">
            <h3 className="text-2xl font-bold mb-6">Add Menu Item</h3>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="text-xs font-mono uppercase tracking-widest text-gray-400 block mb-2">Item Name</label>
                <input 
                  type="text" required 
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  value={itemForm.name}
                  onChange={e => setItemForm({...itemForm, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono uppercase tracking-widest text-gray-400 block mb-2">Price ($)</label>
                  <input 
                    type="number" step="0.01" required 
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    value={itemForm.price}
                    onChange={e => setItemForm({...itemForm, price: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs font-mono uppercase tracking-widest text-gray-400 block mb-2">Category</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Appetizer"
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    value={itemForm.category}
                    onChange={e => setItemForm({...itemForm, category: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-mono uppercase tracking-widest text-gray-400 block mb-2">Description</label>
                <textarea 
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-orange-500/20 h-24"
                  value={itemForm.description}
                  onChange={e => setItemForm({...itemForm, description: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-mono uppercase tracking-widest text-gray-400 block mb-2">Image URL</label>
                <input 
                  type="text" 
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  value={itemForm.image}
                  onChange={e => setItemForm({...itemForm, image: e.target.value})}
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 border border-gray-100 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantDashboard;
