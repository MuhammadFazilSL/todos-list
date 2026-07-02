import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useListQuery } from '../hooks/useListQuery';
import { Edit2, Trash2, Loader2, X, FolderOpen, ArrowRight, FolderPlus, ListTodo } from 'lucide-react';

export const TodoLists: React.FC = () => {
  const { useGetLists, createListMutation, updateListMutation, deleteListMutation } = useListQuery();
  const { data: lists, isLoading, error } = useGetLists();

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Form parameters
  const [listName, setListName] = useState('');
  const [listDescription, setListDescription] = useState('');
  const [selectedListId, setSelectedListId] = useState<string | null>(null);

  const openCreateModal = () => {
    setListName('');
    setListDescription('');
    setIsCreateOpen(true);
  };

  const openEditModal = (list: { id: string; name: string; description: string }) => {
    setSelectedListId(list.id);
    setListName(list.name);
    setListDescription(list.description);
    setIsEditOpen(true);
  };

  const openDeleteModal = (id: string) => {
    setSelectedListId(id);
    setIsDeleteOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!listName.trim()) return;

    createListMutation.mutate(
      { name: listName, description: listDescription },
      {
        onSuccess: () => {
          setIsCreateOpen(false);
        },
      }
    );
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListId || !listName.trim()) return;

    updateListMutation.mutate(
      { id: selectedListId, name: listName, description: listDescription },
      {
        onSuccess: () => {
          setIsEditOpen(false);
        },
      }
    );
  };

  const handleDeleteConfirm = () => {
    if (!selectedListId) return;

    deleteListMutation.mutate(selectedListId, {
      onSuccess: () => {
        setIsDeleteOpen(false);
      },
    });
  };

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
        Failed to fetch your lists: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FolderOpen size={24} className="text-brand-400" />
            Todo Lists
          </h2>
          <p className="text-slate-400 text-sm mt-1">Create, update, and manage your isolated project checklists.</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary flex items-center justify-center gap-2 text-sm self-start sm:self-auto">
          <FolderPlus size={18} />
          New List
        </button>
      </div>

      {/* Grid displays */}
      {lists?.length === 0 ? (
        <div className="glass-panel p-16 rounded-3xl text-center max-w-xl mx-auto space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center mx-auto border border-brand-500/20">
            <ListTodo size={32} />
          </div>
          <div className="space-y-1">
            <h4 className="text-lg font-bold text-white">Create your first Todo List</h4>
            <p className="text-slate-400 text-sm">Organize task entities cleanly. Click below to add a category list.</p>
          </div>
          <button onClick={openCreateModal} className="btn-primary text-xs">
            Add New List
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lists?.map((list) => (
            <div key={list.id} className="glass-panel-interactive p-6 rounded-2xl flex flex-col justify-between h-52 group">
              <div>
                <div className="flex items-start justify-between gap-4">
                  <h4 className="font-bold text-white text-base truncate flex-1 group-hover:text-brand-300 transition-colors">
                    {list.name}
                  </h4>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(list)}
                      className="p-1.5 text-slate-500 hover:text-brand-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Edit List"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => openDeleteModal(list.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Delete List"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-slate-400 text-xs mt-2 line-clamp-3 leading-relaxed">
                  {list.description || 'No description template provided.'}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 mt-4">
                <span className="text-[10px] text-slate-500 font-medium">
                  {new Date(list.createdAt).toLocaleDateString()}
                </span>
                <Link
                  to={`/todo-lists/${list.id}`}
                  className="text-brand-400 hover:text-brand-300 text-xs font-semibold flex items-center gap-0.5 hover:gap-1 transition-all"
                >
                  Manage Items <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 relative overflow-hidden animate-slide-up">
            <button
              onClick={() => setIsCreateOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/50 transition-colors"
            >
              <X size={18} />
            </button>
            <h3 className="text-lg font-bold text-white mb-4">Create Todo List</h3>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">List Title</label>
                <input
                  type="text"
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  className="input-field"
                  placeholder="e.g. Work Tasks, Personal Goals"
                  maxLength={100}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Description (Optional)</label>
                <textarea
                  value={listDescription}
                  onChange={(e) => setListDescription(e.target.value)}
                  className="input-field min-h-24 resize-none"
                  placeholder="A short summary of what this list is about"
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createListMutation.isPending}
                  className="btn-primary text-xs"
                >
                  {createListMutation.isPending ? 'Creating...' : 'Create List'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 relative overflow-hidden animate-slide-up">
            <button
              onClick={() => setIsEditOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/50 transition-colors"
            >
              <X size={18} />
            </button>
            <h3 className="text-lg font-bold text-white mb-4">Edit Todo List</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">List Title</label>
                <input
                  type="text"
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  className="input-field"
                  placeholder="e.g. Work Tasks"
                  maxLength={100}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Description (Optional)</label>
                <textarea
                  value={listDescription}
                  onChange={(e) => setListDescription(e.target.value)}
                  className="input-field min-h-24 resize-none"
                  placeholder="Update details"
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateListMutation.isPending}
                  className="btn-primary text-xs"
                >
                  {updateListMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-sm rounded-2xl p-6 text-center animate-slide-up">
            <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-500/20 mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Delete Todo List?</h3>
            <p className="text-slate-400 text-xs leading-relaxed mb-6">
              Are you sure? This action will permanently remove this todo list and delete all nested items inside it. This cannot be undone.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                className="btn-secondary text-xs flex-1"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleteListMutation.isPending}
                className="btn-danger text-xs flex-1"
              >
                {deleteListMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
