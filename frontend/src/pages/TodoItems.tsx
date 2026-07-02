import React, { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useListQuery } from '../hooks/useListQuery';
import { useTodoQuery } from '../hooks/useTodoQuery';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Paperclip,
  Plus,
  Trash2,
  X,
  Clock,
  Loader2,
  ChevronRight,
  ExternalLink,
  Edit3
} from 'lucide-react';

export const TodoItems: React.FC = () => {
  const { listId } = useParams<{ listId: string }>();
  const { useGetListDetail } = useListQuery();
  const { data: list, isLoading: isListLoading, error: listError } = useGetListDetail(listId);

  const { useGetTodos, createTodoMutation, updateTodoMutation, deleteTodoMutation } = useTodoQuery(listId);
  const { data: todos, isLoading: isTodosLoading } = useGetTodos();

  // Create form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit form state
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editFile, setEditFile] = useState<File | null>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const [isAddOpen, setIsAddOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setEditFile(e.target.files[0]);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createTodoMutation.mutate(
      {
        title,
        description: description || undefined,
        dueDate: dueDate || undefined,
        file: file || undefined,
      },
      {
        onSuccess: () => {
          setTitle('');
          setDescription('');
          setDueDate('');
          setFile(null);
          setIsAddOpen(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        },
      }
    );
  };

  const handleEditClick = (todo: any) => {
    setEditingTodoId(todo.id);
    setEditTitle(todo.title);
    setEditDescription(todo.description || '');
    setEditDueDate(todo.dueDate ? todo.dueDate.split('T')[0] : '');
    setEditFile(null);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTodoId || !editTitle.trim()) return;

    updateTodoMutation.mutate(
      {
        id: editingTodoId,
        title: editTitle,
        description: editDescription,
        dueDate: editDueDate || undefined,
        file: editFile || undefined,
      },
      {
        onSuccess: () => {
          setEditingTodoId(null);
          setEditFile(null);
          if (editFileInputRef.current) editFileInputRef.current.value = '';
        },
      }
    );
  };

  const handleToggleComplete = (id: string, currentCompleted: boolean) => {
    updateTodoMutation.mutate({
      id,
      isCompleted: !currentCompleted,
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTodoMutation.mutate(id);
    }
  };

  if (isListLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={36} className="text-brand-500 animate-spin" />
      </div>
    );
  }

  if (listError || !list) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-300 text-sm">
        List not found or permission error: {listError?.message || 'Access Forbidden'}
      </div>
    );
  }

  const completedCount = todos?.filter((t) => t.isCompleted).length || 0;
  const totalCount = todos?.length || 0;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Back to lists */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 tracking-wider">
        <Link to="/todo-lists" className="hover:text-slate-300 transition-colors">
          TODO LISTS
        </Link>
        <ChevronRight size={12} />
        <span className="text-slate-300 truncate max-w-40">{list.name}</span>
      </div>

      {/* Header Panel */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-3">
            <Link to="/todo-lists" className="p-1.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-all active:scale-90">
              <ArrowLeft size={16} />
            </Link>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{list.name}</h2>
          </div>
          <p className="text-slate-400 text-sm max-w-2xl">{list.description || 'No description set.'}</p>

          {/* Progress bar */}
          <div className="pt-2 max-w-xs space-y-1">
            <div className="flex justify-between text-xs text-slate-400 font-medium">
              <span>Progress</span>
              <span>{progressPercent}% ({completedCount}/{totalCount})</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-500 to-indigo-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsAddOpen(!isAddOpen)}
          className="btn-primary flex items-center justify-center gap-2 text-sm whitespace-nowrap self-start md:self-auto"
        >
          {isAddOpen ? <X size={18} /> : <Plus size={18} />}
          {isAddOpen ? 'Close Panel' : 'Add Task'}
        </button>
      </div>

      {/* Task Creation Form panel */}
      {isAddOpen && (
        <div className="glass-panel p-6 rounded-2xl border-brand-500/20 animate-fade-in max-w-2xl">
          <h3 className="text-base font-bold text-white mb-4">Add Task</h3>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Task Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-field"
                  placeholder="What needs to be done?"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Due Date (Optional)</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <Paperclip size={14} /> Attachment (Optional)
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  id="task-file-upload"
                />
                <label
                  htmlFor="task-file-upload"
                  className="input-field flex items-center justify-between cursor-pointer hover:bg-slate-800 transition-colors py-2 text-sm text-slate-300 font-medium truncate"
                >
                  <span className="truncate">{file ? file.name : 'Choose attachment...'}</span>
                  {file && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="p-0.5 text-slate-400 hover:text-red-400"
                    >
                      <X size={14} />
                    </button>
                  )}
                </label>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Description (Optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-field min-h-20 resize-none text-sm"
                  placeholder="Task details and instructions..."
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="btn-secondary text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createTodoMutation.isPending}
                className="btn-primary text-xs"
              >
                {createTodoMutation.isPending ? 'Saving...' : 'Add Task'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Todos Item Listings */}
      {isTodosLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="text-brand-500 animate-spin" />
        </div>
      ) : todos?.length === 0 ? (
        <div className="glass-panel p-16 rounded-2xl text-center max-w-xl mx-auto space-y-4">
          <div className="w-12 h-12 bg-slate-900 border border-slate-850 rounded-2xl text-slate-500 flex items-center justify-center mx-auto">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h4 className="text-base font-bold text-white">No tasks created yet</h4>
            <p className="text-slate-400 text-xs mt-1">Add details, attachments, and dates to tasks above.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4 max-w-4xl">
          {todos?.map((todo) => {
            const isEditing = editingTodoId === todo.id;
            const isPastDue = todo.dueDate && new Date(todo.dueDate) < new Date() && !todo.isCompleted;

            return (
              <div
                key={todo.id}
                className={`glass-panel p-5 rounded-2xl border transition-all duration-300 ${
                  todo.isCompleted ? 'border-emerald-500/10 opacity-70 bg-slate-900/40' : 'border-slate-800/80'
                }`}
              >
                {isEditing ? (
                  /* EDITING FORM */
                  <form onSubmit={handleEditSubmit} className="space-y-4 animate-fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="input-field text-sm py-2"
                          placeholder="Task Title"
                          required
                        />
                      </div>
                      <div>
                        <input
                          type="date"
                          value={editDueDate}
                          onChange={(e) => setEditDueDate(e.target.value)}
                          className="input-field text-sm py-2"
                        />
                      </div>
                      <div>
                        <input
                          type="file"
                          ref={editFileInputRef}
                          onChange={handleEditFileChange}
                          className="hidden"
                          id={`edit-file-${todo.id}`}
                        />
                        <label
                          htmlFor={`edit-file-${todo.id}`}
                          className="input-field flex items-center justify-between cursor-pointer hover:bg-slate-800 transition-colors py-2 text-xs text-slate-300 font-medium truncate"
                        >
                          <span className="truncate">{editFile ? editFile.name : 'Update attachment...'}</span>
                        </label>
                      </div>
                      <div className="sm:col-span-2">
                        <textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="input-field text-xs min-h-16 resize-none"
                          placeholder="Task Description"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => setEditingTodoId(null)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-300 rounded-lg text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={updateTodoMutation.isPending}
                        className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-semibold"
                      >
                        {updateTodoMutation.isPending ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </form>
                ) : (
                  /* VIEWING TODO CARD */
                  <div className="flex items-start gap-4">
                    {/* Checkbox status toggle */}
                    <button
                      onClick={() => handleToggleComplete(todo.id, todo.isCompleted)}
                      className={`mt-1 flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                        todo.isCompleted
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                          : 'border-slate-700 hover:border-brand-500'
                      }`}
                    >
                      {todo.isCompleted && <CheckCircle2 size={16} />}
                    </button>

                    {/* Todo Info Details */}
                    <div className="flex-1 space-y-1.5 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <h4
                          className={`font-semibold text-sm leading-snug break-words ${
                            todo.isCompleted ? 'text-slate-500 line-through' : 'text-slate-200'
                          }`}
                        >
                          {todo.title}
                        </h4>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEditClick(todo)}
                            className="p-1.5 text-slate-500 hover:text-brand-400 hover:bg-slate-800 rounded-lg transition-colors"
                            title="Edit task"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(todo.id)}
                            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                            title="Delete task"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {todo.description && (
                        <p className={`text-xs leading-relaxed ${todo.isCompleted ? 'text-slate-600' : 'text-slate-400'}`}>
                          {todo.description}
                        </p>
                      )}

                      {/* Meta Tags */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1.5">
                        {todo.dueDate && (
                          <span
                            className={`flex items-center gap-1 text-[10px] font-semibold tracking-wide ${
                              isPastDue ? 'text-red-400' : todo.isCompleted ? 'text-slate-600' : 'text-slate-400'
                            }`}
                          >
                            <Calendar size={12} />
                            Due {new Date(todo.dueDate).toLocaleDateString()}
                            {isPastDue && ' (Past due)'}
                          </span>
                        )}

                        {todo.attachmentUrl && (
                          <a
                            href={todo.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-semibold text-brand-400 hover:text-brand-300 transition-colors"
                          >
                            <Paperclip size={12} />
                            Attachment
                            <ExternalLink size={10} />
                          </a>
                        )}

                        <span className="flex items-center gap-1 text-[10px] text-slate-600 font-semibold">
                          <Clock size={12} />
                          Added {new Date(todo.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
