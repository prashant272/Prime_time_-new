import React, { useState } from 'react';
import { 
  useGetAwardCategoriesQuery, 
  useCreateAwardCategoryMutation, 
  useUpdateAwardCategoryMutation, 
  useDeleteAwardCategoryMutation 
} from '../../store/apiSlice';
import { Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const AdminAwardCategories = () => {
  const { data: response, isLoading } = useGetAwardCategoriesQuery();
  const [createCategory] = useCreateAwardCategoryMutation();
  const [updateCategory] = useUpdateAwardCategoryMutation();
  const [deleteCategory] = useDeleteAwardCategoryMutation();

  const categories = response?.data || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [formData, setFormData] = useState({ name: '', order: 0, isActive: true });

  const handleOpenModal = (cat = null) => {
    if (cat) {
      setEditingCat(cat);
      setFormData({ name: cat.name, order: cat.order, isActive: cat.isActive });
    } else {
      setEditingCat(null);
      setFormData({ name: '', order: categories.length + 1, isActive: true });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCat) {
        await updateCategory({ id: editingCat._id, data: formData }).unwrap();
      } else {
        await createCategory(formData).unwrap();
      }
      setIsModalOpen(false);
    } catch (err) {
      alert(err.data?.message || 'Action failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category? All associated awards may become orphaned.')) {
      try {
        await deleteCategory(id).unwrap();
      } catch (err) {
        alert(err.data?.message || 'Failed to delete');
      }
    }
  };

  if (isLoading) return <div className="p-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <Helmet><title>Manage Award Categories | Admin</title></Helmet>

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">Award Categories</h1>
        <button 
          onClick={() => handleOpenModal()} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={20} />
          New Category
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-500 uppercase font-medium border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Order</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Slug</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.map((cat) => (
              <tr key={cat._id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium">{cat.order}</td>
                <td className="px-6 py-4 font-semibold text-slate-800">{cat.name}</td>
                <td className="px-6 py-4 text-slate-500">{cat.slug}</td>
                <td className="px-6 py-4">
                  {cat.isActive ? 
                    <span className="flex items-center text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md w-fit"><CheckCircle size={14} className="mr-1"/> Active</span> : 
                    <span className="flex items-center text-rose-600 bg-rose-50 px-2 py-1 rounded-md w-fit"><XCircle size={14} className="mr-1"/> Inactive</span>
                  }
                </td>
                <td className="px-6 py-4 text-right">
                  {cat._id !== 'upcoming-hardcode' ? (
                    <>
                      <button onClick={() => handleOpenModal(cat)} className="text-blue-600 hover:text-blue-800 p-2">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(cat._id)} className="text-red-600 hover:text-red-800 p-2">
                        <Trash2 size={18} />
                      </button>
                    </>
                  ) : (
                    <span className="text-slate-400 text-xs italic px-2">System Default</span>
                  )}
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">No categories found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-2xl font-bold mb-4">{editingCat ? 'Edit Category' : 'Create Category'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category Name</label>
                <input 
                  type="text" required
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. Global Education Awards"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Display Order</label>
                <input 
                  type="number" required
                  value={formData.order} onChange={e => setFormData({...formData, order: Number(e.target.value)})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="flex items-center">
                <input 
                  type="checkbox" id="isActive"
                  checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-slate-700">Active (Visible on site)</label>
              </div>
              <div className="pt-4 flex gap-3 justify-end">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAwardCategories;
