import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  Trash2, 
  Loader2, 
  Search, 
  Eye, 
  Edit2, 
  UserCheck, 
  Users, 
  Globe, 
  CheckCircle2, 
  XCircle,
  ExternalLink
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { 
  useGetQuestionnaireNominationsQuery, 
  useUpdateQuestionnaireNominationStatusMutation, 
  useUpdateQuestionnaireNominationPaymentMutation, 
  useDeleteQuestionnaireNominationMutation, 
  useUpdateQuestionnaireNominationMutation,
  useGetAssignableStaffQuery,
  useAssignQuestionnaireNominationMutation
} from '../../store/apiSlice';
import QuestionnaireNominationViewModal from '../../components/admin/QuestionnaireNominationViewModal';
import QuestionnaireNominationEditModal from '../../components/admin/QuestionnaireNominationEditModal';

const STATUS_OPTIONS = [
  'ALL STATUSES',
  'NOMINATION RECEIVED',
  'UNDER EVALUATION',
  'IN PROGRESS (SHORTLISTED)',
  'SELECTED (WINNER)',
  'REJECTED'
];

const EDITION_OPTIONS = [
  'ALL EDITIONS',
  'US Edition (18 Nov, Washington D.C., USA)',
  'UAE Edition (Dubai, UAE)',
  'India Edition (New Delhi, India)'
];

export default function AdminQuestionnaireNominations() {
  const { adminInfo } = useSelector((state) => state.auth);
  const isSuperAdmin = adminInfo?.role === 'admin' || adminInfo?.role === 'superadmin' || !adminInfo?.role;

  const [searchTerm, setSearchTerm] = useState('');
  const [editionFilter, setEditionFilter] = useState('ALL EDITIONS');
  const [statusFilter, setStatusFilter] = useState('ALL STATUSES');
  const [paymentFilter, setPaymentFilter] = useState('ALL PAYMENTS');
  const [assignedToFilter, setAssignedToFilter] = useState('ALL ASSIGNEES');

  const [updatingId, setUpdatingId] = useState(null);
  const [assigningId, setAssigningId] = useState(null);

  // Modal states
  const [viewingNomination, setViewingNomination] = useState(null);
  const [editingNomination, setEditingNomination] = useState(null);

  // Inline remark edit state
  const [editingRemarkId, setEditingRemarkId] = useState(null);
  const [remarkText, setRemarkText] = useState('');

  // Fetch assignable staff for assignment dropdown (superadmin only)
  const { data: staffResponse } = useGetAssignableStaffQuery(undefined, { skip: !isSuperAdmin });
  const assignableStaff = (staffResponse?.data || []).filter((s) => s.role === 'staff');

  const queryParams = {
    search: searchTerm,
    edition: editionFilter !== 'ALL EDITIONS' ? editionFilter : undefined,
    status: statusFilter !== 'ALL STATUSES' ? statusFilter : undefined,
    paymentStatus: paymentFilter !== 'ALL PAYMENTS' ? paymentFilter : undefined,
    assignedTo: isSuperAdmin && assignedToFilter !== 'ALL ASSIGNEES' ? assignedToFilter : undefined
  };

  const { data: response, isLoading, error } = useGetQuestionnaireNominationsQuery(queryParams);
  const [updateStatus] = useUpdateQuestionnaireNominationStatusMutation();
  const [updatePayment] = useUpdateQuestionnaireNominationPaymentMutation();
  const [deleteNom] = useDeleteQuestionnaireNominationMutation();
  const [updateNomination] = useUpdateQuestionnaireNominationMutation();
  const [assignNomination] = useAssignQuestionnaireNominationMutation();

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
    if (!window.confirm('Are you sure you want to delete this questionnaire nomination? This action cannot be undone.')) return;
    try {
      setUpdatingId(id);
      await deleteNom(id).unwrap();
    } catch (err) {
      console.error('Failed to delete questionnaire nomination:', err);
      alert('Failed to delete questionnaire nomination');
    } finally {
      setUpdatingId(null);
    }
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

  const getEditionBadge = (edition = '') => {
    if (edition.includes('US')) {
      return {
        flag: '🇺🇸',
        label: 'US Edition',
        sub: 'Washington D.C., USA',
        style: 'bg-blue-50 text-blue-800 border-blue-200'
      };
    }
    if (edition.includes('UAE') || edition.includes('Dubai')) {
      return {
        flag: '🇦🇪',
        label: 'UAE Edition',
        sub: 'Dubai, UAE',
        style: 'bg-emerald-50 text-emerald-800 border-emerald-200'
      };
    }
    return {
      flag: '🇮🇳',
      label: 'India Edition',
      sub: 'New Delhi, India',
      style: 'bg-amber-50 text-amber-800 border-amber-200'
    };
  };

  const renderTable = () => (
    <div className="relative group/table mt-6">
      <div className="overflow-x-auto max-h-[75vh] rounded-2xl border border-slate-200 bg-white shadow-lg overflow-y-auto custom-scrollbar">
        <table className="min-w-[2000px] w-full text-left border-separate border-spacing-0">
          <thead>
            <tr className="sticky top-0 z-40 shadow-sm">
              {[
                { label: "Assign To", width: "210px" },
                { label: "Edition Applied", width: "240px" },
                { label: "Eligibility Checks", width: "250px" },
                { label: "Nominee Entity", width: "240px" },
                { label: "Workflow Status", width: "200px" },
                { label: "Revenue Status", width: "180px" },
                { label: "Leadership", width: "220px" },
                { label: "Primary Contact", width: "220px" },
                { label: "Geography", width: "190px" },
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
            {nominations.map((n) => {
              const edBadge = getEditionBadge(n.edition);
              return (
                <tr key={n._id} className="hover:bg-slate-50/80 transition-colors duration-200 group/row">
                  {/* 1. ASSIGN TO COLUMN (FIRST COLUMN) */}
                  <td className="p-5 align-top border-b border-slate-100">
                    {isSuperAdmin ? (
                      <div className="space-y-1.5 min-w-[190px]">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
                            <Users size={12} className="text-sky-500" />
                            {n.assignedTo?.name ? 'Assigned' : 'Unassigned'}
                          </span>
                          {assigningId === n._id && (
                            <Loader2 size={12} className="animate-spin text-sky-500" />
                          )}
                        </div>
                        <select
                          value={n.assignedTo?._id || n.assignedTo || ''}
                          onChange={async (e) => {
                            const newAssignee = e.target.value;
                            try {
                              setAssigningId(n._id);
                              await assignNomination({ id: n._id, assignedTo: newAssignee || null }).unwrap();
                            } catch (err) {
                              console.error('Failed to assign questionnaire nomination:', err);
                              alert('Failed to assign questionnaire nomination');
                            } finally {
                              setAssigningId(null);
                            }
                          }}
                          disabled={assigningId === n._id}
                          className={`w-full text-xs font-bold rounded-lg px-2.5 py-2 border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-200 ${
                            n.assignedTo
                              ? 'bg-sky-50 text-sky-800 border-sky-200 hover:bg-sky-100/80'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-white'
                          }`}
                        >
                          <option value="">-- Unassigned --</option>
                          {assignableStaff.map((staff) => (
                            <option key={staff._id} value={staff._id}>
                              {staff.name}
                            </option>
                          ))}
                        </select>
                        {n.assignedTo?.email && (
                          <div className="text-[10px] text-slate-400 font-medium truncate max-w-[180px] px-0.5">
                            {n.assignedTo.email}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="min-w-[180px] pt-1">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-emerald-50 border-emerald-200 text-emerald-800 text-[11px] font-bold shadow-sm">
                          <UserCheck size={14} className="text-emerald-600" />
                          Assigned to You
                        </span>
                      </div>
                    )}
                  </td>

                  {/* 2. EDITION APPLIED */}
                  <td className="p-5 align-top border-b border-slate-100">
                    <div className="space-y-1.5">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-black uppercase tracking-wider shadow-sm ${edBadge.style}`}>
                        <span className="text-base">{edBadge.flag}</span>
                        <span>{edBadge.label}</span>
                      </div>
                      <div className="text-[11px] font-bold text-slate-600 leading-tight">
                        {edBadge.sub}
                      </div>
                    </div>
                  </td>

                  {/* 3. ELIGIBILITY CHECKS */}
                  <td className="p-5 align-top border-b border-slate-100">
                    <div className="space-y-1.5">
                      {/* US Visa Badge */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider w-16">US Visa:</span>
                        {n.hasUSVisa === 'Yes' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 size={11} /> Yes
                          </span>
                        ) : n.hasUSVisa === 'No' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-50 text-amber-700 border border-amber-200">
                            <XCircle size={11} /> No
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                            N/A
                          </span>
                        )}
                      </div>

                      {/* 3-yr ITR Badge */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider w-16">ITR &gt;12L:</span>
                        {n.itrExceeded12L === 'Yes' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 size={11} /> Yes
                          </span>
                        ) : n.itrExceeded12L === 'No' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-50 text-amber-700 border border-amber-200">
                            <XCircle size={11} /> Under
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                            N/A
                          </span>
                        )}
                      </div>

                      {/* Fee Agreement */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider w-16">PR Fees:</span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 size={11} /> Agreed
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* 4. NOMINEE ENTITY */}
                  <td className="p-5 align-top border-b border-slate-100">
                    <div className="space-y-1.5">
                      <div className="text-base font-black text-slate-900 leading-snug">{n.nomineeName}</div>
                      <div className="text-xs font-bold text-slate-600 uppercase tracking-wider truncate max-w-[200px] opacity-80">
                        {n.organizationName || "—"}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-block px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 rounded border border-slate-200">
                          {n.applyType}
                        </span>
                        {n.website && (
                          <a
                            href={n.website.startsWith('http') ? n.website : `https://${n.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 hover:text-sky-800 hover:underline truncate max-w-[140px]"
                          >
                            <span>🌐</span> Link
                          </a>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* 5. WORKFLOW STATUS */}
                  <td className="p-5 align-top border-b border-slate-100">
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

                  {/* 6. REVENUE / PAYMENT STATUS */}
                  <td className="p-5 align-top border-b border-slate-100">
                    <div className="space-y-2.5">
                      <span className={`inline-flex items-center border px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest shadow-sm ${
                        n.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
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
                    </div>
                  </td>

                  {/* 7. LEADERSHIP / HEAD */}
                  <td className="p-5 align-top border-b border-slate-100">
                    <div className="space-y-2">
                      <div className="text-base font-bold text-slate-800">{n.headName || "—"}</div>
                      <div className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Owner / Head</div>
                      <div className="flex flex-col gap-1.5 mt-2">
                        {n.headEmail ? (
                          <a href={`mailto:${n.headEmail}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-sky-600 transition-colors">
                            <span className="text-slate-400">📧</span> {n.headEmail}
                          </a>
                        ) : <span className="text-slate-400 text-sm">—</span>}
                        {n.headNumber ? (
                          <a href={`tel:${n.headNumber}`} className="inline-flex items-center gap-1.5 text-sm font-mono font-medium text-slate-600 hover:text-sky-600 transition-colors">
                            <span className="text-slate-400">📱</span> {n.headNumber}
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </td>

                  {/* 8. PRIMARY CONTACT */}
                  <td className="p-5 align-top border-b border-slate-100">
                    <div className="space-y-2">
                      <div className="text-base font-bold text-slate-800">{n.contactName || "—"}</div>
                      <div className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Primary Contact</div>
                      <div className="flex flex-col gap-1.5 mt-2">
                        {n.contactEmail ? (
                          <a href={`mailto:${n.contactEmail}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-sky-600 transition-colors">
                            <span className="text-slate-400">📧</span> {n.contactEmail}
                          </a>
                        ) : <span className="text-slate-400 text-sm">—</span>}
                        {n.contactNumber ? (
                          <a href={`tel:${n.contactNumber}`} className="inline-flex items-center gap-1.5 text-sm font-mono font-medium text-slate-600 hover:text-sky-600 transition-colors">
                            <span className="text-slate-400">📱</span> {n.contactNumber}
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </td>

                  {/* 9. GEOGRAPHY */}
                  <td className="p-5 align-top border-b border-slate-100">
                    <div className="space-y-1.5">
                      <div className="text-sm font-bold text-slate-800 leading-snug">
                        {n.city ? `${n.city}, ${n.state}` : "—"}
                      </div>
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        {n.country || "India"}
                      </div>
                    </div>
                  </td>

                  {/* 10. ADMIN REMARK */}
                  <td className="p-5 align-top border-b border-slate-100">
                    <div className="min-w-[240px]">
                      <div className="bg-red-50/50 border border-red-100 rounded-lg p-2 shadow-sm hover:bg-red-50 transition-colors group">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs">🛡️</span>
                            <span className="text-[9px] font-black uppercase tracking-widest text-red-600">
                              {n.adminName || 'Admin'} Note
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

                  {/* 11. TIMESTAMP */}
                  <td className="p-5 align-top border-b border-slate-100">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 space-y-1">
                      <div className="flex items-center gap-1.5"><span className="text-slate-400">📅</span> {new Date(n.createdAt).toLocaleDateString()}</div>
                      <div className="flex items-center gap-1.5 text-slate-400"><span className="text-slate-300">⏰</span> {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </td>

                  {/* 12. CONTROL NODE (STICKY RIGHT) */}
                  <td className="p-5 align-top sticky right-0 z-30 bg-slate-50/95 backdrop-blur-sm border-l border-slate-200 text-right shadow-[-4px_0_10px_-4px_rgba(0,0,0,0.05)] group-hover/row:bg-slate-100/95 transition-colors">
                    <div className="flex items-center justify-end gap-2 flex-wrap">
                      <button
                        onClick={() => setViewingNomination(n)}
                        className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 hover:bg-indigo-100 transition-all shadow-sm"
                        title="View Full Dossier"
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
              );
            })}
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
          <h1 className="text-2xl font-bold text-slate-800">Questionnaire Nominations</h1>
          <p className="text-slate-600 mt-1 font-medium">Review, evaluate and manage isolated questionnaire edition applications</p>
        </div>
        <div className="bg-white border border-slate-200 shadow-sm px-4 py-2 rounded-lg flex items-center gap-3">
          <ClipboardCheck className="text-sky-500" size={20} />
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
            placeholder="Search across applicant, organization, head, contact, city, state..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm font-medium text-slate-700 placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Edition Filter */}
        <div className="w-full lg:w-56 flex-shrink-0">
          <select
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-bold uppercase tracking-widest text-slate-700 cursor-pointer shadow-sm"
            value={editionFilter}
            onChange={(e) => setEditionFilter(e.target.value)}
          >
            {EDITION_OPTIONS.map((ed) => (
              <option key={ed} value={ed}>{ed === 'ALL EDITIONS' ? 'All Editions' : ed.split(' (')[0]}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="w-full lg:w-44 flex-shrink-0">
          <select
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm font-bold uppercase tracking-widest text-slate-700 cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {STATUS_OPTIONS.map((s) => (
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

        {/* Assignee Filter (Super Admin Only) */}
        {isSuperAdmin && (
          <div className="w-full lg:w-48 flex-shrink-0">
            <select
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm font-bold uppercase tracking-widest text-slate-700 cursor-pointer"
              value={assignedToFilter}
              onChange={(e) => setAssignedToFilter(e.target.value)}
            >
              <option value="ALL ASSIGNEES">All Assignees</option>
              <option value="unassigned">Unassigned Only</option>
              {assignableStaff.map((staff) => (
                <option key={staff._id} value={staff._id}>
                  {staff.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 bg-red-50 text-red-600 p-4 rounded-xl font-medium border border-red-200">
          {error?.data?.message || error?.message || 'Error loading questionnaire nominations'}
        </div>
      )}

      {/* Table Content */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-sky-500" />
        </div>
      ) : nominations.length === 0 ? (
        <div className="mt-6 bg-white shadow-sm rounded-2xl p-16 text-center text-slate-500 border border-slate-200">
          <ClipboardCheck className="w-12 h-12 mx-auto mb-4 opacity-50 text-sky-500" />
          <p className="text-xl font-bold text-slate-700">No records found</p>
          <p className="text-sm mt-2">No questionnaire nominations match the current filters.</p>
        </div>
      ) : (
        renderTable()
      )}

      {/* Modals */}
      <QuestionnaireNominationViewModal
        nomination={viewingNomination}
        onClose={() => setViewingNomination(null)}
      />
      <QuestionnaireNominationEditModal
        nomination={editingNomination}
        onClose={() => setEditingNomination(null)}
        onSave={() => setEditingNomination(null)}
      />
    </div>
  );
}
