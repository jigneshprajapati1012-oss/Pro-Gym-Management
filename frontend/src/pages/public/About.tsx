import React from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { Target, Eye, Award, CheckCircle2, Shield } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      {/* Header Banner */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-rose-500 font-bold uppercase tracking-widest text-xs">Our Legacy & Purpose</span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">About SFW THE GYM</h1>
          <p className="max-w-2xl mx-auto text-slate-400 text-base">
            Providing Gandhinagar's fitness community with world-class facilities, scientific coaching, and an inspiring environment since 2022.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Built by Athletes for Everyone
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
              SFW THE GYM Gym was established to solve a common problem: overcrowding, poorly maintained machines, and lack of individual guidance in commercial gyms. 
            </p>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
              Whether your goal is competing on stage, dropping body fat, building functional core strength, or maintaining cardiovascular health, SFW THE GYM offers the structured environment and expert support to help you achieve it.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-rose-500 shrink-0" />
                <span className="text-sm font-semibold">Imported Smith & Cables</span>
              </div>
             <div className="flex items-center gap-3">                <CheckCircle2 className="w-5 h-5 text-rose-500 shrink-0" />
            <span className="text-sm font-semibold">1-on-1 Trainer Guidance</span>
            </div>
          <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-rose-500 shrink-0" />
           <span className="text-sm font-semibold">Hygienic Locker Rooms</span>              </div>
              <div className="flex items-center gap-3">
               <CheckCircle2 className="w-5 h-5 text-rose-500 shrink-0" />
              <span className="text-sm font-semibold">Centralized Management</span>              </div>
            </div>
          </div>

          <div>
            <img
              src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800"
              alt="Gym Interior"
              className="rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 object-cover h-[400px] w-full"
            />
          </div>
        </div>

        {/* Mission & Vision Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-rose-600/10 text-rose-600 flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold">Our Mission</h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              To deliver safe, science-backed fitness training with zero gimmicks, empowering every member to achieve sustainable long-term physical health and confidence.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold">Our Vision</h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              To remain Gandhinagar's most trusted smart fitness center by continually upgrading our facilities, integrating digital member tracking, and setting benchmarks in client transformation.
            </p>
          </div>
        </div>

      </section>

      <Footer />
    </div>
  );
};

