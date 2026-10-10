import React from 'react';
import { createPortal } from 'react-dom';
import { 
  ClipboardCheck, 
  User, 
  Building, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Calendar, 
  ShieldCheck, 
  FileCheck2, 
  CheckCircle2, 
  XCircle,
  ExternalLink
} from 'lucide-react';

const DetailItem = ({ label, val, color = "text-slate-900", isLink, badge }) => {
  if (!val) return null;
  return (
    <div>
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">{label}</p>
      {badge ? (
        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-md border ${badge}`}>
          {val}
        </span>
      ) : isLink ? (
        <a 
          href={val.startsWith('http') ? val : `https://${val}`} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-xs font-bold text-sky-700 hover:text-sky-900 hover:underline inline-flex items-center gap-1"
        >
          {val} <ExternalLink size={11} />
        </a>
      ) : (
        <p className={`text-xs font-bold ${color}`}>{val}</p>
      )}
    </div>
  );
};

export default function QuestionnaireNominationViewModal({ nomination, onClose }) {
  if (!nomination) return null;

  const getEditionMeta = (edition = '') => {
    if (edition.includes('US')) return { flag: '🇺🇸', tag: 'US Edition', location: 'Washington D.C., USA' };
    if (edition.includes('UAE') || edition.includes('Dubai')) return { flag: '🇦🇪', tag: 'UAE Edition', location: 'Dubai, UAE' };
    return { flag: '🇮🇳', tag: 'India Edition', location: 'New Delhi, India' };
  };

  const edMeta = getEditionMeta(nomination.edition);

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[9999] p-4 sm:p-8" onClick={onClose}>
      <div
        className="bg-white border border-slate-200 shadow-2xl p-6 sm:p-8 rounded-[2rem] max-w-6xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative z-50">
          {/* Close Button */}
          <div className="absolute -top-2 -right-2 sm:top-0 sm:right-0 z-[999]">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all shadow-sm hover:rotate-90 cursor-pointer font-bold"
            >
              ✕
            </button>
          </div>

          {/* Modal Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-200 pb-6 pr-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2.5 w-2.5 bg-amber-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-800">
                  Questionnaire Nomination Dossier
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight uppercase leading-none">
                {nomination.nomineeName}
              </h2>
              <div className="flex items-center gap-2.5 mt-2 flex-wrap">
                <span className="text-sm md:text-base font-bold text-slate-600 uppercase tracking-wider">
                  {nomination.organizationName || 'Individual Applicant'}
                </span>
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded bg-slate-100 text-slate-800 uppercase tracking-widest border border-slate-300">
                  {nomination.applyType}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl shadow-sm">
                <p className="text-[9px] font-black uppercase tracking-widest text-amber-800 mb-0.5">Target Edition</p>
                <p className="text-xs font-black uppercase tracking-widest text-amber-950 flex items-center gap-1.5">
                  <span className="text-base">{edMeta.flag}</span> {edMeta.tag}
                </p>
              </div>

              <div className="bg-sky-50 border border-sky-200 px-4 py-2 rounded-xl shadow-sm">
                <p className="text-[9px] font-black uppercase tracking-widest text-sky-800 mb-0.5">Workflow Status</p>
                <p className="text-xs font-black uppercase tracking-widest text-sky-950">
                  {nomination.status || 'NOMINATION RECEIVED'}
                </p>
              </div>

              {nomination.assignedTo && (
                <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl shadow-sm">
                  <p className="text-[9px] font-black uppercase tracking-widest text-emerald-800 mb-0.5">Assigned Staff</p>
                  <p className="text-xs font-black uppercase tracking-widest text-emerald-950">
                    {nomination.assignedTo.name || nomination.assignedTo}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-5">
              
              {/* Questionnaire Branching & Eligibility Section */}
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-900 mb-4 flex items-center gap-2">
                  <span className="p-1.5 bg-amber-100 text-amber-800 rounded-lg text-xs">📋</span> Questionnaire Answers &amp; Eligibility
                </h3>
                <div className="grid sm:grid-cols-3 gap-3.5">
                  <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Q1. Target Edition</p>
                    <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="text-sm">{edMeta.flag}</span> {nomination.edition}
                    </p>
                  </div>

                  <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Q2. Valid US Visa</p>
                    <p className="text-xs font-bold flex items-center gap-1.5">
                      {nomination.hasUSVisa === 'Yes' ? (
                        <span className="text-emerald-700 flex items-center gap-1"><CheckCircle2 size={13} /> Yes (Confirmed)</span>
                      ) : nomination.hasUSVisa === 'No' ? (
                        <span className="text-amber-700 flex items-center gap-1"><XCircle size={13} /> No Visa</span>
                      ) : (
                        <span className="text-slate-500">N/A (Non-US Track)</span>
                      )}
                    </p>
                  </div>

                  <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Q3. ITR &gt; ₹12L (3 Yrs)</p>
                    <p className="text-xs font-bold flex items-center gap-1.5">
                      {nomination.itrExceeded12L === 'Yes' ? (
                        <span className="text-emerald-700 flex items-center gap-1"><CheckCircle2 size={13} /> Yes (&gt; ₹12 Lakhs)</span>
                      ) : nomination.itrExceeded12L === 'No' ? (
                        <span className="text-amber-700 flex items-center gap-1"><XCircle size={13} /> Under ₹12 Lakhs</span>
                      ) : (
                        <span className="text-slate-500">N/A</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="mt-3.5 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-900">Q5. Nomination &amp; PR Fees Acceptance</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded border border-emerald-300">
                    Agreed &amp; Confirmed
                  </span>
                </div>
              </div>

              {/* Leadership & Contact Details */}
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl shadow-sm">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-4 flex items-center gap-2">
                    <span className="p-1.5 bg-sky-100 text-sky-800 rounded-lg text-xs">👑</span> Organization Head / Owner
                  </h3>
                  <div className="space-y-3.5">
                    <DetailItem label="Full Name" val={nomination.headName} />
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Phone Number</p>
                      <a href={`tel:${nomination.headNumber}`} className="text-xs font-mono font-bold text-sky-700 hover:underline flex items-center gap-1.5">
                        <Phone size={12} className="text-sky-600" /> {nomination.headNumber}
                      </a>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Email Endpoint</p>
                      <a href={`mailto:${nomination.headEmail}`} className="text-xs font-bold text-sky-700 hover:underline flex items-center gap-1.5">
                        <Mail size={12} className="text-sky-600" /> {nomination.headEmail}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl shadow-sm">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-4 flex items-center gap-2">
                    <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg text-xs">📞</span> Primary Contact Person
                  </h3>
                  <div className="space-y-3.5">
                    <DetailItem label="Full Name" val={nomination.contactName} />
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Phone Number</p>
                      <a href={`tel:${nomination.contactNumber}`} className="text-xs font-mono font-bold text-emerald-700 hover:underline flex items-center gap-1.5">
                        <Phone size={12} className="text-emerald-600" /> {nomination.contactNumber}
                      </a>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Email Endpoint</p>
                      <a href={`mailto:${nomination.contactEmail}`} className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1.5">
                        <Mail size={12} className="text-emerald-600" /> {nomination.contactEmail}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Geographic Presence & Online Hub */}
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-4 flex items-center gap-2">
                  <span className="p-1.5 bg-purple-100 text-purple-800 rounded-lg text-xs">🌍</span> Location &amp; Online Hub
                </h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  <DetailItem label="City" val={nomination.city} />
                  <DetailItem label="State / Province" val={nomination.state} />
                  <DetailItem label="Country" val={nomination.country} />
                </div>
                {nomination.website && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <DetailItem label="Website / Digital Portfolio" val={nomination.website} isLink />
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar Information */}
            <div className="space-y-5">
              
              {/* Financial & Revenue Status */}
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-4 flex items-center gap-2">
                  <span className="p-1 bg-amber-100 rounded text-xs">💸</span> Revenue &amp; Payment Status
                </h3>
                <div className="space-y-3.5">
                  <DetailItem 
                    label="Payment State" 
                    val={nomination.paymentStatus ? nomination.paymentStatus.replace('_', ' ').toUpperCase() : 'NOT PAID'} 
                    color="text-slate-800"
                  />
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Payment Status Badge</p>
                    <span className={`inline-flex items-center text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border ${
                      nomination.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      nomination.paymentStatus === 'initial_paid' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      nomination.paymentStatus === 'not_interested' ? 'bg-red-50 text-red-700 border-red-200' :
                      'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {nomination.paymentStatus === 'paid' ? 'Fully Paid' :
                       nomination.paymentStatus === 'initial_paid' ? 'Initial Paid' :
                       nomination.paymentStatus === 'not_interested' ? 'Not Interested' : 'Not Paid'}
                    </span>
                  </div>
                </div>
              </div>

              {/* System Metadata & Verification */}
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-4 flex items-center gap-2">
                  <span className="p-1 bg-slate-200 rounded text-xs">🛡️</span> System Metadata
                </h3>
                <div className="space-y-3 mb-4">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Submission Date</p>
                    <p className="text-xs font-mono font-bold text-slate-800">
                      {new Date(nomination.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {nomination.updatedAt && (
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Last Modified</p>
                      <p className="text-xs font-mono font-medium text-slate-600">
                        {new Date(nomination.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
                <div className="pt-3 border-t border-slate-200">
                  <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest mb-1.5">
                    <span className="text-slate-500">Dossier Integrity</span>
                    <span className="text-emerald-700 font-bold">Verified Valid</span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-full" />
                  </div>
                </div>
              </div>

              {/* Admin Note Box */}
              <div className="bg-red-50 border border-red-200 p-5 rounded-2xl shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-wider text-red-900 mb-2 flex items-center gap-2">
                  ⚠️ Internal Admin Remarks
                </h3>
                {nomination.adminName && (
                  <p className="text-[10px] font-black uppercase tracking-wider text-red-700 mb-1">
                    Logged by {nomination.adminName}
                  </p>
                )}
                <p className="text-xs italic text-red-800 leading-relaxed font-medium">
                  {nomination.adminRemark ? `"${nomination.adminRemark}"` : 'No internal administrative remarks recorded.'}
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
