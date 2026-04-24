import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Restaurant } from '../types';
import RestaurantCard from '../components/RestaurantCard';
import { Search, SlidersHorizontal } from 'lucide-react';

const CustomerDashboard = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await axios.get('/api/restaurants');
        setRestaurants(response.data);
      } catch (error) {
        console.error('Error fetching restaurants:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <h1 className="text-4xl font-sans font-bold text-gray-900 mb-2">Browse Local Flavors</h1>
            <p className="text-gray-500">Discover the best culinary experiences in your neighborhood.</p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search restaurants or cuisines..." 
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-500/10 focus:bg-white transition-all text-sm"
              />
            </div>
            <button className="bg-gray-50 border border-gray-100 p-3.5 rounded-2xl text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors">
              <SlidersHorizontal size={20} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-gray-50 aspect-[4/5] rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {restaurants.length > 0 ? (
              restaurants.map(rest => (
                <RestaurantCard key={rest.id} restaurant={rest} />
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                <p className="text-gray-400 font-medium">No restaurants found yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
