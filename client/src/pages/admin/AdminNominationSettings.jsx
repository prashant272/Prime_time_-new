import React, { useState, useEffect } from 'react';
import { useGetNominationSettingsQuery, useUpdateNominationSettingsMutation } from '../../store/apiSlice';
import { Plus, Trash2, Save, AlertCircle, CheckCircle2, Edit2, X } from 'lucide-react';

const STATIC_AWARDS = [
  'International Awards',
  'Global Education Awards',
  'Global Healthcare Awards',
  'Digital Bharat Summit',
  'Global Icon Awards',
  'India Excellence Awards'
];

const AdminNominationSettings = () => {
  const { data: settings, isLoading, isError, refetch } = useGetNominationSettingsQuery();
  const [updateSettings, { isLoading: isUpdating }] = useUpdateNominationSettingsMutation();

  const [categories, setCategories] = useState([]);
  const [editingCatIdx, setEditingCatIdx] = useState(null);

  // Local state for the category currently being edited/added
  const [editFormData, setEditFormData] = useState({ categoryName: '', awards: [''] });

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (settings && settings.categories) {
      setCategories(JSON.parse(JSON.stringify(settings.categories)));
    } else if (settings) {
      setCategories([]);
    }
  }, [settings]);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleAddNew = () => {
    setEditFormData({ categoryName: '', awards: [''] });
    setEditingCatIdx(-1); // -1 means adding new
  };

  const handleEdit = (index) => {
    setEditFormData(JSON.parse(JSON.stringify(categories[index])));
    setEditingCatIdx(index);
  };

  const handleCancelEdit = () => {
    setEditingCatIdx(null);
    setEditFormData({ categoryName: '', awards: [''] });
  };

  const handleDeleteCategory = async (index) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    const newCats = [...categories];
    newCats.splice(index, 1);

    try {
      await updateSettings({ categories: newCats }).unwrap();
      setCategories(newCats);
      showSuccess('Category deleted successfully!');
    } catch (error) {
      setErrorMsg(error?.data?.message || 'Failed to delete category');
    }
  };

  const handleSaveCategory = async () => {
    setErrorMsg('');
    if (!editFormData.categoryName.trim()) {
      setErrorMsg('Category name cannot be empty');
      return;
    }

    const cleanedAwards = editFormData.awards.map(a => a.trim()).filter(a => a !== '');
    if (cleanedAwards.length === 0) {
      setErrorMsg('At least one award is required');
      return;
    }

    const newCatData = {
      categoryName: editFormData.categoryName.trim(),
      awards: cleanedAwards
    };

    let newCats = [...categories];
    if (editingCatIdx === -1) {
      // Adding new
      const existingIdx = newCats.findIndex(c => c.categoryName.toLowerCase() === newCatData.categoryName.toLowerCase());
      if (existingIdx !== -1) {
        setErrorMsg('This Award Event already exists. Please click Edit on the existing block instead of creating a new one.');
        return;
      }
      newCats.push(newCatData);
    } else {
      // Updating existing
      newCats[editingCatIdx] = newCatData;
    }

    try {
      await updateSettings({ categories: newCats }).unwrap();
      setCategories(newCats);
      setEditingCatIdx(null);
      showSuccess('Category saved successfully!');
    } catch (error) {
      setErrorMsg(error?.data?.message || 'Failed to save category');
    }
  };

  // Form field handlers
  const handleAddAward = () => {
    setEditFormData(prev => ({ ...prev, awards: [...prev.awards, ''] }));
  };

  const handleRemoveAward = (awardIndex) => {
    setEditFormData(prev => {
      const newAwards = [...prev.awards];
      newAwards.splice(awardIndex, 1);
      return { ...prev, awards: newAwards };
    });
  };

  const handleAwardNameChange = (awardIndex, val) => {
    setEditFormData(prev => {
      const newAwards = [...prev.awards];
      newAwards[awardIndex] = val;
      return { ...prev, awards: newAwards };
    });
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading settings...</div>;
  }

  if (isError) {
    return <div className="p-8 text-center text-red-500">Failed to load settings. Make sure backend is running.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Award Events & Editions</h2>
          <p className="text-gray-500 text-sm mt-1">Manage the available Award Names and their corresponding Editions for the nomination form.</p>
        </div>
        {editingCatIdx === null && (
          <button
            onClick={handleAddNew}
            className="flex items-center space-x-2 bg-sky-600 hover:bg-sky-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Award Event</span>
          </button>
        )}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex gap-3 text-yellow-800">
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <strong>Note:</strong> This configuration is entirely standalone. It drives the Award Name and Edition dropdowns in the Nomination Form.
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex gap-3 text-emerald-800">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="text-sm font-medium">{successMsg}</div>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3 text-red-800">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="text-sm font-medium">{errorMsg}</div>
        </div>
      )}

      <div className="space-y-6">
        {/* ADD / EDIT FORM */}
        {editingCatIdx !== null && (
          <div className="bg-white rounded-2xl shadow-lg border-2 border-sky-200 overflow-hidden">
            <div className="bg-sky-50 px-6 py-4 border-b border-sky-100 flex justify-between items-center">
              {editingCatIdx === -1 ? (
                <select
                  value={editFormData.categoryName}
                  onChange={(e) => setEditFormData({ ...editFormData, categoryName: e.target.value })}
                  className="font-bold text-lg text-gray-800 bg-white border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-200 focus:outline-none transition-colors px-3 py-2 w-full max-w-md shadow-sm"
                >
                  <option value="">-Select Award Event-</option>
                  {STATIC_AWARDS.map(award => (
                    <option key={award} value={award} disabled={categories.some(c => c.categoryName === award)}>{award}</option>
                  ))}
                </select>
              ) : (
                <span className="font-bold text-lg text-gray-800 px-3 py-2">{editFormData.categoryName}</span>
              )}
              <button
                onClick={handleCancelEdit}
                className="text-gray-400 hover:text-gray-600 p-2"
                title="Cancel"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">Editions</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {editFormData.awards.map((award, awardIdx) => (
                  <div key={awardIdx} className="flex relative group">
                    <input
                      type="text"
                      placeholder="Edition (e.g. 2024, Dubai Edition)"
                      value={award}
                      onChange={(e) => handleAwardNameChange(awardIdx, e.target.value)}
                      className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all shadow-sm"
                    />
                    <button
                      onClick={() => handleRemoveAward(awardIdx)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                <button
                  onClick={handleAddAward}
                  className="flex flex-col items-center justify-center gap-2 h-[42px] border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-sky-500 hover:text-sky-600 hover:bg-sky-50 transition-colors text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  onClick={handleCancelEdit}
                  className="px-6 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCategory}
                  disabled={isUpdating}
                  className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>{isUpdating ? 'Saving...' : 'Save Category'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* LIST VIEW */}
        {editingCatIdx === null && categories.map((cat, catIdx) => (
          <div key={catIdx} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-800">{cat.categoryName}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(catIdx)}
                  className="flex items-center gap-1.5 text-sky-600 hover:bg-sky-50 px-3 py-1.5 rounded-lg transition-colors text-sm font-bold"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteCategory(catIdx)}
                  className="flex items-center gap-1.5 text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors text-sm font-bold"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>

            <div className="p-6">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Editions ({cat.awards.length})</h4>
              <div className="flex flex-wrap gap-2">
                {cat.awards.map((award, idx) => (
                  <span key={idx} className="bg-gray-100 text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg text-sm font-medium">
                    {award}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}

        {editingCatIdx === null && categories.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
            <p className="text-gray-500 font-medium mb-4">No award events added yet.</p>
            <button
              onClick={handleAddNew}
              className="inline-flex items-center space-x-2 bg-sky-600 hover:bg-sky-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Award Event</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNominationSettings;
