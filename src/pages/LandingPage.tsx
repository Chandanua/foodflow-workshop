import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Truck, ShieldCheck, Clock, ArrowRight, Utensils } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-6xl lg:text-7xl font-sans font-bold text-gray-900 leading-[0.9] tracking-tight mb-8">
                Crave it? <br/>
                <span className="text-orange-500 italic font-serif font-light">We deliver it.</span>
              </h1>
              <p className="text-xl text-gray-600 mb-10 max-w-lg leading-relaxed">
                Connect with the best local restaurants and get your favorite meals delivered straight to your doorstep in minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/register" 
                  className="bg-orange-500 text-white px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 hover:bg-orange-600 hover:shadow-xl hover:shadow-orange-200 transition-all group"
                >
                  Explore Menu
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  to="/login" 
                  className="border-2 border-gray-100 text-gray-900 px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center hover:bg-gray-50 transition-all"
                >
                  Login to Order
                </Link>
              </div>
              
              <div className="mt-12 flex items-center gap-6 text-sm text-gray-400 font-mono uppercase tracking-widest">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200" />
                  ))}
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                    +5k
                  </div>
                </div>
                <span>Trusted by 5,000+ Customers</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-square bg-orange-100 rounded-[60px] transform rotate-6 absolute inset-0 -z-10" />
              <div className="aspect-square bg-gray-50 rounded-[60px] overflow-hidden border border-gray-100">
                <img 
                  src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000&auto=format&fit=crop" 
                  alt="Delicious Food"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              {/* Floating Cards */}
              <motion.div 
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-10 -left-10 bg-white p-4 rounded-2xl shadow-xl border border-gray-50 flex items-center gap-4"
              >
                <div className="bg-green-100 p-2 rounded-full text-green-600">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Secure Payment</p>
                  <p className="text-xs text-gray-500">100% Protection</p>
                </div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-20 -right-10 bg-white p-4 rounded-2xl shadow-xl border border-gray-50 flex items-center gap-4"
              >
                <div className="bg-orange-100 p-2 rounded-full text-orange-600">
                  <Clock size={24} />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Fastest Delivery</p>
                  <p className="text-xs text-gray-500">Under 25 mins</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-sans font-bold text-gray-900 mb-4">Why FoodFlow?</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Providing a seamless connection between your kitchen and the best local chefs.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Truck, title: "Fast Delivery", desc: "Our delivery partners are optimized for speed and safety.", bg: "bg-blue-50", text: "text-blue-600" },
              { icon: ShieldCheck, title: "Trusted Restaurants", desc: "We only partner with top-rated local establishments.", bg: "bg-green-50", text: "text-green-600" },
              { icon: Utensils, title: "Variety of Options", desc: "From pizza to sushi, we have all your cravings covered.", bg: "bg-purple-50", text: "text-purple-600" }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-8 rounded-3xl border border-gray-100 hover:shadow-xl transition-all">
                <div className={`${feature.bg} ${feature.text} w-14 h-14 rounded-2xl flex items-center justify-center mb-6`}>
                  <feature.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
