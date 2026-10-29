import React, { useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';

export const Gallery: React.FC = () => {
  const [filter, setFilter] = useState<string>('All');

  const galleryItems = [
    { title: 'Olympic Heavy Weight Section', category: 'Weights', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800' },
    { title: 'Commercial Cardio Studio', category: 'Cardio', image: 'https://images.unsplash.com/photo-1576678927484-cc909957088c?w=800' },
    { title: 'High-Performance Squat Racks', category: 'Strength', image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800' },
    { title: 'Modern Welcome Reception Desk', category: 'Facility', image: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800' },
    { title: 'Dumbbell Rack (2.5kg - 40kg)', category: 'Weights', image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800' },
    { title: 'Functional Agility Turf Floor', category: 'Functional', image: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=800' },
    { title: 'Dual Cable Crossover Station', category: 'Equipment', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800' },
    { title: 'Personal Training Zone', category: 'Facility', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800' }
  ];

  const categories = ['All', 'Weights', 'Cardio', 'Strength', 'Equipment', 'Facility', 'Functional'];

  const filtered = filter === 'All' ? galleryItems : galleryItems.filter(i => i.category === filter);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-rose-500 font-bold uppercase tracking-widest text-xs">Facility Showcase</span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">SFW THE GYM Gym Gallery</h1>
          <p className="max-w-2xl mx-auto text-slate-400 text-base">
            Take a visual tour of our clean, spacious, and fully equipped gym zones in Gandhinagar.
          </p>
        </div>
      </section>

      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                filter === c
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((item, idx) => (
            <div
              key={idx}
              className="group relative rounded-2xl overflow-hidden shadow-lg bg-slate-900 border border-slate-200 dark:border-slate-800"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-90 transition-opacity p-6 flex flex-col justify-end">
                <span className="text-[10px] font-extrabold text-rose-500 uppercase tracking-widest">{item.category}</span>
                <h4 className="text-sm font-bold text-white mt-1">{item.title}</h4>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};


