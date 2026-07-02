import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuthQuery } from '../hooks/useAuthQuery';
import { CheckSquare, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const { loginMutation } = useAuthQuery();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';
  const isExpired = new URLSearchParams(location.search).get('expired') === 'true';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!email || !password) {
      setFormError('Please fill in all fields');
      return;
    }

    loginMutation.mutate(
      { email, password },
      {
        onSuccess: () => {
          navigate(from, { replace: true });
        },
        onError: (err: any) => {
          setFormError(err.response?.data?.message || 'Invalid email or password');
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md animate-slide-up">
        {/* App Logo */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="p-3 bg-brand-500/10 text-brand-400 rounded-2xl border border-brand-500/20 mb-3 shadow-lg shadow-brand-500/5">
            <CheckSquare size={32} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans">
            Welcome back
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Sign in to manage your productivity dashboard
          </p>
        </div>

        {/* Card Panel */}
        <div className="glass-panel p-8 rounded-3xl relative overflow-hidden">
          {/* Accent decoration */}
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-brand-500 via-indigo-550 to-pink-500"></div>

          {isExpired && (
            <div className="mb-6 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2.5 text-amber-300 text-xs">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>Your session has expired. Please log in again to continue.</span>
            </div>
          )}

          {formError && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2.5 text-red-300 text-xs">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-11"
                  placeholder="name@example.com"
                  disabled={loginMutation.isPending}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-11"
                  placeholder="••••••••"
                  disabled={loginMutation.isPending}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-6 py-3"
            >
              {loginMutation.isPending ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Sign In <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Bottom Link */}
        <p className="text-center text-slate-500 text-sm mt-6">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-brand-400 hover:text-brand-300 font-medium transition-colors"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};
