import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dumbbell,
  Shield,
  UserCheck,
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../../components/Navbar';

export const StaffLogin: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const [forgotOpen, setForgotOpen] = useState<boolean>(false);
  const [forgotStep, setForgotStep] = useState<'email' | 'reset'>('email');
  const [forgotEmail, setForgotEmail] = useState<string>('');
  const [resetToken, setResetToken] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [forgotMessage, setForgotMessage] = useState<string>('');
  const [forgotError, setForgotError] = useState<string>('');
  const [forgotLoading, setForgotLoading] = useState<boolean>(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please provide both staff email and password.');
      return;
    }

    try {
      setLoading(true);

      const user = await login(email.trim(), password);

      if (user.role === 'OWNER') {
        navigate('/admin/dashboard');
      } else {
        navigate('/trainer/dashboard');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
        'Invalid credentials or network failure.'
      );
    } finally {
      setLoading(false);
    }
  };

  const fillDemoOwner = () => {
    setEmail('');
    setPassword('');
  };

  const fillDemoTrainer = () => {
    setEmail('');
    setPassword('');
  };

  const clearCredentials = () => {
    setEmail('');
    setPassword('');
    setError('');
  };

  const handleForgotPassword = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setForgotError('');
    setForgotMessage('');

    if (!forgotEmail.trim()) {
      setForgotError('Please enter your staff email.');
      return;
    }

    try {
      setForgotLoading(true);

      const response = await fetch(
        'http://localhost:5000/api/auth/forgot-password',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: forgotEmail.trim().toLowerCase()
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Unable to process password recovery.'
        );
      }

      setResetToken(data.resetToken);
      setForgotStep('reset');
      setForgotMessage(data.message);
    } catch (err: any) {
      setForgotError(
        err.message || 'Password recovery failed.'
      );
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setForgotError('');
    setForgotMessage('');

    if (!newPassword || !confirmPassword) {
      setForgotError(
        'Please enter and confirm your new password.'
      );
      return;
    }

    if (newPassword.length < 6) {
      setForgotError(
        'New password must be at least 6 characters long.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setForgotError(
        'Passwords do not match.'
      );
      return;
    }

    try {
      setForgotLoading(true);

      const response = await fetch(
        'http://localhost:5000/api/auth/reset-password',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            resetToken,
            newPassword
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Unable to reset password.'
        );
      }

      setForgotMessage(
        'Password reset successfully. You can now log in with your new password.'
      );

      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        setForgotOpen(false);
        setForgotStep('email');
        setForgotEmail('');
        setResetToken('');
        setForgotMessage('');
      }, 2000);
    } catch (err: any) {
      setForgotError(
        err.message || 'Password reset failed.'
      );
    } finally {
      setForgotLoading(false);
    }
  };

  const closeForgotPassword = () => {
    setForgotOpen(false);
    setForgotStep('email');
    setForgotEmail('');
    setResetToken('');
    setNewPassword('');
    setConfirmPassword('');
    setForgotMessage('');
    setForgotError('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-white transition-colors">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-rose-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl" />

        <div className="max-w-md w-full bg-slate-950/80 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl space-y-8 relative z-10">

          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-rose-600/30">
              <Dumbbell className="w-8 h-8 stroke-[2.5]" />
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight">
              Staff Authentication
            </h1>

            <p className="text-xs text-slate-400">
              SFW THE GYM Owner & Trainer Management Portal
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={fillDemoOwner}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800/60 text-xs font-semibold text-rose-300 transition-colors"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Fill Owner</span>
              </button>

              <button
                type="button"
                onClick={fillDemoTrainer}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-sky-950/60 hover:bg-sky-900/60 border border-sky-800/60 text-xs font-semibold text-sky-300 transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Fill Trainer</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Staff Email
              </label>

              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder=""
                  autoComplete="off"
                  required
                  className="w-full px-4 py-3 pl-11 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-rose-500 focus:outline-none"
                />

                <Mail className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Password
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setForgotOpen(true);
                    setForgotEmail(email);
                    setForgotError('');
                    setForgotMessage('');
                  }}
                  className="text-xs text-rose-400 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder=""
                  autoComplete="new-password"
                  required
                  className="w-full px-4 py-3 pl-11 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-rose-500 focus:outline-none"
                />

                <Lock className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {(email || password) && (
              <button
                type="button"
                onClick={clearCredentials}
                className="w-full py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
              >
                Clear Login Fields
              </button>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/30 text-sm flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {forgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl p-7">

            <div className="text-center mb-6">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center mb-4">
                {forgotStep === 'email' ? (
                  <Mail className="w-7 h-7" />
                ) : (
                  <KeyRound className="w-7 h-7" />
                )}
              </div>

              <h2 className="text-xl font-extrabold text-white">
                {forgotStep === 'email'
                  ? 'Forgot Password'
                  : 'Create New Password'}
              </h2>

              <p className="text-xs text-slate-400 mt-2">
                {forgotStep === 'email'
                  ? 'Enter your registered staff email to continue.'
                  : 'Choose a new password for your staff account.'}
              </p>
            </div>

            {forgotError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotMessage && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs font-semibold">
                {forgotMessage}
              </div>
            )}

            {forgotStep === 'email' && (
              <form
                onSubmit={handleForgotPassword}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Staff Email
                  </label>

                  <div className="relative">
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={e =>
                        setForgotEmail(e.target.value)
                      }
                      placeholder="Enter your registered email"
                      autoComplete="email"
                      required
                      className="w-full px-4 py-3 pl-11 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-rose-500 focus:outline-none"
                    />

                    <Mail className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-3.5 rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {forgotLoading
                    ? 'Checking Account...'
                    : 'Continue'}

                  {!forgotLoading && (
                    <ArrowRight className="w-4 h-4" />
                  )}
                </button>
              </form>
            )}

            {forgotStep === 'reset' && (
              <form
                onSubmit={handleResetPassword}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    New Password
                  </label>

                  <div className="relative">
                    <input
                      type="password"
                      value={newPassword}
                      onChange={e =>
                        setNewPassword(e.target.value)
                      }
                      placeholder="Minimum 6 characters"
                      autoComplete="new-password"
                      required
                      className="w-full px-4 py-3 pl-11 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-rose-500 focus:outline-none"
                    />

                    <Lock className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Confirm Password
                  </label>

                  <div className="relative">
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e =>
                        setConfirmPassword(e.target.value)
                      }
                      placeholder="Enter password again"
                      autoComplete="new-password"
                      required
                      className="w-full px-4 py-3 pl-11 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-rose-500 focus:outline-none"
                    />

                    <Lock className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-3.5 rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {forgotLoading
                    ? 'Updating Password...'
                    : 'Reset Password'}

                  {!forgotLoading && (
                    <ArrowRight className="w-4 h-4" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setForgotStep('email');
                    setForgotError('');
                    setForgotMessage('');
                  }}
                  className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-white flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back
                </button>
              </form>
            )}

            <button
              type="button"
              onClick={closeForgotPassword}
              className="w-full mt-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};