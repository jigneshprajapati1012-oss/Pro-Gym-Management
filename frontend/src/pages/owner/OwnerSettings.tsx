import React, { useEffect, useState } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { DashboardHeader } from '../../components/DashboardHeader';
import { Settings, Save, Lock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

export const OwnerSettings: React.FC = () => {
  const [gymSettings, setGymSettings] = useState<Record<string, string>>({
    gym_name: '',
    tagline: '',
    phone: '',
    email: '',
    address: '',
    tax_rate: '18% GST',
    opening_hours: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [message, setMessage] = useState<string>('');
  const [passMessage, setPassMessage] = useState<string>('');
  const [passError, setPassError] = useState<string>('');

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      setGymSettings(res.data.settings || {});
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/settings', gymSettings);
      setMessage('Gym profile settings saved successfully.');
      setTimeout(() => setMessage(''), 4000);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save settings.');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassMessage('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPassError('New passwords do not match.');
      return;
    }

    try {
      await api.post('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPassMessage('Password updated successfully.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPassMessage(''), 4000);
    } catch (err: any) {
      setPassError(err.response?.data?.error || 'Failed to change password.');
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <DashboardHeader title="Owner & System Settings" subtitle="Configure gym business profile and account security" />

        <main className="p-6 max-w-4xl space-y-8">
          
          {/* Gym Profile Form */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="p-3 rounded-xl bg-rose-600/10 text-rose-600">
                <Settings className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Gym Business Profile</h3>
                <p className="text-xs text-slate-500">Appears on public website, footers, and official tax receipts</p>
              </div>
            </div>

            {message && (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{message}</span>
              </div>
            )}

            <form onSubmit={handleSettingsSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase mb-1">Gym Name</label>
                  <input
                    type="text"
                    value={gymSettings.gym_name || ''}
                    onChange={e => setGymSettings({ ...gymSettings, gym_name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase mb-1">Tagline</label>
                  <input
                    type="text"
                    value={gymSettings.tagline || ''}
                    onChange={e => setGymSettings({ ...gymSettings, tagline: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={gymSettings.phone || ''}
                    onChange={e => setGymSettings({ ...gymSettings, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={gymSettings.email || ''}
                    onChange={e => setGymSettings({ ...gymSettings, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase mb-1">Address</label>
                <input
                  type="text"
                  value={gymSettings.address || ''}
                  onChange={e => setGymSettings({ ...gymSettings, address: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                />
              </div>

              <div>
                <label className="block font-bold uppercase mb-1">Operating Hours</label>
                <input
                  type="text"
                  value={gymSettings.opening_hours || ''}
                  onChange={e => setGymSettings({ ...gymSettings, opening_hours: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                />
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md"
                >
                  <Save className="w-4 h-4" /> Save Profile Settings
                </button>
              </div>
            </form>
          </div>

          {/* Security & Password Form */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Security & Password</h3>
                <p className="text-xs text-slate-500">Update your Owner login password</p>
              </div>
            </div>

            {passMessage && (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                {passMessage}
              </div>
            )}
            {passError && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold">
                {passError}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs max-w-md">
              <div>
                <label className="block font-bold uppercase mb-1">Current Password *</label>
                <input
                  type="password"
                  required
                  value={passwordForm.currentPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                />
              </div>

              <div>
                <label className="block font-bold uppercase mb-1">New Password *</label>
                <input
                  type="password"
                  required
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                />
              </div>

              <div>
                <label className="block font-bold uppercase mb-1">Confirm New Password *</label>
                <input
                  type="password"
                  required
                  value={passwordForm.confirmPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>

        </main>
      </div>
    </div>
  );
};

