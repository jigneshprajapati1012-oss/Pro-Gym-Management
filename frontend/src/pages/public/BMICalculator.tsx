import React, { useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { Calculator, Activity, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const BMICalculator: React.FC = () => {
  const [height, setHeight] = useState<string>('175');
  const [weight, setWeight] = useState<string>('70');
  const [unit, setUnit] = useState<'cm' | 'ft'>('cm');
  const [feet, setFeet] = useState<string>('5');
  const [inches, setInches] = useState<string>('9');
  
  const [bmiResult, setBmiResult] = useState<{
    bmi: number;
    category: string;
    color: string;
    tip: string;
  } | null>(null);

  const calculateBMI = (e: React.FormEvent) => {
    e.preventDefault();

    let htCm = 0;
    if (unit === 'cm') {
      htCm = parseFloat(height);
    } else {
      const ft = parseFloat(feet) || 0;
      const inch = parseFloat(inches) || 0;
      htCm = (ft * 12 + inch) * 2.54;
    }

    const wtKg = parseFloat(weight);

    if (!htCm || !wtKg || htCm <= 0 || wtKg <= 0) {
      alert('Please enter valid height and weight values.');
      return;
    }

    const htM = htCm / 100;
    const bmiVal = parseFloat((wtKg / (htM * htM)).toFixed(1));

    let category = '';
    let color = '';
    let tip = '';

    if (bmiVal < 18.5) {
      category = 'Underweight';
      color = 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-900';
      tip = 'Consider a caloric surplus with progressive strength training to build lean muscular mass.';
    } else if (bmiVal >= 18.5 && bmiVal <= 24.9) {
      category = 'Normal Weight';
      color = 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-900';
      tip = 'Great job! Maintain your balanced composition with regular progressive training and protein intake.';
    } else if (bmiVal >= 25 && bmiVal <= 29.9) {
      category = 'Overweight';
      color = 'text-orange-500 bg-orange-50 dark:bg-orange-950/40 border-orange-300 dark:border-orange-900';
      tip = 'Combine cardiovascular conditioning (HIIT) with strength training to increase metabolic fat burn.';
    } else {
      category = 'Obese';
      color = 'text-rose-500 bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-900';
      tip = 'Work with our certified personal trainers to design a low-impact, sustainable weight loss regimen.';
    }

    setBmiResult({ bmi: bmiVal, category, color, tip });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-rose-500 font-bold uppercase tracking-widest text-xs">Body Composition</span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">BMI Fitness Calculator</h1>
          <p className="max-w-2xl mx-auto text-slate-400 text-base">
            Calculate your Body Mass Index instantly to understand your health baseline and body composition status.
          </p>
        </div>
      </section>

      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-8">
          
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-rose-600/10 text-rose-600">
                <Calculator className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold">Calculate Your BMI</h2>
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setUnit('cm')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                  unit === 'cm' ? 'bg-white dark:bg-slate-900 text-rose-600 shadow-sm' : 'text-slate-500'
                }`}
              >
                Centimeters (cm)
              </button>
              <button
                type="button"
                onClick={() => setUnit('ft')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                  unit === 'ft' ? 'bg-white dark:bg-slate-900 text-rose-600 shadow-sm' : 'text-slate-500'
                }`}
              >
                Feet & Inches
              </button>
            </div>
          </div>

          <form onSubmit={calculateBMI} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Height Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Height
              </label>
              {unit === 'cm' ? (
                <div className="relative">
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    required
                    min="50"
                    max="250"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-lg"
                    placeholder="175"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">cm</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <input
                      type="number"
                      value={feet}
                      onChange={(e) => setFeet(e.target.value)}
                      required
                      min="2"
                      max="8"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-lg"
                      placeholder="5"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">ft</span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={inches}
                      onChange={(e) => setInches(e.target.value)}
                      required
                      min="0"
                      max="11"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-lg"
                      placeholder="9"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">in</span>
                  </div>
                </div>
              )}
            </div>

            {/* Weight Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Weight (kg)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  required
                  min="20"
                  max="300"
                  step="0.1"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-lg"
                  placeholder="70"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">kg</span>
              </div>
            </div>

            <div className="md:col-span-2 pt-2">
              <button
                type="submit"
                className="w-full py-4 rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/30 text-base transition-transform transform hover:-translate-y-0.5"
              >
                Calculate BMI Score
              </button>
            </div>
          </form>

          {/* Results Box */}
          {bmiResult && (
            <div className={`p-6 rounded-2xl border ${bmiResult.color} space-y-4 animate-fade-in`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider block opacity-75">Your BMI Score</span>
                  <span className="text-4xl font-extrabold block mt-1">{bmiResult.bmi}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold uppercase tracking-wider block opacity-75">Health Category</span>
                  <span className="text-xl font-extrabold block mt-1">{bmiResult.category}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-current/20">
                <p className="text-xs font-medium leading-relaxed">
                  <strong>Trainer Advice:</strong> {bmiResult.tip}
                </p>
              </div>

              <div className="pt-2">
                <Link
                  to="/membership"
                  className="inline-flex items-center gap-2 text-xs font-bold underline hover:opacity-80"
                >
                  <span>Ready to transform? Explore Membership Plans</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

        </div>
      </section>

      <Footer />
    </div>
  );
};

