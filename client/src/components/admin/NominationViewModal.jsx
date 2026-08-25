import React from 'react';
import { createPortal } from 'react-dom';
import { FileText } from 'lucide-react';
import config from '../../config/env';

const DetailItem = ({ label, val, color = "text-white/90", isLink }) => {
  if (!val) return null;
  return (
    <div>
      <p className="text-[8px] font-black uppercase tracking-widest text-white/40 mb-1">{label}</p>
      {isLink ? (
        <a href={val} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-indigo-400 hover:underline">{val}</a>
      ) : Array.isArray(val) ? (
        <div className="flex flex-wrap gap-1 mt-1">
          {val.map((item, idx) => (
            <span key={idx} className={`text-[10px] font-bold bg-white/10 px-2 py-1 rounded-md uppercase tracking-wider ${color}`}>
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p className={`text-xs font-bold ${color}`}>{val}</p>
      )}
    </div>
  );
};

export default function NominationViewModal({ nomination, onClose }) {
  if (!nomination) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-center justify-center z-[9999] p-4 sm:p-8" onClick={onClose}>
      <div
        className="bg-[#050A15]/95 border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,1)] p-6 sm:p-8 rounded-[2rem] max-w-6xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar relative group"
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none rounded-[2rem]" />

        <div className="relative z-50">
          <div className="absolute -top-2 -right-2 sm:top-0 sm:right-0 z-[999]">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-red-500 hover:border-red-500 transition-all shadow-xl hover:rotate-90 cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-white/10 pb-6 pr-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 bg-[#d4af37] rounded-full animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#d4af37]">Complete Dossier</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase leading-none">{nomination.nomineeName}</h2>
              <p className="text-base md:text-lg font-bold text-indigo-200/60 uppercase tracking-widest mt-1">{nomination.organizationName}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-xl">
                <p className="text-[8px] font-black uppercase tracking-widest text-indigo-400/60 mb-1">Application Status</p>
                <p className="text-xs font-black uppercase tracking-widest text-indigo-400">{nomination.status || 'NOMINATION RECEIVED'}</p>
              </div>
              <div className="bg-cyan-500/10 border border-cyan-500/20 px-4 py-2 rounded-xl">
                <p className="text-[8px] font-black uppercase tracking-widest text-cyan-400/60 mb-1">Participation</p>
                <p className="text-xs font-black uppercase tracking-widest text-cyan-400">{nomination.wantTo}</p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-5">
              {/* Identity Details */}
              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl hover:bg-white/[0.07] transition-colors shadow-sm">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#d4af37] mb-5 flex items-center gap-2">
                  <span className="p-1.5 bg-[#d4af37]/10 rounded-lg text-xs">🏅</span> Classification
                </h3>
                <div className="grid sm:grid-cols-2 gap-5">
                  <DetailItem label="Award Name" val={nomination.awardName} />
                  <DetailItem label="Edition" val={nomination.edition} />
                  <DetailItem label="Category Path" val={nomination.categoryPath ? nomination.categoryPath.join(' > ') : 'N/A'} color="text-cyan-400" />
                  <DetailItem label="Registration Type" val={nomination.registrationType} />
                  <DetailItem label="Referred By" val={nomination.referredBy} />
                  <DetailItem label="System Classification" val={nomination.wantTo} color="text-[#d4af37]" />
                </div>
              </div>

              {/* Leadership & Operations */}
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="bg-white/5 border border-white/10 p-5 rounded-2xl hover:bg-white/[0.07] transition-colors shadow-sm">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400 mb-5 flex items-center gap-2">
                    <span className="p-1.5 bg-cyan-500/10 rounded-lg text-xs">👑</span> Organization Head
                  </h3>
                  <div className="space-y-4">
                    <DetailItem label="Name" val={nomination.headName} />
                    <DetailItem label="Designation" val={nomination.headDesignation} />
                    <DetailItem label="Mobile" val={nomination.headMobile} />
                    <DetailItem label="Email" val={nomination.headEmail} />
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 p-5 rounded-2xl hover:bg-white/[0.07] transition-colors shadow-sm">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-5 flex items-center gap-2">
                    <span className="p-1.5 bg-emerald-500/10 rounded-lg text-xs">📞</span> Primary Contact
                  </h3>
                  <div className="space-y-4">
                    <DetailItem label="Contact Person" val={nomination.contactName} />
                    <DetailItem label="Designation" val={nomination.contactDesignation} />
                    <DetailItem label="Mobile" val={nomination.contactMobile} />
                    <DetailItem label="Email Endpoint" val={nomination.contactEmail} />
                  </div>
                </div>
              </div>

              {/* Geography & Presence */}
              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl hover:bg-white/[0.07] transition-colors shadow-sm">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-400 mb-5 flex items-center gap-2">
                  <span className="p-1.5 bg-purple-500/10 rounded-lg text-xs">🌍</span> Geographic Presence
                </h3>
                <div className="grid sm:grid-cols-2 gap-5">
                  <DetailItem label="Physical Address" val={nomination.streetAddress} />
                  <DetailItem label="City & State" val={[nomination.city, nomination.state].filter(Boolean).join(', ') + (nomination.zipCode ? ` ${nomination.zipCode}` : '')} />
                  <DetailItem label="Digital Hub" val={nomination.website} isLink />
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Financials & Status */}
              <div className="bg-gradient-to-br from-indigo-900/40 to-[#020817] border border-indigo-500/20 p-5 rounded-2xl shadow-sm">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-5 flex items-center gap-2">
                  💸 Financial Node
                </h3>
                <div className="space-y-4">
                  <DetailItem label="Valuation / Turnover" val={nomination.turnover} />
                  <DetailItem label="Fee Status" val={nomination.paymentStatus?.replace('_', ' ').toUpperCase() || 'NOT PAID'} />
                  <DetailItem label="Secured Amount" val={nomination.amount || '—'} color="text-indigo-400" />
                </div>
              </div>

              {/* Security & Validation */}
              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl shadow-sm">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-5 flex items-center gap-2">
                  🛡️ System Metadata
                </h3>
                <div className="space-y-4 mb-5">
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-1">Created Timestamp</p>
                    <p className="text-[10px] font-mono text-white/60">{new Date(nomination.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest mb-2">
                    <span className="text-white/20">Data Integrity</span>
                    <span className="text-[#d4af37]">Verified</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#d4af37] w-full" />
                  </div>
                </div>
              </div>

              {/* PDF Dossier */}
              {nomination.fileUrl && (
                <a href={nomination.fileUrl.startsWith('http') ? nomination.fileUrl : `${config.apiUrl}${nomination.fileUrl}`} target="_blank" rel="noopener noreferrer" className="block group">
                  <div className="bg-gradient-to-br from-[#d4af37]/20 to-[#020817] border border-[#d4af37]/30 p-5 rounded-2xl hover:shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-all duration-300 transform group-hover:-translate-y-1">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#d4af37]/20 flex items-center justify-center text-[#d4af37] group-hover:scale-110 transition-transform">
                        <FileText size={20} />
                      </div>
                      <div>
                        <div className="text-[8px] font-black uppercase tracking-[0.3em] text-[#d4af37]/60">Supporting Document</div>
                        <div className="text-xs font-black text-[#d4af37] mt-1">Download PDF</div>
                      </div>
                    </div>
                  </div>
                </a>
              )}
            </div>
          </div>

          {/* Remarks */}
          <div className="mt-5 grid md:grid-cols-2 gap-5">
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl shadow-sm">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-3">Included Message</h3>
              <p className="text-xs italic text-white/70 leading-relaxed">"{nomination.message || 'No message provided.'}"</p>
            </div>
            <div className="bg-red-500/5 border border-red-500/20 p-5 rounded-2xl shadow-sm">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-400 mb-3 flex items-center gap-2">⚠️ Internal Notes</h3>
              <p className="text-xs italic text-red-400/80 leading-relaxed">{nomination.adminRemark || 'System: No internal logs for this entity.'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
