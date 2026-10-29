import React from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell, MapPin, Phone, Mail, Clock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Brand Column */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-lg">
                <Dumbbell className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight uppercase">
                Flex<span className="text-rose-500">Pulse</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              Premier fitness & performance facility in Gandhinagar. Empowering strength, transformation, and holistic wellness with state-of-the-art equipment and expert personal trainers.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-base mb-4 tracking-wider uppercase">Quick Links</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/about" className="hover:text-rose-400 transition-colors">About SFW THE GYM</Link></li>
              <li><Link to="/services" className="hover:text-rose-400 transition-colors">Training Services</Link></li>
              <li><Link to="/membership" className="hover:text-rose-400 transition-colors">Membership Plans</Link></li>
              <li><Link to="/trainers" className="hover:text-rose-400 transition-colors">Certified Trainers</Link></li>
              <li><Link to="/bmi-calculator" className="hover:text-rose-400 transition-colors">BMI Health Calculator</Link></li>
              <li><Link to="/login" className="text-rose-400 font-semibold hover:underline">Owner / Trainer Login</Link></li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h3 className="text-white font-semibold text-base mb-4 tracking-wider uppercase">Gym Timings</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-medium text-slate-200">Monday - Saturday</span>
                  <span>6:00 AM – 10:00 PM</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-medium text-slate-200">Sunday</span>
                  <span>7:00 AM – 1:00 PM</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-white font-semibold text-base mb-4 tracking-wider uppercase">Contact Us</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <span>K Raheja Road, Near GNLU Metro Station, Kudasan, Gandhinagar, Gujarat</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-rose-500 shrink-0" />
                <span>+91 98220 12345</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-rose-500 shrink-0" />
                <span>contact@SFW THE GYM.com</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 SFW THE GYM Management System. </p>
          <p>Built with React, Express, and SQLite.</p>
        </div>
      </div>
    </footer>
  );
};


