import React, { useState } from 'react';
import { Award, Trash2, Loader2, Search, Download, Eye, Edit2, Filter } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useGetNominationsQuery, useUpdateNominationStatusMutation, useUpdateNominationPaymentMutation, useDeleteNominationMutation, useUpdateNominationMutation } from '../../store/apiSlice';
import NominationViewModal from '../../components/admin/NominationViewModal';
import NominationEditModal from '../../components/admin/NominationEditModal';
import config from '../../config/env';
import categoryMap from '../../data/categoryMap';

const STATUS_OPTIONS = [
  'ALL STATUSES',
  'NOMINATION RECEIVED',
  'UNDER EVALUATION',
  'IN PROGRESS (SHORTLISTED)',
  'SELECTED (WINNER)',
  'REJECTED'
];

const AWARD_OPTIONS = [
  'ALL AWARDS',
  'International Awards',
  'Global Education Awards',
  'Global Healthcare Awards',
  'Digital Bharat Summit',
  'Global Icon Awards',
  'India Excellence Awards',
  'National Dental Awards'
];

export default function NominationSubmissions() {
  const { adminInfo } = useSelector((state) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL STATUSES');
  const [paymentFilter, setPaymentFilter] = useState('ALL PAYMENTS');
  
  // Hierarchical filters
  const [awardNameFilter, setAwardNameFilter] = useState('ALL AWARDS');
  const [editionFilter, setEditionFilter] = useState('ALL EDITIONS');

  const [updatingId, setUpdatingId] = useState(null);

  // Modal states
  const [viewingNomination, setViewingNomination] = useState(null);
  const [editingNomination, setEditingNomination] = useState(null);

  // Inline remark edit state
  const [editingRemarkId, setEditingRemarkId] = useState(null);
  const [remarkText, setRemarkText] = useState('');

  const queryParams = {
    search: searchTerm,
    status: statusFilter !== 'ALL STATUSES' ? statusFilter : undefined,
    paymentStatus: paymentFilter !== 'ALL PAYMENTS' ? paymentFilter : undefined,
    awardName: awardNameFilter !== 'ALL AWARDS' ? awardNameFilter : undefined,
    edition: editionFilter !== 'ALL EDITIONS' ? editionFilter : undefined
  };

  const { data: response, isLoading, error } = useGetNominationsQuery(queryParams);
  const [updateStatus] = useUpdateNominationStatusMutation();
  const [updatePayment] = useUpdateNominationPaymentMutation();
  const [deleteNom] = useDeleteNominationMutation();
  const [updateNomination] = useUpdateNominationMutation();

  const nominations = response?.data || [];

  const handleSaveRemark = async (id) => {
    try {
      const adminName = adminInfo?.name || 'Admin';
      await updateNomination({ id, data: { adminRemark: remarkText, adminName } }).unwrap();
      setEditingRemarkId(null);
      setRemarkText('');
    } catch (err) {
      console.error('Failed to update remark:', err);
      alert('Failed to update remark');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      setUpdatingId(id);
      await updateStatus({ id, status: newStatus }).unwrap();
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePaymentStatusChange = async (id, newPaymentStatus) => {
    try {
      setUpdatingId(id);
      await updatePayment({ id, paymentStatus: newPaymentStatus }).unwrap();
    } catch (err) {
      console.error('Failed to update payment status:', err);
      alert('Failed to update payment status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this nomination? This cannot be undone.')) return;
    try {
      setUpdatingId(id);
      await deleteNom(id).unwrap();
    } catch (err) {
      console.error('Failed to delete nomination:', err);
      alert('Failed to delete nomination');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveEdit = () => {
    setEditingNomination(null);
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'NOMINATION RECEIVED': return 'bg-sky-50 text-sky-600 border-sky-200';
      case 'UNDER EVALUATION': return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'IN PROGRESS (SHORTLISTED)': return 'bg-indigo-50 text-indigo-600 border-indigo-200';
      case 'SELECTED (WINNER)': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'REJECTED': return 'bg-red-50 text-red-600 border-red-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const renderNominationsTable = () => (
    <div className="relative group/table mt-6">
      <div className="overflow-x-auto max-h-[75vh] rounded-2xl border border-slate-200 bg-white shadow-lg overflow-y-auto custom-scrollbar">
        <table className="min-w-[1700px] w-full text-left border-separate border-spacing-0">
          <thead>
            <tr className="sticky top-0 z-40 shadow-sm">
              {[
                { label: "Participation", width: "220px" },
                { label: "Award Event", width: "240px" },
                { label: "Category Details", width: "320px" },
                { label: "Nominee Entity", width: "240px" },
                { label: "Workflow Status", width: "200px" },
                { label: "Revenue Status", width: "180px" },
                { label: "Leadership", width: "220px" },
                { label: "Primary Contact", width: "220px" },
                { label: "Geography", width: "200px" },
                { label: "Financials", width: "180px" },
                { label: "Referral & Msg", width: "240px" },
                { label: "Admin Remark", width: "260px" },
                { label: "Timestamp", width: "140px" }
              ].map((th, i) => (
                <th key={i} className="px-5 py-4 bg-slate-100/90 backdrop-blur-md border-b border-slate-200" style={{ width: th.width }}>
                  <span className="text-[11px] font-black uppercase tracking-widest text-slate-800">{th.label}</span>
                </th>
              ))}
              <th className="px-5 py-4 sticky right-0 z-50 bg-slate-100/90 backdrop-blur-md border-b border-l border-slate-200 text-right shadow-[-4px_0_10px_-4px_rgba(0,0,0,0.05)]">
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-800">Control Node</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {nominations.map((n) => (
              <tr key={n._id} className="hover:bg-slate-50/80 transition-colors duration-200 group/row">
                <td className="p-5 align-top">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-sky-50 border-sky-100 text-sky-700 text-[11px] font-black uppercase tracking-widest shadow-sm">
                    <span className="text-lg">{n.wantTo?.includes('Nominate') ? '🏆' : n.wantTo?.includes('Speak') ? '🎤' : n.wantTo?.includes('Exhibit') ? '🏢' : '💎'}</span>
                    <span className="whitespace-normal leading-tight max-w-[160px]">{n.wantTo}</span>
                  </div>
                </td>
                <td className="px-5 py-4 border-b border-slate-100">
                  <div className="flex flex-col gap-1.5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-50 text-violet-700 text-xs font-bold uppercase tracking-wider rounded-lg border border-violet-100 w-fit">
                      <Award size={12} />
                      {n.awardName || 'N/A'}
                    </span>
                    {n.edition && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Array.isArray(n.edition) ? (
                          n.edition.map((ed, idx) => (
                            <span key={idx} className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md uppercase tracking-wider">
                              {ed}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md uppercase tracking-wider">
                            {n.edition}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4 border-b border-slate-100">
                  <div className="flex flex-col gap-1.5">
                    {n.categoryPath && n.categoryPath.length > 0 ? (
                      <>
                        <span className="text-xs font-bold text-sky-700 leading-tight">
                          {n.categoryPath[n.categoryPath.length - 1]}
                        </span>
                        {n.categoryPath.length > 1 && (
                          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50 px-2 py-0.5 rounded border border-slate-100 w-fit">
                            {n.categoryPath.slice(0, -1).join(' > ')}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-xs font-medium text-slate-400 italic">No category</span>
                    )}
                  </div>
                </td>
                <td className="p-5 align-top">
                  <div className="space-y-1.5">
                    <div className="text-base font-black text-slate-900 leading-snug">{n.nomineeName}</div>
                    <div className="text-xs font-bold text-slate-600 uppercase tracking-wider truncate max-w-[200px] opacity-80">
                      {n.organizationName || "—"}
                    </div>
                    {n.website && (
                      <a href={n.website.startsWith('http') ? n.website : `https://${n.website}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-1 px-2 py-1 bg-sky-50 rounded text-xs font-bold text-sky-700 hover:text-sky-900 hover:bg-sky-100 transition-colors truncate max-w-[200px]">
                        <span>🌐</span> {n.website}
                      </a>
                    )}
                  </div>
                </td>
                <td className="p-5 align-top">
                  <div className="space-y-2.5">
                    <span className={`inline-flex items-center border px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest shadow-sm ${getStatusBadgeColor(n.status)}`}>
                      {n.status}
                    </span>
                    <select
                      value={n.status}
                      onChange={(e) => handleStatusChange(n._id, e.target.value)}
                      disabled={updatingId === n._id}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-widest text-slate-700 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                    >
                      {STATUS_OPTIONS.filter(s => s !== 'ALL STATUSES').map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </td>
                <td className="p-5 align-top">
                  <div className="space-y-2.5">
                    <span className={`inline-flex items-center border px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest shadow-sm ${n.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                      n.paymentStatus === 'initial_paid' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                        n.paymentStatus === 'not_interested' ? 'bg-red-50 text-red-600 border-red-200' :
                          'bg-slate-50 text-slate-600 border-slate-200'
                      }`}>
                      {n.paymentStatus === 'paid' ? 'FULLY PAID' :
                        n.paymentStatus === 'initial_paid' ? 'INITIAL PAID' :
                          n.paymentStatus === 'not_interested' ? 'NOT INTERESTED' :
                            'NOT PAID'}
                    </span>
                    <select
                      value={n.paymentStatus || 'not_paid'}
                      onChange={(e) => handlePaymentStatusChange(n._id, e.target.value)}
                      disabled={updatingId === n._id}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-widest text-slate-700 focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-amber-100 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                    >
                      <option value="not_paid">Not Paid</option>
                      <option value="initial_paid">Initial Paid</option>
                      <option value="paid">Fully Paid</option>
                      <option value="not_interested">Not Interested</option>
                    </select>
                    {n.amount && <div className="text-xs font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-100 inline-block px-2 py-1 rounded-md shadow-sm">Fee: ₹{n.amount}</div>}
                  </div>
                </td>
                <td className="p-5 align-top">
                  <div className="space-y-2">
                    <div className="text-base font-bold text-slate-800">{n.headName || "—"}</div>
                    <div className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{n.headDesignation || "—"}</div>
                    <div className="flex flex-col gap-1.5 mt-2">
                      {n.headEmail ? <a href={`mailto:${n.headEmail}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-sky-600 transition-colors"><span className="text-slate-400">📧</span> {n.headEmail}</a> : <span className="text-slate-400 text-sm">—</span>}
                      {n.headMobile ? <a href={`tel:${n.headMobile}`} className="inline-flex items-center gap-1.5 text-sm font-mono font-medium text-slate-600 hover:text-sky-600 transition-colors"><span className="text-slate-400">📱</span> {n.headMobile}</a> : null}
                    </div>
                  </div>
                </td>
                <td className="p-5 align-top">
                  <div className="space-y-2">
                    <div className="text-base font-bold text-slate-800">{n.contactName || "—"}</div>
                    <div className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{n.contactDesignation || "—"}</div>
                    <div className="flex flex-col gap-1.5 mt-2">
                      {n.contactEmail ? <a href={`mailto:${n.contactEmail}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-sky-600 transition-colors"><span className="text-slate-400">📧</span> {n.contactEmail}</a> : <span className="text-slate-400 text-sm">—</span>}
                      {n.contactMobile ? <a href={`tel:${n.contactMobile}`} className="inline-flex items-center gap-1.5 text-sm font-mono font-medium text-slate-600 hover:text-sky-600 transition-colors"><span className="text-slate-400">📱</span> {n.contactMobile}</a> : null}
                    </div>
                  </div>
                </td>
                <td className="p-5 align-top">
                  <div className="space-y-1.5">
                    <div className="text-sm font-bold text-slate-800 leading-snug">{n.city ? `${n.city}, ${n.state}` : "—"}</div>
                    <div className="text-xs font-medium text-slate-500 leading-snug max-w-[180px]">{n.streetAddress || "—"}</div>
                    {n.zipCode && <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest pt-1">{n.zipCode}</div>}
                  </div>
                </td>
                <td className="p-5 align-top">
                  <div className="space-y-1.5">
                    {n.turnover ? (
                      <div className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-1 rounded text-sm font-bold text-slate-700 shadow-sm">
                        <span>📈</span> ₹{n.turnover}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-sm">—</span>
                    )}
                  </div>
                </td>
                <td className="p-5 align-top">
                  <div className="space-y-3 min-w-[220px]">
                    {n.referredBy && (
                      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-widest shadow-sm">
                        <span>🔗</span> Ref: {n.referredBy}
                      </div>
                    )}

                    {n.message && (
                      <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 shadow-sm group relative" title={n.message}>
                        <div className="flex items-start gap-2">
                          <span className="text-slate-400 mt-0.5 text-xs">💬</span>
                          <p className="text-sm font-medium text-slate-600 line-clamp-4 leading-snug">
                            {n.message}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-5 align-top">
                  <div className="min-w-[240px]">
                    <div className="bg-red-50/50 border border-red-100 rounded-lg p-2 shadow-sm hover:bg-red-50 transition-colors group">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs">🛡️</span>
                          <span className="text-[9px] font-black uppercase tracking-widest text-red-600">
                            {n.adminName} Note
                          </span>
                        </div>
                      </div>

                      {editingRemarkId === n._id ? (
                        <div className="flex flex-col gap-2 mt-1.5">
                          <textarea
                            value={remarkText}
                            onChange={(e) => setRemarkText(e.target.value)}
                            className="w-full min-h-[50px] bg-white border border-red-200 rounded-md px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-100 resize-none shadow-inner"
                            placeholder="Type internal remark..."
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSaveRemark(n._id); }
                              if (e.key === 'Escape') setEditingRemarkId(null);
                            }}
                          />
                          <div className="flex items-center justify-end gap-1.5">
                            <button onClick={() => setEditingRemarkId(null)} className="px-2 py-1 rounded bg-slate-200/60 text-slate-600 hover:bg-slate-200 text-[9px] font-bold uppercase tracking-wider transition-colors">Cancel</button>
                            <button onClick={() => handleSaveRemark(n._id)} className="px-2 py-1 rounded bg-red-500 text-white hover:bg-red-600 text-[9px] font-bold uppercase tracking-wider transition-colors shadow-sm">Save</button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => { setEditingRemarkId(n._id); setRemarkText(n.adminRemark || ''); }}
                          className="cursor-pointer flex items-start justify-between gap-2 text-[13px] text-red-700 hover:text-red-900 group-hover:bg-white/60 p-1.5 -mx-1 -my-1 rounded transition-colors mt-0.5"
                          title="Click to edit admin remark"
                        >
                          <span className={`line-clamp-2 leading-snug w-full ${!n.adminRemark && 'italic text-red-400 font-medium text-xs'}`}>
                            {n.adminRemark || "Click to add a remark..."}
                          </span>
                          <Edit2 size={12} className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5 text-red-400" />
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="p-5 align-top">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 space-y-1">
                    <div className="flex items-center gap-1.5"><span className="text-slate-400">📅</span> {new Date(n.createdAt).toLocaleDateString()}</div>
                    <div className="flex items-center gap-1.5 text-slate-400"><span className="text-slate-300">⏰</span> {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </td>
                <td className="p-5 align-top sticky right-0 z-30 bg-slate-50/95 backdrop-blur-sm border-l border-slate-200 text-right shadow-[-4px_0_10px_-4px_rgba(0,0,0,0.05)] group-hover/row:bg-slate-100/95 transition-colors">
                  <div className="flex items-center justify-end gap-2 flex-wrap">
                    {n.fileUrl && (
                      <a
                        href={n.fileUrl.startsWith('http') ? n.fileUrl : `${config.apiUrl}${n.fileUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-9 h-9 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 hover:bg-sky-100 transition-all shadow-sm"
                        title="View Document"
                      >
                        <Download size={16} />
                      </a>
                    )}
                    <button
                      onClick={() => setViewingNomination(n)}
                      className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 hover:bg-indigo-100 transition-all shadow-sm"
                      title="Insight View"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => setEditingNomination(n)}
                      className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-300 flex items-center justify-center text-slate-700 hover:bg-slate-100 hover:border-slate-400 transition-all shadow-sm"
                      title="Edit Record"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(n._id)}
                      disabled={updatingId === n._id}
                      className="w-9 h-9 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-red-600 hover:bg-red-100 transition-all disabled:opacity-50 shadow-sm"
                      title="Delete"
                    >
                      {updatingId === n._id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto w-full px-2">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Nominations Database</h1>
          <p className="text-slate-600 mt-1 font-medium">Review and manage award nominations efficiently</p>
        </div>
        <div className="bg-white border border-slate-200 shadow-sm px-4 py-2 rounded-lg flex items-center gap-3">
          <Award className="text-sky-500" size={20} />
          <span className="text-slate-700 font-bold">{nominations.length} Records</span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="mt-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col lg:flex-row gap-4 items-center">
        
        {/* Search Bar */}
        <div className="w-full lg:flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search across all fields..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm font-medium text-slate-700 placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Award Filter */}
        <div className="w-full lg:w-48 flex-shrink-0">
          <select
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-bold uppercase tracking-widest text-slate-700 cursor-pointer shadow-sm"
            value={awardNameFilter}
            onChange={(e) => {
              setAwardNameFilter(e.target.value);
              setEditionFilter('ALL EDITIONS');
            }}
          >
            <option value="ALL AWARDS">All Awards</option>
            {AWARD_OPTIONS.filter(o => o !== 'ALL AWARDS').map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="w-full lg:w-40 flex-shrink-0">
          <select
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm font-bold uppercase tracking-widest text-slate-700 cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Payment Filter */}
        <div className="w-full lg:w-44 flex-shrink-0">
          <select
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm font-bold uppercase tracking-widest text-slate-700 cursor-pointer"
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
          >
            <option value="ALL PAYMENTS">All Payments</option>
            <option value="paid">Fully Paid</option>
            <option value="initial_paid">Initial Paid</option>
            <option value="not_paid">Not Paid</option>
            <option value="not_interested">Not Interested</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mt-4 bg-red-50 text-red-600 p-4 rounded-xl font-medium border border-red-200">
          {error}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-sky-500" />
        </div>
      ) : nominations.length === 0 ? (
        <div className="mt-6 bg-white shadow-sm rounded-2xl p-16 text-center text-slate-500 border border-slate-200">
          <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-xl font-bold text-slate-700">No records found</p>
          <p className="text-sm mt-2">No nominations match the current filters.</p>
        </div>
      ) : (
        renderNominationsTable()
      )}

      {/* Modals */}
      <NominationViewModal
        nomination={viewingNomination}
        onClose={() => setViewingNomination(null)}
      />
      <NominationEditModal
        nomination={editingNomination}
        onClose={() => setEditingNomination(null)}
        onSave={handleSaveEdit}
      />
    </div>
  );
}
