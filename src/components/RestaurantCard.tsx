import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock } from 'lucide-react';
import { Restaurant } from '../types';

const RestaurantCard: React.FC<{ restaurant: Restaurant }> = ({ restaurant }) => {
  return (
    <Link 
      to={`/menu/${restaurant.id}`}
      className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-2xl hover:shadow-orange-100 transition-all block"
    >
      <div className="aspect-[4/3] overflow-hidden relative">
        <img 
          src={restaurant.image || `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop`} 
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
          <Star size={14} className="text-orange-500 fill-orange-500" />
          {restaurant.rating || '4.5'}
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-2 text-gray-900	">
          <h3 className="text-xl font-bold">{restaurant.name}</h3>
        </div>
        <p className="text-gray-500 text-sm mb-4 leading-relaxed line-clamp-1">
          {restaurant.cuisine} • Fresh ingredients • Gourmet Service
        </p>
        
        <div className="flex items-center gap-4 text-xs font-mono uppercase tracking-wider">
          <div className="flex items-center gap-1.5 text-orange-600 bg-orange-50 px-2 py-1 rounded-md">
            <Clock size={14} />
            <span>{restaurant.deliveryTime || '20-30 min'}</span>
          </div>
          <span className="text-gray-300">Free Delivery</span>
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
          <span className="text-orange-500 font-bold group-hover:underline">View Menu</span>
          <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-orange-500 group-hover:text-white transition-colors">
            →
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;
