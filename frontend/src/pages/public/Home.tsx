import React from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell, ShieldCheck, Users, Trophy, ChevronRight, Zap, ArrowRight } from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-32 bg-slate-900 text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-rose-950/80 via-slate-900 to-slate-950 z-0 opacity-90" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-rose-600/20 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold uppercase tracking-wider">
                <Zap className="w-4 h-4 fill-rose-400" />
                <span>Premier Fitness Facility in Gandhinagar</span>
              </div>

              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                GYM  KARE , <br />
                <span className="bg-gradient-to-r from-rose-500 via-amber-400 to-rose-400 bg-clip-text text-transparent">
                  GYMMEDAR  BANE.
                </span>
              </h2>

              <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl">
                Welcome to <strong className="text-white">SFW THE GYM</strong>. Experience world-class strength training, biomechanically designed cardio gear, certified personal trainers, and tailored fitness programs built for your goals.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  to="/membership"
                  className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xl shadow-rose-600/30 transition-transform transform hover:-translate-y-0.5"
                >
                  <span>Join Now</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <Link
                  to="/membership"
                  className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold border border-slate-700 hover:bg-slate-800 text-slate-200 transition-colors"
                >
                  <span>View Memberships</span>
                </Link>

                <Link
                  to="/login"
                  className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition-transform transform hover:-translate-y-0.5"
                >
                  <span>Owner / Trainer Login</span>
                </Link>
              </div>

              {/* Stats Bar */}
              <div className="pt-8 grid grid-cols-3 gap-6 border-t border-slate-800/80">
                <div>
                  <span className="block text-3xl font-extrabold text-white">500+</span>
                  <span className="text-xs text-slate-400">Active Members</span>
                </div>
                <div>
                  <span className="block text-3xl font-extrabold text-white">15+</span>
                  <span className="text-xs text-slate-400">Certified Trainers</span>
                </div>
                <div>
                  <span className="block text-3xl font-extrabold text-white">100%</span>
                  <span className="text-xs text-slate-400">Results Driven</span>
                </div>
              </div>
            </div>

            {/* Visual Card */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-800">
                <img
                  src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800"
                  alt="SFW THE GYM Gym Facility"
                  className="w-full h-[460px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                
                <div className="absolute bottom-6 left-6 right-6 p-6 rounded-2xl backdrop-blur-md bg-slate-900/80 border border-slate-700/60 text-white">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-rose-600 text-white">
                      <Trophy className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base">Top Rated Gym in Gandhinagar</h4>
                      <p className="text-xs text-slate-300">State-of-the-art equipment & biomechanically optimized training zone.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="py-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Why Choose SFW THE GYM?
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400 text-sm sm:text-base">
              Everything you need to reach your ultimate physical potential in a supportive, high-energy environment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-4 hover:border-rose-500 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                <Dumbbell className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Commercial Grade Equipment</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                Equipped with imported Olympic Smith machines, heavy duty cable crossovers, dumbbell sets up to 40kg, and high-tech cardio machines.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-4 hover:border-rose-500 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Certified Master Trainers</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                Dedicated male and female personal trainers with multi-year experience guiding hypertrophy, weight loss, and athletic rehabilitation.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-4 hover:border-rose-500 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Scientific Progress Tracking</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                Our trainers record regular body metrics, BMI calculations, and muscle girth progression to ensure consistent measurable gains.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};


