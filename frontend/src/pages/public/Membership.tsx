import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { Check, Star, ArrowRight } from 'lucide-react';

export const Membership: React.FC = () => {
  const plans = [
    {
      name: 'Monthly Plan',
      duration: '1 Month',
      price: '₹1,699',
      period: '/month',
      popular: false,
      features: [
        'Full access to Strength & Cardio zones',
        'Locker room & shower access',
        'Initial Fitness Assessment',
        'Standard gym hours access'
      ]
    },
    {
      name: 'Quarterly Plan',
      duration: '3 Months',
      price: '₹4,499',
      period: '/3 months',
      savings: 'Save ₹600',
      popular: false,
      features: [
        'Everything in Monthly Plan',
        'Free 1 Personal Training Session',
        'Regular BMI & Progress Tracking',
        'Guest Pass (1 pass/month)'
      ]
    },
    {
      name: 'Half-Yearly Plan',
      duration: '6 Months',
      price: '₹7,999',
      period: '/6 months',
      savings: 'Save ₹2,200',
      popular: true,
      features: [
        'Everything in Quarterly Plan',
        'Assigned Dedicated Trainer',
        'Monthly Body Measurement Audits',
        'Free SFW THE GYM Gym Shaker Bottle',
        'Priority equipment reservation'
      ]
    },
    {
      name: 'Annual Pass',
      duration: '12 Months',
      price: '₹12,000',
      period: '/year',
      savings: 'Save ₹8,400 (Best Value)',
      popular: false,
      features: [
        'Unrestricted 365 Days Access',
        '2 Free Personal Trainer Sessions',
        'Full Body Composition Analysis',
        'Free SFW THE GYM Fitness Apparel',
        '2 Membership Freeze Months'
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-rose-500 font-bold uppercase tracking-widest text-xs">Flexible Pricing</span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Membership Plans</h1>
          <p className="max-w-2xl mx-auto text-slate-400 text-base">
            Transparent pricing with no hidden admission fees. Select the membership duration that aligns with your fitness goals.
          </p>
        </div>
      </section>

      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`rounded-3xl p-8 bg-white dark:bg-slate-900 border flex flex-col justify-between transition-all relative ${
                plan.popular
                  ? 'border-rose-500 shadow-2xl shadow-rose-500/10 ring-2 ring-rose-500'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-rose-600 text-white text-xs font-extrabold uppercase tracking-widest flex items-center gap-1 shadow-md">
                  <Star className="w-3.5 h-3.5 fill-white" /> Most Popular
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                  <span className="text-xs text-slate-500">{plan.duration} duration</span>
                </div>

                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{plan.price}</span>
                    <span className="text-xs text-slate-500 font-medium">{plan.period}</span>
                  </div>
                  {plan.savings && (
                    <span className="inline-block mt-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                      {plan.savings}
                    </span>
                  )}
                </div>

                <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                  {plan.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8">
                <Link
                  to="/contact"
                  className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                    plan.popular
                      ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/30'
                      : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-rose-600 dark:hover:bg-rose-500 hover:text-white'
                  }`}
                >
                  <span>Join SFW THE GYM</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

