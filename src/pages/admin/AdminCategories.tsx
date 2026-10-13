import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { Category } from '../../types/index.js';
import { AdminSidebar } from '../../components/admin/AdminSidebar.js';
import { Modal } from '../../components/common/Modal.js';
import { useNotifications } from '../../context/NotificationContext.js';
import { Tag, Plus, Trash2, Edit } from 'lucide-react';

export const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCat, setNewCat] = useState({
    name: '',
    slug: '',
    description: '',
    color: '#2563eb',
    icon: 'Tag',
  });

  const { showToast } = useNotifications();

  const fetchCats = async () => {
    try {
      const res = await api.getCategories();
      setCategories(res.data);
    } catch (err: any) {
      showToast(err.message || 'Error fetching categories', 'error');
    }
  };

  useEffect(() => {
    fetchCats();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createCategory(newCat);
      showToast(res.message, 'success');
      setIsModalOpen(false);
      setNewCat({ name: '', slug: '', description: '', color: '#2563eb', icon: 'Tag' });
      fetchCats();
    } catch (err: any) {
      showToast(err.message || 'Failed to create category', 'error');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    try {
      await api.deleteCategory(id);
      showToast('Category deleted', 'info');
      fetchCats();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete category', 'error');
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-10 space-y-6 overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl font-bold font-serif text-slate-900 dark:text-white">
              Categories Management
            </h1>
            <p className="text-xs text-slate-500">
              Manage news beats, colors, and classifications.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category Beat</span>
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(c => (
            <div
              key={c.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: c.color }}
                    />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white font-serif">
                      {c.name}
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {c.articleCount || 0} articles
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {c.description || 'General news beat.'}
                </p>

                <div className="mt-2 text-[10px] font-mono text-slate-400">
                  Slug: /{c.slug}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
                <button
                  onClick={() => handleDelete(c.id, c.name)}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg text-xs flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create New Category Beat"
        >
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
            <div>
              <label className="text-slate-500 block mb-1">Category Name *</label>
              <input
                type="text"
                required
                value={newCat.name}
                onChange={e => setNewCat({ ...newCat, name: e.target.value })}
                placeholder="e.g. Research & Patents"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-slate-500 block mb-1">Accent Hex Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={newCat.color}
                  onChange={e => setNewCat({ ...newCat, color: e.target.value })}
                  className="w-10 h-10 rounded-lg border-0 cursor-pointer"
                />
                <span className="font-mono text-xs">{newCat.color}</span>
              </div>
            </div>

            <div>
              <label className="text-slate-500 block mb-1">Description</label>
              <textarea
                rows={2}
                value={newCat.description}
                onChange={e => setNewCat({ ...newCat, description: e.target.value })}
                placeholder="Brief description of beat coverage..."
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors cursor-pointer"
            >
              Add Category
            </button>
          </form>
        </Modal>
      </main>
    </div>
  );
};
