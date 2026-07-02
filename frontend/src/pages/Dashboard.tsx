import React from 'react';
import { Link } from 'react-router-dom';
import { useListQuery } from '../hooks/useListQuery';
import { useAuth } from '../context/AuthContext';
import {
  ListTodo,
  CheckCircle2,
  Hourglass,
  Plus,
  ArrowRight,
  TrendingUp,
  Loader2,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { useGetLists } = useListQuery();
  const { data: lists, isLoading, error } = useGetLists();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={36} className="text-brand-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-300 text-sm">
        Failed to fetch your dashboard: {error.message}
      </div>
    );
  }

  const totalLists = lists?.length || 0;

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Welcome Banner */}
      <div className="relative glass-panel p-8 rounded-3xl overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl"></div>

        <div className="relative space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold uppercase tracking-wider">
            <TrendingUp size={12} />
            Analytics Overview
          </div>
          <h2 className="text-3xl font-extrabold text-white font-sans">
            Hello, {user?.displayName || 'Developer'}!
          </h2>
          <p className="text-slate-400 max-w-xl text-sm leading-relaxed">
            Here is a breakdown of your current SaaS project lists. Stay productive, upload attachments, and mark goals.
          </p>
        </div>

        <Link to="/todo-lists" className="btn-primary relative inline-flex items-center gap-2 text-sm whitespace-nowrap self-start md:self-auto">
          <Plus size={18} />
          Create New List
        </Link>
      </div>

      {/* Stats Panels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl flex items-center gap-5">
          <div className="p-4 bg-blue-500/15 text-blue-400 rounded-2xl">
            <ListTodo size={24} />
          </div>
          <div>
            <span className="block text-slate-400 text-xs font-medium uppercase tracking-wider">Total Lists</span>
            <span className="text-2xl font-bold text-white mt-1 block">{totalLists}</span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex items-center gap-5">
          <div className="p-4 bg-amber-500/15 text-amber-400 rounded-2xl">
            <Hourglass size={24} />
          </div>
          <div>
            <span className="block text-slate-400 text-xs font-medium uppercase tracking-wider">Active Workspace</span>
            <span className="text-2xl font-bold text-white mt-1 block">Google Firestore</span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex items-center gap-5 sm:col-span-2 lg:col-span-1">
          <div className="p-4 bg-emerald-500/15 text-emerald-400 rounded-2xl">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <span className="block text-slate-400 text-xs font-medium uppercase tracking-wider">Storage Tier</span>
            <span className="text-2xl font-bold text-white mt-1 block">Cloud Storage</span>
          </div>
        </div>
      </div>

      {/* Lists Summary Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white font-sans flex items-center gap-2">
            Recent Todo Lists
            <span className="text-xs px-2 py-0.5 bg-slate-800 text-slate-400 rounded-full font-normal">
              {totalLists} lists
            </span>
          </h3>
          <Link to="/todo-lists" className="text-brand-400 hover:text-brand-300 text-xs font-semibold flex items-center gap-1 transition-colors">
            Manage All Lists <ArrowRight size={14} />
          </Link>
        </div>

        {totalLists === 0 ? (
          <div className="glass-panel p-10 rounded-2xl text-center space-y-4">
            <p className="text-slate-400 text-sm">No lists created yet. Let's create your first one to get started!</p>
            <Link to="/todo-lists" className="btn-secondary inline-flex items-center gap-2 text-xs">
              <Plus size={16} /> Create List
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lists?.slice(0, 6).map((list) => (
              <div key={list.id} className="glass-panel-interactive p-6 rounded-2xl flex flex-col justify-between gap-4 h-48">
                <div>
                  <h4 className="font-bold text-white text-base truncate">{list.name}</h4>
                  <p className="text-slate-400 text-xs mt-1.5 line-clamp-3 leading-relaxed">
                    {list.description || 'No description provided.'}
                  </p>
                </div>
                <div className="flex items-center justify-between border-t border-slate-800/80 pt-3">
                  <span className="text-[10px] text-slate-500 font-medium">
                    Created {new Date(list.createdAt).toLocaleDateString()}
                  </span>
                  <Link
                    to={`/todo-lists/${list.id}`}
                    className="text-brand-400 hover:text-brand-300 text-xs font-semibold flex items-center gap-0.5 hover:gap-1 transition-all"
                  >
                    Open Tasks <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
