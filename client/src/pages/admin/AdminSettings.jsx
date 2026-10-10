import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  User,
  Mail,
  Shield,
  Key,
  UserPlus,
  ShieldCheck,
  Trash2,
  Edit3,
  Check,
  X,
  Loader2,
  Users,
  Lock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Sparkles,
  ClipboardCheck
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import {
  useGetStaffMembersQuery,
  useCreateStaffMemberMutation,
  useUpdateStaffPermissionsMutation,
  useUpdateStaffMemberMutation,
  useDeleteStaffMemberMutation
} from '../../store/apiSlice';

const PERMISSION_MODULES = [
  { key: 'dashboard', label: 'Dashboard', icon: '📊', desc: 'System statistics & analytical metrics' },
  { key: 'nominations', label: 'Nominations Database', icon: '🏆', desc: 'Access assigned nomination submissions' },
  { key: 'nominationSettings', label: 'Editions', icon: '⚙️', desc: 'Form editions, configuration' },
  { key: 'inquiries', label: 'Contact Inquiries', icon: '💬', desc: 'Client messages & general contact leads' },
  { key: 'awardCategories', label: 'Award Categories', icon: '🏷️', desc: 'Industry categories & classifications' },
  { key: 'awardEvents', label: 'Award Events', icon: '🏅', desc: 'Annual summits, editions & events' },
  { key: 'blogs', label: 'Blog & News', icon: '📝', desc: 'Article publications & press releases' },
  { key: 'gallery', label: 'Media Gallery', icon: '🖼️', desc: 'Event photo galleries & ceremony assets' },
  { key: 'settings', label: 'Admin Settings', icon: '🛠️', desc: 'General settings & staff administration' },
  { key: 'questionnaireNominations', label: 'Questionnaire Nominations', icon: '📋', desc: 'Edition questionnaire application submissions' },
];

const DEFAULT_PERMISSIONS = {
  dashboard: true,
  nominations: true,
  nominationSettings: false,
  inquiries: true,
  awardCategories: false,
  awardEvents: false,
  blogs: false,
  gallery: false,
  settings: false,
  questionnaireNominations: true,
};

export default function AdminSettings() {
  const { adminInfo } = useSelector((state) => state.auth);
  const isSuperAdmin = adminInfo?.role === 'admin' || adminInfo?.role === 'superadmin' || !adminInfo?.role;

  // Tabs: 'staff' (for superadmin) or 'profile'
  const [activeTab, setActiveTab] = useState(isSuperAdmin ? 'staff' : 'profile');

  // Staff query & mutations
  const { data: staffResponse, isLoading: staffLoading } = useGetStaffMembersQuery(undefined, {
    skip: !isSuperAdmin
  });
  const staffList = (staffResponse?.data || []).filter((s) => s.role === 'staff');

  const [createStaff, { isLoading: isCreating }] = useCreateStaffMemberMutation();
  const [updatePermissions, { isLoading: isUpdatingPerms }] = useUpdateStaffPermissionsMutation();
  const [updateStaff, { isLoading: isUpdatingStaff }] = useUpdateStaffMemberMutation();
  const [deleteStaff, { isLoading: isDeletingStaff }] = useDeleteStaffMemberMutation();

  // Create Staff Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    permissions: { ...DEFAULT_PERMISSIONS }
  });
  const [createError, setCreateError] = useState('');

  // Edit Permissions Modal State
  const [editingStaffMember, setEditingStaffMember] = useState(null);
  const [editPermissionsForm, setEditPermissionsForm] = useState({});

  // Edit Staff Details Modal State
  const [editingDetailsMember, setEditingDetailsMember] = useState(null);
  const [editDetailsForm, setEditDetailsForm] = useState({ name: '', email: '', password: '', status: 'active' });

  // Notifications
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Password Generator & Credentials Copy States
  const [copied, setCopied] = useState(false);
  const [createdStaffSuccess, setCreatedStaffSuccess] = useState(null);

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pass = '';
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  };

  const copyCredentials = (name, email, password) => {
    const origin = window.location.origin;
    const text = `TimeMedia Admin Portal - Staff Credentials:\nName: ${name || 'Staff'}\nEmail: ${email || 'N/A'}\nPassword: ${password || 'N/A'}\nLogin URL: ${origin}/admin/login`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Credentials copied to clipboard!');
    setTimeout(() => setCopied(false), 3000);
  };

  // Handle Create Staff
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateError('');

    if (!createForm.name.trim() || !createForm.email.trim() || !createForm.password.trim()) {
      setCreateError('Please complete all required fields.');
      return;
    }

    if (createForm.password.length < 6) {
      setCreateError('Password must be at least 6 characters long.');
      return;
    }

    try {
      await createStaff(createForm).unwrap();
      setCreatedStaffSuccess({
        name: createForm.name,
        email: createForm.email,
        password: createForm.password,
      });
      showToast('Staff member created successfully!');
    } catch (err) {
      setCreateError(err?.data?.message || 'Failed to create staff member.');
    }
  };

  // Open Edit Permissions Modal
  const handleOpenEditPerms = (staff) => {
    setEditingStaffMember(staff);
    setEditPermissionsForm({ ...(staff.permissions || {}) });
  };

  // Save Permissions
  const handleSavePermissions = async () => {
    if (!editingStaffMember) return;
    try {
      await updatePermissions({
        id: editingStaffMember._id,
        permissions: editPermissionsForm
      }).unwrap();
      setEditingStaffMember(null);
      showToast(`Permissions updated for ${editingStaffMember.name}.`);
    } catch (err) {
      alert(err?.data?.message || 'Failed to update permissions.');
    }
  };

  // Open Edit Details Modal
  const handleOpenEditDetails = (staff) => {
    setEditingDetailsMember(staff);
    setEditDetailsForm({
      name: staff.name,
      email: staff.email,
      password: '',
      status: staff.status || 'active'
    });
  };

  // Save Staff Details
  const handleSaveDetails = async (e) => {
    e.preventDefault();
    if (!editingDetailsMember) return;

    try {
      const payload = {
        id: editingDetailsMember._id,
        name: editDetailsForm.name,
        email: editDetailsForm.email,
        status: editDetailsForm.status,
      };
      if (editDetailsForm.password.trim()) {
        payload.password = editDetailsForm.password.trim();
      }

      await updateStaff(payload).unwrap();
      setEditingDetailsMember(null);
      showToast(`Account updated for ${editDetailsForm.name}.`);
    } catch (err) {
      alert(err?.data?.message || 'Failed to update staff member.');
    }
  };

  // Delete Staff
  const handleDeleteStaff = async (staff) => {
    if (!window.confirm(`Are you sure you want to remove ${staff.name}? This staff member will no longer be able to log in.`)) {
      return;
    }
    try {
      await deleteStaff(staff._id).unwrap();
      showToast(`Staff member removed.`);
    } catch (err) {
      alert(err?.data?.message || 'Failed to delete staff member.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <Helmet>
        <title>Settings & Team RBAC | Admin Portal</title>
      </Helmet>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-sm font-bold animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Admin Settings & Access Control</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">
            Manage your profile, team members, and tab permission matrix.
          </p>
        </div>

        {isSuperAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-bold shadow-md shadow-sky-600/20 transition-all hover:-translate-y-0.5 cursor-pointer"
          >
            <UserPlus size={18} />
            <span>Create New Staff</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        {isSuperAdmin && (
          <button
            onClick={() => setActiveTab('staff')}
            className={`pb-3 px-4 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${activeTab === 'staff'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
          >
            <Users size={16} />
            <span>Team Staff & Tab Permissions</span>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-black">
              {staffList.length}
            </span>
          </button>
        )}
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-4 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${activeTab === 'profile'
            ? 'border-sky-600 text-sky-600'
            : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
        >
          <User size={16} />
          <span>Profile & Security</span>
        </button>
      </div>

      {/* TAB 1: STAFF & PERMISSIONS MATRIX */}
      {activeTab === 'staff' && isSuperAdmin && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-black">
                <Users size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Staff Members</p>
                <p className="text-2xl font-black text-slate-900 mt-0.5">{staffList.length}</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Staff</p>
                <p className="text-2xl font-black text-slate-900 mt-0.5">
                  {staffList.filter(s => s.status === 'active').length}
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Admin Role</p>
                <p className="text-base font-black text-slate-900 mt-0.5">Super Administrator</p>
              </div>
            </div>
          </div>

          {/* Staff Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-black text-slate-800 text-lg">Staff Accounts & Tab Permissions</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Control which tabs and nominations team members can access. Unticked tabs are hidden and blocked.
                </p>
              </div>
            </div>

            {staffLoading ? (
              <div className="py-16 text-center">
                <Loader2 size={32} className="animate-spin text-sky-500 mx-auto" />
                <p className="text-slate-400 font-bold text-xs mt-3">Loading staff members...</p>
              </div>
            ) : staffList.length === 0 ? (
              <div className="py-16 text-center px-4">
                <Users size={40} className="text-slate-300 mx-auto mb-3" />
                <h4 className="font-bold text-slate-700 text-base">No staff members created yet</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Click the button below to add team members with custom tab access and nomination assignment privileges.
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  + Add First Staff Member
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-600">
                      <th className="py-3.5 px-5">Staff Member</th>
                      <th className="py-3.5 px-5">Email Address</th>
                      <th className="py-3.5 px-5">Status</th>
                      <th className="py-3.5 px-5">Permitted Tabs (Access Matrix)</th>
                      <th className="py-3.5 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm font-medium">
                    {staffList.map((staff) => {
                      const enabledTabs = PERMISSION_MODULES.filter(
                        (m) => staff.permissions?.[m.key] === true
                      );
                      const isStaffActive = staff.status === 'active';

                      return (
                        <tr key={staff._id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-4 px-5 align-top">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-sm flex-shrink-0">
                                {staff.name?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 leading-snug">{staff.name}</div>
                                <span className="inline-block mt-0.5 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                                  {staff.role}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-5 align-top">
                            <div className="flex items-center gap-1.5 text-slate-600 pt-1">
                              <Mail size={14} className="text-slate-400" />
                              <span className="text-xs font-semibold">{staff.email}</span>
                            </div>
                          </td>

                          <td className="py-4 px-5 align-top">
                            <div className="pt-1">
                              <span
                                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${isStaffActive
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-red-50 text-red-600 border border-red-200'
                                  }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${isStaffActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                {staff.status}
                              </span>
                            </div>
                          </td>

                          <td className="py-4 px-5 align-top">
                            <div className="space-y-1.5 max-w-md">
                              <div className="text-[11px] font-bold text-slate-500">
                                {enabledTabs.length} of {PERMISSION_MODULES.length} tabs accessible
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {enabledTabs.map((m) => (
                                  <span
                                    key={m.key}
                                    className="inline-flex items-center gap-1 text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-100 px-2 py-0.5 rounded-md"
                                  >
                                    <span>{m.icon}</span>
                                    <span>{m.label}</span>
                                  </span>
                                ))}
                                {enabledTabs.length === 0 && (
                                  <span className="text-xs font-semibold text-red-500 italic">
                                    No tabs permitted (Account restricted)
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-5 align-top text-right">
                            <div className="flex items-center justify-end gap-1.5 pt-1">
                              <button
                                onClick={() => handleOpenEditPerms(staff)}
                                className="px-2.5 py-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors border border-sky-200 shadow-sm cursor-pointer"
                                title="Edit Tab Permissions"
                              >
                                <ShieldCheck size={14} />
                                <span>Tabs Matrix</span>
                              </button>

                              <button
                                onClick={() => handleOpenEditDetails(staff)}
                                className="p-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 cursor-pointer"
                                title="Edit Profile Details"
                              >
                                <Edit3 size={15} />
                              </button>

                              <button
                                onClick={() => handleDeleteStaff(staff)}
                                className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors border border-red-200 cursor-pointer"
                                title="Delete Staff Account"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PROFILE & SECURITY */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <User className="w-5 h-5 text-sky-600" />
              Profile Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
                <div className="flex items-center p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <User className="w-4 h-4 text-slate-400 mr-3" />
                  <span className="text-slate-800 font-bold text-sm">{adminInfo?.name || 'Administrator'}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email Address</label>
                <div className="flex items-center p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <Mail className="w-4 h-4 text-slate-400 mr-3" />
                  <span className="text-slate-800 font-bold text-sm">{adminInfo?.email || 'admin@example.com'}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Access Role</label>
                <div className="flex items-center p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <Shield className="w-4 h-4 text-slate-400 mr-3" />
                  <span className="text-slate-800 font-bold text-sm">
                    {isSuperAdmin ? 'Super Administrator (Full Rights)' : 'Staff Member (Scoped RBAC)'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Security & Access Overview */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Key className="w-5 h-5 text-sky-600" />
              Security & Permissions Summary
            </h2>
            <div className="p-4 bg-sky-50 rounded-xl border border-sky-100 text-sky-900 text-xs leading-relaxed font-medium">
              {isSuperAdmin ? (
                <>
                  <p className="font-bold mb-1">👑 Super Administrator Privileges:</p>
                  As a Super Administrator, you retain unrestricted read, write, and assignment rights across all modules, including full nomination database access and staff creation.
                </>
              ) : (
                <>
                  <p className="font-bold mb-1">🛡️ Scoped Staff Privileges:</p>
                  Your account has scoped modular access. You only see nominations assigned to your profile, and can only access the tabs enabled for you by the Super Administrator.
                </>
              )}
            </div>

            <div className="pt-2">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Enabled Modules:</h4>
              <div className="flex flex-wrap gap-1.5">
                {PERMISSION_MODULES.map((m) => {
                  const hasAccess = isSuperAdmin || adminInfo?.permissions?.[m.key] === true;
                  return (
                    <span
                      key={m.key}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${hasAccess
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-slate-100 text-slate-400 border-slate-200 opacity-60'
                        }`}
                    >
                      {hasAccess ? <Check size={12} className="text-emerald-600" /> : <X size={12} className="text-slate-400" />}
                      <span>{m.label}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE NEW STAFF MEMBER */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto p-4 sm:p-6 flex justify-center items-start">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-6 sm:my-10 animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer z-10"
              title="Close Modal"
            >
              <X size={18} />
            </button>

            <div className="mb-6 pr-12 pt-1">
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="p-2 bg-sky-50 text-sky-600 rounded-xl"><UserPlus size={20} /></span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Create New Staff Member</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Add a new team member with their login credentials and select the exact tabs they are permitted to access.
              </p>
            </div>

            {createdStaffSuccess ? (
              <div className="space-y-6">
                <div className="text-center py-3">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-emerald-100 shadow-sm">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">Staff Account Created!</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    The team member account is ready. Copy their credentials below to send them via WhatsApp or email.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 font-mono text-sm">
                  <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                    <span className="text-slate-500 text-xs font-sans font-bold">Staff Name:</span>
                    <span className="font-bold text-slate-900">{createdStaffSuccess.name}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                    <span className="text-slate-500 text-xs font-sans font-bold">Email Address:</span>
                    <span className="font-bold text-slate-900">{createdStaffSuccess.email}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                    <span className="text-slate-500 text-xs font-sans font-bold">Password:</span>
                    <span className="font-black text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded border border-sky-100 tracking-wider">
                      {createdStaffSuccess.password}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500 text-xs font-sans font-bold">Portal URL:</span>
                    <span className="text-xs text-slate-700">{window.location.origin}/admin/login</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => copyCredentials(createdStaffSuccess.name, createdStaffSuccess.email, createdStaffSuccess.password)}
                    className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${copied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-600/20'
                      }`}
                  >
                    {copied ? <ClipboardCheck size={16} /> : <Copy size={16} />}
                    <span>{copied ? 'Copied to Clipboard!' : 'Copy All Credentials'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCreatedStaffSuccess(null);
                      setShowCreateModal(false);
                      setCreateForm({
                        name: '',
                        email: '',
                        password: '',
                        permissions: { ...DEFAULT_PERMISSIONS }
                      });
                    }}
                    className="py-3 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Done & Close
                  </button>
                </div>
              </div>
            ) : (
              <>
                {createError && (
                  <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold flex items-center gap-2">
                    <AlertCircle size={16} />
                    <span>{createError}</span>
                  </div>
                )}

                <form onSubmit={handleCreateSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Aditya"
                        value={createForm.name}
                        onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Email Address *</label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. ad@primetime.in"
                        value={createForm.email}
                        onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Password (Fully Visible) *
                      </label>
                      <button
                        type="button"
                        onClick={() => setCreateForm({ ...createForm, password: generatePassword() })}
                        className="text-[11px] font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <Sparkles size={13} />
                        <span>Generate Password</span>
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="Type password or click Generate..."
                        value={createForm.password}
                        onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-sm font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all pl-10 pr-24"
                      />
                      <Key size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Visible
                      </span>
                    </div>
                  </div>

                  {/* Credentials Preview & Instant Copy Button */}
                  <div className="bg-sky-50/70 border border-sky-100 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-xs">
                      <span className="font-bold text-sky-900 block">Credentials Preview:</span>
                      <span className="text-slate-600 font-mono text-[11px] truncate max-w-xs block">
                        {createForm.email || 'email@example.com'} • {createForm.password || 'password'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyCredentials(createForm.name, createForm.email, createForm.password)}
                      disabled={!createForm.email && !createForm.password}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer ${copied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white hover:bg-sky-100 text-sky-700 border border-sky-200'
                        } disabled:opacity-40 disabled:cursor-not-allowed`}
                    >
                      {copied ? <ClipboardCheck size={14} /> : <Copy size={14} />}
                      <span>{copied ? 'Copied!' : 'Copy Credentials'}</span>
                    </button>
                  </div>

                  {/* TAB PERMISSION MATRIX SELECTION */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                          Modular Tab Access Permissions
                        </h4>
                        <p className="text-[11px] text-slate-500">Tick the modules this staff member is allowed to see.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const allTrue = {};
                            PERMISSION_MODULES.forEach(m => { allTrue[m.key] = true; });
                            setCreateForm({ ...createForm, permissions: allTrue });
                          }}
                          className="text-[11px] font-bold text-sky-600 hover:text-sky-800 px-2 py-1 rounded bg-sky-50"
                        >
                          Select All
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const allFalse = {};
                            PERMISSION_MODULES.forEach(m => { allFalse[m.key] = false; });
                            setCreateForm({ ...createForm, permissions: allFalse });
                          }}
                          className="text-[11px] font-bold text-slate-500 hover:text-slate-700 px-2 py-1 rounded bg-slate-100"
                        >
                          Clear All
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto p-1 custom-scrollbar">
                      {PERMISSION_MODULES.map((m) => {
                        const isChecked = !!createForm.permissions[m.key];
                        return (
                          <label
                            key={m.key}
                            className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all select-none ${isChecked
                              ? 'bg-sky-50/80 border-sky-300 ring-1 ring-sky-200'
                              : 'bg-white border-slate-200 hover:bg-slate-50'
                              }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) =>
                                setCreateForm({
                                  ...createForm,
                                  permissions: {
                                    ...createForm.permissions,
                                    [m.key]: e.target.checked
                                  }
                                })
                              }
                              className="mt-0.5 rounded text-sky-600 focus:ring-sky-500 w-4 h-4"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-800 leading-snug flex items-center gap-1">
                                <span>{m.icon}</span>
                                <span>{m.label}</span>
                              </p>
                              <p className="text-[10px] text-slate-500 truncate mt-0.5">{m.desc}</p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isCreating}
                      className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {isCreating && <Loader2 size={14} className="animate-spin" />}
                      <span>Save & Create Staff</span>
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* MODAL: EDIT TAB PERMISSIONS MATRIX */}
      {editingStaffMember && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto p-4 sm:p-6 flex justify-center items-start">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-6 sm:my-10 animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setEditingStaffMember(null)}
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer z-10"
              title="Close Modal"
            >
              <X size={18} />
            </button>

            <div className="mb-6 pr-12 pt-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1.5 bg-sky-50 text-sky-600 rounded-lg"><ShieldCheck size={18} /></span>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Edit Tab Permissions Matrix</h3>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Editing permissions for <span className="font-bold text-slate-800">{editingStaffMember.name}</span> ({editingStaffMember.email})
              </p>
            </div>

            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-600">Available Modules:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const allTrue = {};
                    PERMISSION_MODULES.forEach(m => { allTrue[m.key] = true; });
                    setEditPermissionsForm(allTrue);
                  }}
                  className="text-[11px] font-bold text-sky-600 hover:text-sky-800 px-2 py-1 rounded bg-sky-50"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const allFalse = {};
                    PERMISSION_MODULES.forEach(m => { allFalse[m.key] = false; });
                    setEditPermissionsForm(allFalse);
                  }}
                  className="text-[11px] font-bold text-slate-500 hover:text-slate-700 px-2 py-1 rounded bg-slate-100"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto p-1 custom-scrollbar">
              {PERMISSION_MODULES.map((m) => {
                const isChecked = !!editPermissionsForm[m.key];
                return (
                  <label
                    key={m.key}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all select-none ${isChecked
                      ? 'bg-sky-50/80 border-sky-300 ring-1 ring-sky-200'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) =>
                        setEditPermissionsForm({
                          ...editPermissionsForm,
                          [m.key]: e.target.checked
                        })
                      }
                      className="mt-0.5 rounded text-sky-600 focus:ring-sky-500 w-4 h-4"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 leading-snug flex items-center gap-1.5">
                        <span>{m.icon}</span>
                        <span>{m.label}</span>
                      </p>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">{m.desc}</p>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingStaffMember(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePermissions}
                disabled={isUpdatingPerms}
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isUpdatingPerms && <Loader2 size={14} className="animate-spin" />}
                <span>Save Permissions Matrix</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT STAFF PROFILE DETAILS */}
      {editingDetailsMember && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto p-4 sm:p-6 flex justify-center items-start">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 sm:p-8 shadow-2xl relative my-6 sm:my-10 animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setEditingDetailsMember(null)}
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer z-10"
              title="Close Modal"
            >
              <X size={18} />
            </button>

            <div className="mb-6 pr-12 pt-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1.5 bg-slate-100 text-slate-700 rounded-lg"><Edit3 size={18} /></span>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Edit Staff Account</h3>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Update account name, email address, password or active status.
              </p>
            </div>

            <form onSubmit={handleSaveDetails} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Name</label>
                <input
                  type="text"
                  required
                  value={editDetailsForm.name}
                  onChange={(e) => setEditDetailsForm({ ...editDetailsForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  value={editDetailsForm.email}
                  onChange={(e) => setEditDetailsForm({ ...editDetailsForm, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Reset Password (Fully Visible - Leave blank to keep current)
                  </label>
                  <button
                    type="button"
                    onClick={() => setEditDetailsForm({ ...editDetailsForm, password: generatePassword() })}
                    className="text-[11px] font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Sparkles size={12} />
                    <span>Generate</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Type new password or generate..."
                    value={editDetailsForm.password}
                    onChange={(e) => setEditDetailsForm({ ...editDetailsForm, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-sm font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 pl-10 pr-24"
                  />
                  <Key size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Visible
                  </span>
                </div>
                {editDetailsForm.password && (
                  <div className="mt-2 flex items-center justify-between bg-sky-50 p-2.5 rounded-xl border border-sky-100">
                    <span className="text-[11px] font-mono text-sky-900 font-semibold truncate">
                      {editDetailsForm.email} : {editDetailsForm.password}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyCredentials(editDetailsForm.name, editDetailsForm.email, editDetailsForm.password)}
                      className="px-2.5 py-1 bg-white hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Copy size={12} />
                      <span>Copy</span>
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Account Status</label>
                <select
                  value={editDetailsForm.status}
                  onChange={(e) => setEditDetailsForm({ ...editDetailsForm, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                >
                  <option value="active">Active (Can log in & receive nominations)</option>
                  <option value="inactive">Inactive (Access disabled)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingDetailsMember(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingStaff}
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isUpdatingStaff && <Loader2 size={14} className="animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
