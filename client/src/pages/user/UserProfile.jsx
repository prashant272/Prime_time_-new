import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import {
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useGetMyNominationsQuery,
  useUserLogoutMutation,
} from '../../store/apiSlice';
import { setUserCredentials, userLogout } from '../../store/authSlice';
import {
  User,
  Building,
  Briefcase,
  Phone,
  Mail,
  Lock,
  Trophy,
  Calendar,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  LogOut,
  ChevronRight,
  Sparkles,
  Layers,
  Clock,
  ShieldCheck,
  Search,
  Filter,
  Eye,
  EyeOff,
  ArrowUpRight,
  TrendingUp,
  Award,
} from 'lucide-react';

const STATUS_BADGES = {
  'NOMINATION RECEIVED': {
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
    label: 'Received',
  },
  'UNDER EVALUATION': {
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
    label: 'Under Evaluation',
  },
  'IN PROGRESS (SHORTLISTED)': {
    bg: 'bg-purple-50 text-purple-700 border-purple-200',
    dot: 'bg-purple-500',
    label: 'Shortlisted',
  },
  'SELECTED (WINNER)': {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm shadow-emerald-500/10 font-black',
    dot: 'bg-emerald-500',
    label: 'Selected (Winner)',
  },
  'REJECTED': {
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
    label: 'Not Selected',
  },
};

const FILTER_OPTIONS = [
  { value: 'ALL', label: 'All Submissions' },
  { value: 'NOMINATION RECEIVED', label: 'Received' },
  { value: 'UNDER EVALUATION', label: 'Under Evaluation' },
  { value: 'IN PROGRESS (SHORTLISTED)', label: 'Shortlisted' },
  { value: 'SELECTED (WINNER)', label: 'Winner' },
];

export default function UserProfile() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTabParam = searchParams.get('tab');
  const validTabs = ['nominations', 'profile', 'security'];
  const initialTab = validTabs.includes(currentTabParam) ? currentTabParam : 'nominations';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Password visibility toggles
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  // Queries & Mutations
  const { data: profileRes, isLoading: isProfileLoading, refetch: refetchProfile } = useGetUserProfileQuery();
  const { data: nominationsRes, isLoading: isNomsLoading, refetch: refetchNoms } = useGetMyNominationsQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateUserProfileMutation();
  const [logoutApi] = useUserLogoutMutation();

  const user = profileRes?.data || userInfo;
  const nominations = nominationsRes?.data || [];

  // Profile Edit Form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfileForm,
    formState: { errors: profileErrors },
  } = useForm();

  // Security Form
  const {
    register: registerSecurity,
    handleSubmit: handleSecuritySubmit,
    reset: resetSecurityForm,
    watch: watchSecurity,
    formState: { errors: securityErrors },
  } = useForm();

  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrorMsg, setProfileErrorMsg] = useState('');
  const [securitySuccessMsg, setSecuritySuccessMsg] = useState('');
  const [securityErrorMsg, setSecurityErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      resetProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        organization: user.organization || '',
        designation: user.designation || '',
      });
    }
  }, [user, resetProfileForm]);

  // Sync tab with URL param changes
  useEffect(() => {
    if (currentTabParam && validTabs.includes(currentTabParam) && currentTabParam !== activeTab) {
      setActiveTab(currentTabParam);
    }
  }, [currentTabParam]);

  const onTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch (e) {
      // ignore
    }
    dispatch(userLogout());
    navigate('/');
  };

  // Submit Profile Changes
  const onUpdateProfile = async (formData) => {
    setProfileSuccessMsg('');
    setProfileErrorMsg('');
    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        organization: formData.organization,
        designation: formData.designation,
      };

      const res = await updateProfile(payload).unwrap();
      dispatch(setUserCredentials(res.data));
      setProfileSuccessMsg('Personal and organization profile updated successfully!');
      setTimeout(() => setProfileSuccessMsg(''), 4500);
      refetchProfile();
    } catch (err) {
      setProfileErrorMsg(err.data?.message || 'Failed to update profile');
    }
  };

  // Submit Security / Password Changes
  const onUpdateSecurity = async (formData) => {
    setSecuritySuccessMsg('');
    setSecurityErrorMsg('');
    try {
      const payload = {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      };

      const res = await updateProfile(payload).unwrap();
      dispatch(setUserCredentials(res.data));
      setSecuritySuccessMsg('Your password has been changed successfully!');
      resetSecurityForm();
      setTimeout(() => setSecuritySuccessMsg(''), 4500);
    } catch (err) {
      setSecurityErrorMsg(err.data?.message || 'Failed to update password');
    }
  };

  // Metrics
  const totalCount = nominations.length;
  const inReviewCount = nominations.filter(
    (n) => n.status === 'UNDER EVALUATION' || n.status === 'NOMINATION RECEIVED'
  ).length;
  const shortlistedCount = nominations.filter(
    (n) => n.status === 'IN PROGRESS (SHORTLISTED)'
  ).length;
  const winnerCount = nominations.filter(
    (n) => n.status === 'SELECTED (WINNER)'
  ).length;

  // Filter nominations
  const filteredNominations = nominations.filter((nom) => {
    const matchesStatus = statusFilter === 'ALL' || nom.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      nom.awardName?.toLowerCase().includes(q) ||
      nom.nomineeName?.toLowerCase().includes(q) ||
      nom.organizationName?.toLowerCase().includes(q) ||
      nom.categoryPath?.some((c) => c.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50/80 pb-28">
      <Helmet>
        <title>User Executive Portal & Nominations | TimeMedia</title>
      </Helmet>

      {/* Hero Executive Header */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 text-white pt-24 pb-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#15b7b9]/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* User Identity Info */}
            <div className="flex items-start sm:items-center gap-4 sm:gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#15b7b9] to-sky-400 p-0.5 shadow-xl flex-shrink-0">
                <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center text-white text-2xl sm:text-3xl font-black uppercase">
                  {user?.name ? user.name.charAt(0) : 'U'}
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-3xl font-black text-white font-display">
                    {user?.name || 'Nominee Account'}
                  </h1>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <ShieldCheck size={12} /> Verified Nominee
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-200 text-xs sm:text-sm mt-1.5 font-semibold">
                  <span className="flex items-center gap-1.5 text-slate-100">
                    <Mail size={13} className="text-[#15b7b9]" />
                    {user?.email}
                  </span>
                  {user?.phone && (
                    <span className="flex items-center gap-1.5 text-slate-100">
                      <Phone size={13} className="text-[#15b7b9]" />
                      {user.phone}
                    </span>
                  )}
                  {user?.organization && (
                    <span className="flex items-center gap-1.5 text-slate-100">
                      <Building size={13} className="text-[#15b7b9]" />
                      {user.organization}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <Link
                to="/nomination"
                className="flex-1 sm:flex-initial text-center px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#15b7b9] to-sky-600 hover:from-[#119ea0] hover:to-sky-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#15b7b9]/25 hover:shadow-xl transition-all flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Sparkles size={15} />
                <span>Submit Nomination</span>
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider border border-white/15 transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                title="Log Out"
              >
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-white/10">
            <div className="bg-white/10 border border-white/15 rounded-2xl p-3 sm:p-3.5 backdrop-blur-xs min-w-0">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-0.5 truncate">
                Total Submissions
              </span>
              <span className="text-lg sm:text-2xl font-black text-white">{totalCount}</span>
            </div>

            <div className="bg-white/10 border border-white/15 rounded-2xl p-3 sm:p-3.5 backdrop-blur-xs min-w-0">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-amber-300 block mb-0.5 truncate">
                Under Review
              </span>
              <span className="text-lg sm:text-2xl font-black text-amber-300">{inReviewCount}</span>
            </div>

            <div className="bg-white/10 border border-white/15 rounded-2xl p-3 sm:p-3.5 backdrop-blur-xs min-w-0">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-purple-300 block mb-0.5 truncate">
                Shortlisted
              </span>
              <span className="text-lg sm:text-2xl font-black text-purple-300">{shortlistedCount}</span>
            </div>

            <div className="bg-white/10 border border-white/15 rounded-2xl p-3 sm:p-3.5 backdrop-blur-xs min-w-0">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-300 block mb-0.5 truncate">
                Awards Won
              </span>
              <span className="text-lg sm:text-2xl font-black text-emerald-300">{winnerCount}</span>
            </div>
          </div>

          {/* Tab Navigation Controls (Mobile Scrollable) */}
          <div className="flex gap-2 mt-6 sm:mt-8 border-b border-slate-800 overflow-x-auto pb-px">
            <button
              onClick={() => onTabChange('nominations')}
              className={`pb-3.5 px-3 sm:px-4 font-bold text-xs sm:text-sm tracking-wide transition-all border-b-2 flex items-center gap-2 cursor-pointer flex-shrink-0 whitespace-nowrap ${
                activeTab === 'nominations'
                  ? 'border-[#15b7b9] text-[#15b7b9]'
                  : 'border-transparent text-slate-300 hover:text-white'
              }`}
            >
              <Trophy size={16} />
              <span>My Nominations</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-black ${
                  activeTab === 'nominations'
                    ? 'bg-[#15b7b9]/20 text-[#15b7b9]'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                {nominations.length}
              </span>
            </button>

            <button
              onClick={() => onTabChange('profile')}
              className={`pb-3.5 px-3 sm:px-4 font-bold text-xs sm:text-sm tracking-wide transition-all border-b-2 flex items-center gap-2 cursor-pointer flex-shrink-0 whitespace-nowrap ${
                activeTab === 'profile'
                  ? 'border-[#15b7b9] text-[#15b7b9]'
                  : 'border-transparent text-slate-300 hover:text-white'
              }`}
            >
              <User size={16} />
              <span>Profile Information</span>
            </button>

            <button
              onClick={() => onTabChange('security')}
              className={`pb-3.5 px-3 sm:px-4 font-bold text-xs sm:text-sm tracking-wide transition-all border-b-2 flex items-center gap-2 cursor-pointer flex-shrink-0 whitespace-nowrap ${
                activeTab === 'security'
                  ? 'border-[#15b7b9] text-[#15b7b9]'
                  : 'border-transparent text-slate-300 hover:text-white'
              }`}
            >
              <Lock size={16} />
              <span>Account Security</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-3 relative z-20">

        {/* TAB 1: MY NOMINATIONS */}
        {activeTab === 'nominations' && (
          <div className="space-y-6">

            {/* Filter & Search Bar */}
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Search input */}
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search by award title, nominee, organization, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#15b7b9] focus:outline-none focus:ring-3 focus:ring-[#15b7b9]/15 text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-500 transition-all"
                />
              </div>

              {/* Status filter pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {FILTER_OPTIONS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setStatusFilter(f.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      statusFilter === f.value
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Nominations List */}
            {isNomsLoading ? (
              <div className="bg-white rounded-3xl p-12 text-center shadow-xs border border-slate-200">
                <Loader2 size={32} className="animate-spin text-[#15b7b9] mx-auto mb-3" />
                <p className="text-slate-700 font-bold text-sm">Fetching your official nomination records...</p>
              </div>
            ) : filteredNominations.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 sm:p-16 text-center shadow-xs border border-slate-200 max-w-2xl mx-auto mt-4">
                <div className="w-20 h-20 rounded-full bg-sky-50 border border-sky-100 flex items-center justify-center text-[#15b7b9] mx-auto mb-5">
                  <Trophy size={36} />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-950 mb-2">
                  {nominations.length === 0 ? 'No Nominations Found' : 'No Matching Nominations'}
                </h3>
                <p className="text-slate-600 text-sm max-w-md mx-auto mb-8 leading-relaxed font-medium">
                  {nominations.length === 0
                    ? 'You have not submitted any nominations yet. Submit an award entry for your brand, company, or individual achievements to be evaluated by the jury.'
                    : 'No nominations matched your current search and filter criteria. Try adjusting your search query.'}
                </p>
                {nominations.length === 0 ? (
                  <Link
                    to="/nomination"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#15b7b9] to-sky-600 hover:from-[#119ea0] hover:to-sky-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-[#15b7b9]/25 hover:shadow-xl transition-all"
                  >
                    <Sparkles size={18} /> Submit a Nomination
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('ALL');
                    }}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs uppercase tracking-wider"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredNominations.map((nom) => {
                  const statusInfo = STATUS_BADGES[nom.status] || {
                    bg: 'bg-slate-100 text-slate-800 border-slate-300',
                    dot: 'bg-slate-500',
                    label: nom.status || 'Received',
                  };

                  const refCode = `TM-NOM-${nom._id.slice(-8).toUpperCase()}`;

                  return (
                    <div
                      key={nom._id}
                      className="bg-white rounded-3xl p-5 sm:p-7 shadow-xs border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-5 group min-w-0"
                    >
                      <div className="flex-1 min-w-0">
                        {/* Top Meta Badges */}
                        <div className="flex flex-wrap items-center gap-2 mb-2.5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.bg}`}
                          >
                            <span className={`w-2 h-2 rounded-full ${statusInfo.dot} animate-pulse`}></span>
                            {statusInfo.label}
                          </span>

                          <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-md">
                            {refCode}
                          </span>

                          {nom.isQuestionnaire && (
                            <span className="text-xs font-bold text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-300 flex items-center gap-1 shadow-2xs">
                              <Sparkles size={11} className="text-amber-600" />
                              Questionnaire Edition
                            </span>
                          )}

                          {!nom.isQuestionnaire && nom.edition && nom.edition.length > 0 && (
                            <span className="text-xs font-bold text-sky-900 bg-sky-50 px-2.5 py-0.5 rounded-md border border-sky-200">
                              {nom.edition.join(', ')}
                            </span>
                          )}

                          <span className="text-xs text-slate-500 font-semibold flex items-center gap-1 ml-auto md:ml-0">
                            <Clock size={13} />
                            {new Date(nom.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>

                        {/* Award Name Title */}
                        <Link
                          to={`/my-nominations/${nom._id}`}
                          className="text-base sm:text-xl font-black text-slate-950 group-hover:text-[#15b7b9] transition-colors block break-words"
                        >
                          {nom.awardName}
                        </Link>

                        {/* Details row */}
                        <div className="mt-3 flex flex-wrap items-center gap-y-2 gap-x-5 text-xs font-medium min-w-0">
                          <div className="min-w-0">
                            <span className="text-slate-600 font-extrabold uppercase text-[10px] tracking-wider block">Nominee</span>
                            <span className="font-black text-slate-950 text-sm break-words block">{nom.nomineeName}</span>
                          </div>

                          {nom.organizationName && (
                            <div className="min-w-0">
                              <span className="text-slate-600 font-extrabold uppercase text-[10px] tracking-wider block">Organization</span>
                              <span className="font-black text-slate-950 text-sm break-words block">{nom.organizationName}</span>
                            </div>
                          )}

                          {nom.categoryPath && nom.categoryPath.length > 0 && (
                            <div className="max-w-full min-w-0">
                              <span className="text-slate-600 font-extrabold uppercase text-[10px] tracking-wider block">Category Tree</span>
                              <span className="font-bold text-slate-800 break-words block">
                                {nom.categoryPath.join(' › ')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Full Page View CTA */}
                      <div className="flex items-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 flex-shrink-0 w-full md:w-auto">
                        <Link
                          to={`/my-nominations/${nom._id}`}
                          className="w-full md:w-auto px-6 py-3 rounded-2xl bg-slate-900 hover:bg-[#15b7b9] text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 group-hover:shadow-md cursor-pointer whitespace-nowrap"
                        >
                          <span>View Full Application</span>
                          <ArrowUpRight size={16} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PROFILE INFORMATION */}
        {activeTab === 'profile' && (
          <div className="max-w-3xl mx-auto mt-4">
            <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xs border border-slate-200/80">
              <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#15b7b9] flex items-center justify-center font-bold">
                  <User size={20} />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900">Personal & Organization Profile</h2>
                  <p className="text-slate-500 text-xs sm:text-sm">These details auto-fill in future nomination submissions</p>
                </div>
              </div>

              {profileSuccessMsg && (
                <div className="mb-6 p-4 bg-emerald-50 text-emerald-800 rounded-2xl text-xs sm:text-sm font-bold border border-emerald-200 flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
                  <span>{profileSuccessMsg}</span>
                </div>
              )}

              {profileErrorMsg && (
                <div className="mb-6 p-4 bg-rose-50 text-rose-700 rounded-2xl text-xs sm:text-sm font-bold border border-rose-200 flex items-center gap-2">
                  <AlertCircle size={18} className="text-rose-600 flex-shrink-0" />
                  <span>{profileErrorMsg}</span>
                </div>
              )}

              <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#15b7b9] focus:outline-none focus:ring-3 focus:ring-[#15b7b9]/15 text-slate-800 font-medium text-sm transition-all"
                      {...registerProfile('name', { required: 'Name is required' })}
                    />
                    {profileErrors.name && (
                      <span className="text-rose-500 text-xs font-semibold mt-1 block">
                        {profileErrors.name.message}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Mobile / Phone Number
                    </label>
                    <input
                      type="tel"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#15b7b9] focus:outline-none focus:ring-3 focus:ring-[#15b7b9]/15 text-slate-800 font-medium text-sm transition-all"
                      {...registerProfile('phone')}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Email Address (Account Identifier)
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-medium text-sm cursor-not-allowed"
                  />
                  <span className="text-slate-600 font-medium text-xs mt-1 block">
                    Your email address is your primary account key and cannot be changed directly.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                      Organization / Brand Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#15b7b9] focus:outline-none focus:ring-3 focus:ring-[#15b7b9]/15 text-slate-900 font-semibold text-sm transition-all"
                      {...registerProfile('organization')}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                      Designation / Role
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#15b7b9] focus:outline-none focus:ring-3 focus:ring-[#15b7b9]/15 text-slate-900 font-semibold text-sm transition-all"
                      {...registerProfile('designation')}
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#15b7b9] to-sky-600 hover:from-[#119ea0] hover:to-sky-500 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-[#15b7b9]/25 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="animate-spin h-4 w-4" />
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <span>Save Profile Details</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 3: ACCOUNT SECURITY */}
        {activeTab === 'security' && (
          <div className="max-w-2xl mx-auto mt-4">
            <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xs border border-slate-200">
              <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                  <Lock size={20} />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-950">Account Security & Credentials</h2>
                  <p className="text-slate-600 text-xs sm:text-sm font-medium">Manage your password to keep your nominations secure</p>
                </div>
              </div>

              {securitySuccessMsg && (
                <div className="mb-6 p-4 bg-emerald-50 text-emerald-800 rounded-2xl text-xs sm:text-sm font-bold border border-emerald-200 flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
                  <span>{securitySuccessMsg}</span>
                </div>
              )}

              {securityErrorMsg && (
                <div className="mb-6 p-4 bg-rose-50 text-rose-700 rounded-2xl text-xs sm:text-sm font-bold border border-rose-200 flex items-center gap-2">
                  <AlertCircle size={18} className="text-rose-600 flex-shrink-0" />
                  <span>{securityErrorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSecuritySubmit(onUpdateSecurity)} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                    Current Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      placeholder="Enter your current password"
                      className="w-full pl-4 pr-11 py-3 rounded-xl border border-slate-300 focus:border-[#15b7b9] focus:outline-none focus:ring-3 focus:ring-[#15b7b9]/15 text-slate-900 font-semibold text-sm transition-all"
                      {...registerSecurity('currentPassword', { required: 'Current password is required' })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 cursor-pointer"
                    >
                      {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {securityErrors.currentPassword && (
                    <span className="text-rose-600 text-xs font-bold mt-1 block">
                      {securityErrors.currentPassword.message}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                    New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-4 pr-11 py-3 rounded-xl border border-slate-300 focus:border-[#15b7b9] focus:outline-none focus:ring-3 focus:ring-[#15b7b9]/15 text-slate-900 font-semibold text-sm transition-all"
                      {...registerSecurity('newPassword', {
                        required: 'New password is required',
                        minLength: { value: 6, message: 'Password must be at least 6 characters' },
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {securityErrors.newPassword && (
                    <span className="text-rose-500 text-xs font-semibold mt-1 block">
                      {securityErrors.newPassword.message}
                    </span>
                  )}
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="animate-spin h-4 w-4" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <span>Update Password</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
