import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthQuery } from '../hooks/useAuthQuery';
import { CheckSquare, Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';

export const Register: React.FC = () => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  const { registerMutation } = useAuthQuery();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!displayName || !email || !password || !confirmPassword) {
      setFormError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    registerMutation.mutate(
      { displayName, email, password },
      {
        onSuccess: () => {
          navigate('/dashboard');
        },
        onError: (err: any) => {
          setFormError(err.response?.data?.message || 'Error occurred during registration');
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12">
      <div className="w-full max-w-md animate-slide-up">
        {/* App Logo */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="p-3 bg-brand-500/10 text-brand-400 rounded-2xl border border-brand-500/20 mb-3 shadow-lg shadow-brand-500/5">
            <CheckSquare size={32} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans">
            Get started today
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Create a workspace to organize list templates
          </p>
        </div>

        {/* Card Panel */}
        <div className="glass-panel p-8 rounded-3xl relative overflow-hidden">
          {/* Accent decoration */}
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-brand-500 via-indigo-550 to-pink-500"></div>

          {formError && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2.5 text-red-300 text-xs">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <User size={18} />
                </span>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="input-field pl-11"
                  placeholder="John Doe"
                  disabled={registerMutation.isPending}
                  required
                />
              </div>
            </div>

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
                  disabled={registerMutation.isPending}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Password (min 6 characters)
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
                  disabled={registerMutation.isPending}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field pl-11"
                  placeholder="••••••••"
                  disabled={registerMutation.isPending}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-6 py-3"
            >
              {registerMutation.isPending ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Register <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Bottom Link */}
        <p className="text-center text-slate-500 text-sm mt-6">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-brand-400 hover:text-brand-300 font-medium transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
