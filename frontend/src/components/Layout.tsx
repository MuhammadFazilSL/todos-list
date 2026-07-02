import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckSquare, LogOut, LayoutDashboard, ListTodo } from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Premium Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <div className="p-2 bg-brand-500/10 text-brand-400 rounded-xl group-hover:bg-brand-500/20 group-hover:text-brand-300 transition-all duration-300">
              <CheckSquare size={22} className="animate-pulse-subtle" />
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent group-hover:to-brand-400 transition-colors duration-300">
              Taskify <span className="text-xs px-2 py-0.5 ml-1 bg-brand-500/10 text-brand-400 rounded-full border border-brand-500/20">SaaS</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/dashboard"
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                isActive('/dashboard') ? 'text-brand-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard size={16} />
              Dashboard
            </Link>
            <Link
              to="/todo-lists"
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                isActive('/todo-lists') ? 'text-brand-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ListTodo size={16} />
              My Lists
            </Link>
          </nav>

          {/* User Profile / Logout Actions */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-semibold text-slate-200">{user?.displayName || 'SaaS User'}</span>
                <span className="text-xs text-slate-500">{user?.email}</span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                {(user?.displayName || 'U')[0].toUpperCase()}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 active:scale-95"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900/60 bg-slate-950 py-6 text-center text-slate-600 text-xs">
        <p>&copy; {new Date().getFullYear()} Taskify SaaS. Built with React, NestJS, and Google Firestore.</p>
      </footer>
    </div>
  );
};
