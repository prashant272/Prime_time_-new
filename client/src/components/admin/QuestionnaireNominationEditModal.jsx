import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useUpdateQuestionnaireNominationMutation } from '../../store/apiSlice';

export default function QuestionnaireNominationEditModal({ nomination, onClose, onSave }) {
  const [formData, setFormData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (nomination) {
      setFormData({ ...nomination });
    } else {
      setFormData(null);
    }
  }, [nomination]);

  const [updateNomination] = useUpdateQuestionnaireNominationMutation();

  if (!nomination || !formData) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSaving(true);
    try {
      const response = await updateNomination({ id: formData._id, data: formData }).unwrap();
      setSuccess('Questionnaire nomination successfully updated!');
      setTimeout(() => {
        if (onSave) onSave(response.data);
      }, 1200);
    } catch (err) {
      setError(err?.data?.message || err?.message || 'Failed to update questionnaire nomination');
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = "w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all font-semibold shadow-xs";
  const selectClass = "w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all font-bold appearance-none shadow-xs";

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[9999] p-4 sm:p-8" onClick={onClose}>
      <div
        className="bg-white border border-slate-200 shadow-2xl p-6 sm:p-8 rounded-[2rem] max-w-5xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative z-50">
          {/* Close button */}
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

          <div className="mb-8 border-b border-slate-200 pb-6 pr-12">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-2.5 w-2.5 bg-amber-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-800">Administrative Edit</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight uppercase leading-none">
              Edit <span className="text-amber-700">Questionnaire Dossier</span>
            </h2>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-xs font-bold uppercase tracking-widest px-4 py-3 rounded-xl flex items-center gap-3 shadow-xs">
              <span>⚠️</span> {error}
            </div>
          )}

          {success && (
            <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-widest px-4 py-3 rounded-xl flex items-center gap-3 shadow-xs">
              <span>✅</span> {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-5">
              
              {/* Target Edition & Applicant Classification */}
              <div className="space-y-4 bg-slate-50 border border-slate-200 p-6 rounded-2xl shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2 flex items-center gap-2">
                  <span className="p-1 bg-amber-100 text-amber-800 rounded text-xs">🏛️</span> Edition &amp; Classification
                </h3>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 block mb-1.5">Edition</label>
                  <select name="edition" value={formData.edition || ''} onChange={handleChange} className={selectClass}>
                    <option value="US Edition (18 Nov, Washington D.C., USA)">US Edition (18 Nov, Washington D.C., USA)</option>
                    <option value="UAE Edition (Dubai, UAE)">UAE Edition (Dubai, UAE)</option>
                    <option value="India Edition (New Delhi, India)">India Edition (New Delhi, India)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 block mb-1.5">Apply Type</label>
                  <select name="applyType" value={formData.applyType || 'Individual'} onChange={handleChange} className={selectClass}>
                    <option value="Individual">Individual</option>
                    <option value="Organization">Organization</option>
                    <option value="Both">Both (Individual &amp; Organization)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 block mb-1.5">Nominee Name</label>
                  <input type="text" name="nomineeName" value={formData.nomineeName || ''} onChange={handleChange} required className={inputClass} />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 block mb-1.5">Organization / Entity Name</label>
                  <input type="text" name="organizationName" value={formData.organizationName || ''} onChange={handleChange} className={inputClass} />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 block mb-1.5">Website / URL</label>
                  <input type="text" name="website" value={formData.website || ''} onChange={handleChange} placeholder="https://..." className={inputClass} />
                </div>
              </div>

              {/* Status & Eligibility Checks */}
              <div className="space-y-4 bg-slate-50 border border-slate-200 p-6 rounded-2xl shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2 flex items-center gap-2">
                  <span className="p-1 bg-sky-100 text-sky-800 rounded text-xs">⚖️</span> Status &amp; Checks
                </h3>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 block mb-1.5">Workflow Status</label>
                  <select name="status" value={formData.status || 'NOMINATION RECEIVED'} onChange={handleChange} className={selectClass}>
                    <option value="NOMINATION RECEIVED">NOMINATION RECEIVED</option>
                    <option value="UNDER EVALUATION">UNDER EVALUATION</option>
                    <option value="IN PROGRESS (SHORTLISTED)">IN PROGRESS (SHORTLISTED)</option>
                    <option value="SELECTED (WINNER)">SELECTED (WINNER)</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 block mb-1.5">Revenue / Payment Status</label>
                  <select name="paymentStatus" value={formData.paymentStatus || 'not_paid'} onChange={handleChange} className={selectClass}>
                    <option value="not_paid">Not Paid</option>
                    <option value="initial_paid">Initial Paid</option>
                    <option value="paid">Fully Paid</option>
                    <option value="not_interested">Not Interested</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 block mb-1.5">US Visa Status</label>
                    <select name="hasUSVisa" value={formData.hasUSVisa || 'N/A'} onChange={handleChange} className={selectClass}>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                      <option value="N/A">N/A</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 block mb-1.5">ITR &gt; ₹12L (3 Yrs)</label>
                    <select name="itrExceeded12L" value={formData.itrExceeded12L || 'N/A'} onChange={handleChange} className={selectClass}>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                      <option value="N/A">N/A</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 block mb-1.5">Admin Remark</label>
                  <textarea
                    name="adminRemark"
                    value={formData.adminRemark || ''}
                    onChange={handleChange}
                    rows={2}
                    className={`${inputClass} resize-none`}
                    placeholder="Internal team note..."
                  />
                </div>
              </div>

              {/* Head / Owner Details */}
              <div className="space-y-4 bg-slate-50 border border-slate-200 p-6 rounded-2xl shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2 flex items-center gap-2">
                  <span className="p-1 bg-sky-100 text-sky-800 rounded text-xs">👑</span> Organization Head / Owner
                </h3>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 block mb-1.5">Head Name</label>
                  <input type="text" name="headName" value={formData.headName || ''} onChange={handleChange} required className={inputClass} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 block mb-1.5">Head Phone Number</label>
                  <input type="text" name="headNumber" value={formData.headNumber || ''} onChange={handleChange} required className={inputClass} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 block mb-1.5">Head Email Address</label>
                  <input type="email" name="headEmail" value={formData.headEmail || ''} onChange={handleChange} required className={inputClass} />
                </div>
              </div>

              {/* Primary Contact Person & Geography */}
              <div className="space-y-4 bg-slate-50 border border-slate-200 p-6 rounded-2xl shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2 flex items-center gap-2">
                  <span className="p-1 bg-emerald-100 text-emerald-800 rounded text-xs">📞</span> Primary Contact &amp; Geography
                </h3>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 block mb-1.5">Contact Name</label>
                  <input type="text" name="contactName" value={formData.contactName || ''} onChange={handleChange} required className={inputClass} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 block mb-1.5">Contact Phone Number</label>
                  <input type="text" name="contactNumber" value={formData.contactNumber || ''} onChange={handleChange} required className={inputClass} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 block mb-1.5">Contact Email Address</label>
                  <input type="email" name="contactEmail" value={formData.contactEmail || ''} onChange={handleChange} required className={inputClass} />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 block mb-1.5">City</label>
                    <input type="text" name="city" value={formData.city || ''} onChange={handleChange} required className={inputClass} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 block mb-1.5">State</label>
                    <input type="text" name="state" value={formData.state || ''} onChange={handleChange} required className={inputClass} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 block mb-1.5">Country</label>
                    <input type="text" name="country" value={formData.country || ''} onChange={handleChange} required className={inputClass} />
                  </div>
                </div>
              </div>

            </div>

            <div className="mt-8 flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider transition-all border border-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-8 py-3 rounded-xl bg-amber-500 text-white hover:bg-amber-600 text-xs font-black uppercase tracking-widest transition-all shadow-md shadow-amber-500/20 disabled:opacity-50"
              >
                {isSaving ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}
