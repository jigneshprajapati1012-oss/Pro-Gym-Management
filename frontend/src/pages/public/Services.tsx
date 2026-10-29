import React from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { Dumbbell, Activity, HeartPulse, UserCheck, Scale, Flame, ClipboardList } from 'lucide-react';

export const Services: React.FC = () => {
  const servicesList = [
    {
      title: 'Strength Training',
      icon: Dumbbell,
      desc: 'Progressive overload programs designed with squat racks, deadlift platforms, and heavy dumbbell stations to build maximum muscular strength.',
      color: 'bg-rose-500/10 text-rose-500'
    },
    {
      title: 'Weight Training',
      icon: Activity,
      desc: 'Targeted hypertrophy routines using pin-loaded and plate-loaded machines to sculpt and isolate body parts efficiently.',
      color: 'bg-amber-500/10 text-amber-500'
    },
    {
      title: 'Cardio Endurance',
      icon: HeartPulse,
      desc: 'High-end commercial treadmills, elliptical cross trainers, and stationary air bikes equipped with heart rate monitoring.',
      color: 'bg-sky-500/10 text-sky-500'
    },
    {
      title: 'Personal Training',
      icon: UserCheck,
      desc: 'One-on-one dedicated coaching with certified trainers focusing on proper biomechanics, form correction, and custom progression.',
      color: 'bg-emerald-500/10 text-emerald-500'
    },
    {
      title: 'Weight Management',
      icon: Scale,
      desc: 'Balanced body composition programs blending metabolic conditioning, caloric deficit tracking, and lean muscle retention.',
      color: 'bg-purple-500/10 text-purple-500'
    },
    {
      title: 'Functional Training',
      icon: Flame,
      desc: 'Kettlebells, battle ropes, medicine balls, and bodyweight agility exercises to improve athletic agility and core stability.',
      color: 'bg-orange-500/10 text-orange-500'
    },
    {
      title: 'Fitness Assessment',
      icon: ClipboardList,
      desc: 'Comprehensive initial evaluation measuring BMI, body fat percentage, posture alignment, and cardiovascular stamina baseline.',
      color: 'bg-teal-500/10 text-teal-500'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-rose-500 font-bold uppercase tracking-widest text-xs">Comprehensive Programs</span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Our Gym Services</h1>
          <p className="max-w-2xl mx-auto text-slate-400 text-base">
            Professional fitness training services engineered to cater to beginners, fitness enthusiasts, and competitive athletes alike.
          </p>
        </div>
      </section>

      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {servicesList.map((service, idx) => {
            const Icon = service.icon;
            return (
              <div
                key={idx}
                className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 hover:shadow-xl hover:border-rose-500 transition-all group"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold ${service.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{service.title}</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{service.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      <Footer />
    </div>
  );
};

