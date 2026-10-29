import React from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { Award, Clock, Phone, Mail } from 'lucide-react';

export const Trainers: React.FC = () => {
  const trainersList = [
    {
      name: 'Ravi Kishan',
      specialization: 'Bodybuilding & Powerlifting Specialist',
      exp: '8 Years Exp',
      phone: '+91 98230 11223',
      email: 'ravi@SFW THE GYM.com',
      photo: '/images/trainer/trainer1.jpg',
      bio: 'Certified Strength & Conditioning Specialist with 8+ years helping athletes hit peak performance and hypertrophy targets.'
    },
    {
      name: 'Neha Shah',
      specialization: 'Weight Loss & Functional Transformation',
      exp: '5 Years Exp',
      phone: '+91 98901 44556',
      email: 'neha@SFW THE GYM.com',
      photo: '/images/trainer/trainer3.jpg',
      bio: 'Specializes in HIIT, functional body transformations, mobility enhancement, and personalized body weight management.'
    },
    {
      name: 'Rahul Patel',
      specialization: 'Cardio & Athletic Rehabilitation',
      exp: '6 Years Exp',
      phone: '+91 97654 77889',
      email: 'rahul@SFW THE GYM.com',
      photo: '/images/trainer/trainer2.jpg',
      bio: 'Focuses on cardiovascular endurance, stamina building, posture correction, and post-injury athletic recovery.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-rose-500 font-bold uppercase tracking-widest text-xs">Expert Guidance</span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Meet Our Certified Trainers</h1>
          <p className="max-w-2xl mx-auto text-slate-400 text-base">
            Our team of dedicated fitness professionals are here to guide your technique, hold you accountable, and unlock your physical potential.
          </p>
        </div>
      </section>

      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {trainersList.map((t, idx) => (
            <div
              key={idx}
              className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg hover:border-rose-500 transition-colors group"
            >
              <div className="relative h-72 overflow-hidden bg-slate-800">
                <img
                  src={t.photo}
                  alt={t.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700">
                  <Clock className="w-3.5 h-3.5 text-rose-500" />
                  <span>{t.exp}</span>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t.name}</h3>
                  <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 block mt-0.5">{t.specialization}</span>
                </div>

                <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">{t.bio}</p>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-rose-500" />
                    <span>{t.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-rose-500" />
                    <span>{t.email}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

