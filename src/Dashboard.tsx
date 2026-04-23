import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Edit2, Trash2, Plus, LogOut, CheckCircle, Clock } from 'lucide-react';

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  user_id: number;
}

export const Dashboard = () => {
  const { user, token, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('pending');

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/v1/tasks', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch tasks');
      const data = await res.json();
      setTasks(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [token]);

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingTask ? `/api/v1/tasks/${editingTask.id}` : '/api/v1/tasks';
      const method = editingTask ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, description, status })
      });
      
      if (!res.ok) throw new Error('Failed to save task');
      
      setIsModalOpen(false);
      resetForm();
      fetchTasks();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      const res = await fetch(`/api/v1/tasks/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete task');
      setTasks(tasks.filter(t => t.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setStatus(task.status);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setStatus('pending');
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-lg font-bold text-slate-800">System Dashboard Overview</h1>
          <p className="text-slate-500">Welcome back, <span className="font-medium text-slate-700">{user?.username}</span> <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full ml-2 border border-slate-200 uppercase tracking-widest">{user?.role}</span></p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-tight">API Live</span>
          </div>
          <button onClick={logout} className="flex items-center gap-2 px-4 py-1.5 text-xs text-slate-600 hover:bg-slate-50 rounded transition-colors font-semibold border border-transparent hover:border-slate-200 shadow-sm">
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-slate-700">Managed Task Entities (CRUD)</h2>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded text-sm font-semibold shadow-sm transition"
        >
          <Plus size={16} /> New Task
        </button>
      </div>

      {error && <div className="p-4 mb-6 bg-red-50 text-red-600 rounded-lg border border-red-100">{error}</div>}

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-slate-100">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-400 mb-4">
            <CheckCircle size={32} />
          </div>
          <h3 className="text-sm font-bold text-slate-800 mb-1">No tasks yet</h3>
          <p className="text-slate-500 text-xs max-w-sm mx-auto">Get started by creating your first task to manage your workload.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map(task => (
            <div key={task.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 uppercase tracking-wider
                  ${task.status === 'completed' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 
                    task.status === 'in-progress' ? 'bg-amber-100 text-amber-700 border-amber-200' : 
                    'bg-slate-100 text-slate-700 border-slate-200'}`}
                >
                  {task.status.replace('-', '_')}
                </span>
                <div className="flex gap-1">
                  <button onClick={() => openEditModal(task)} className="p-1 text-indigo-600 hover:bg-indigo-50 rounded transition-colors text-xs font-bold px-2 underline">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(task.id)} className="p-1 text-slate-400 hover:bg-slate-50 rounded transition-colors text-xs font-bold px-2">
                    Delete
                  </button>
                </div>
              </div>
              <h3 className="font-bold text-sm text-slate-800 mb-2">{task.title}</h3>
              <p className="text-slate-600 text-xs flex-grow line-clamp-3 mb-4">{task.description || 'No description provided.'}</p>
              
              {user?.role === 'admin' && (
                <div className="mt-auto pt-3 border-t border-slate-100 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  User: {task.user_id}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex flex-col items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-lg font-bold text-slate-800 mb-5">{editingTask ? 'Edit Task' : 'Create Task'}</h2>
            <form onSubmit={handleSaveTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Title</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none transition text-slate-800"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Description</label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none transition text-slate-800 resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Status</label>
                <select
                  className="w-full px-4 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none transition text-slate-800 bg-white"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="pending">PENDING</option>
                  <option value="in-progress">IN_PROGRESS</option>
                  <option value="completed">COMPLETED</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded text-sm font-semibold hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-semibold shadow-sm transition-colors">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
