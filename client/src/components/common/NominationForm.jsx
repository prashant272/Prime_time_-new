import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { useSubmitNominationMutation, useGetNominationSettingsQuery } from '../../store/apiSlice';
import categoryMap from '../../data/categoryMap';

const WANT_TO_OPTIONS = [
  'Nominate for Awards',
  'Speak at the Summit',
  'Exhibit at the Show',
  'Attend the Conference'
];

const REFERRED_BY_OPTIONS = [
  'Heena',
  'Jaya',
  'Mahima',
  'Renu',
  'Urmila',
  'Arti',
  'Vishal',
  'Kajal',
  'Nandini',
  'Other'
];

const NominationForm = () => {
  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm({
    defaultValues: {
      registrationType: 'organisation',
      termsAccepted: false
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' or 'error'
  const [errorMessage, setErrorMessage] = useState('');

  const [submitNomination] = useSubmitNominationMutation();
  const { data: settings, isLoading: isSettingsLoading } = useGetNominationSettingsQuery();

  const awardName = watch('awardName');
  const [categoryPath, setCategoryPath] = useState([]);
  const [selectedEditions, setSelectedEditions] = useState([]);

  const toggleEdition = (edition) => {
    setSelectedEditions(prev => 
      prev.includes(edition) 
        ? prev.filter(e => e !== edition)
        : [...prev, edition]
    );
  };

  // When Award Name changes, reset
  useEffect(() => {
    setSelectedEditions([]);
    setCategoryPath([]);
  }, [awardName]);

  const handleCategoryChange = (levelIndex, val) => {
    setCategoryPath(prev => {
      const newPath = prev.slice(0, levelIndex);
      if (val) {
        newPath.push(val);
      }
      return newPath;
    });
  };

  const getDropdownData = () => {
    if (!awardName || !categoryMap[awardName]) return [];
    
    let currentNode = categoryMap[awardName];
    const dropdowns = [];
    
    // Level 0
    dropdowns.push({
      options: Array.isArray(currentNode) ? currentNode : Object.keys(currentNode),
      selectedValue: categoryPath[0] || '',
      levelIndex: 0
    });

    // Deeper levels
    for (let i = 0; i < categoryPath.length; i++) {
      const selectedKey = categoryPath[i];
      if (!selectedKey) break;

      if (!Array.isArray(currentNode) && currentNode[selectedKey]) {
        currentNode = currentNode[selectedKey];
        dropdowns.push({
          options: Array.isArray(currentNode) ? currentNode : Object.keys(currentNode),
          selectedValue: categoryPath[i + 1] || '',
          levelIndex: i + 1
        });
      } else {
        break;
      }
    }

    return dropdowns;
  };

  const dropdownData = getDropdownData();

  // Watch fields
  const registrationType = watch('registrationType');
  const selectedFile = watch('file');

  const onSubmit = async (data) => {
    if (selectedEditions.length === 0) {
      setSubmitStatus('error');
      setErrorMessage('Please select at least one edition.');
      return;
    }

    if (dropdownData.length > 0 && categoryPath.length !== dropdownData.length) {
      setSubmitStatus('error');
      setErrorMessage('Please completely fill out the Category selection.');
      return;
    }

    try {
      setSubmitStatus('submitting');
      setErrorMessage('');

      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (key !== 'file' && data[key] !== undefined && data[key] !== '' && key !== 'edition') {
          formData.append(key, data[key]);
        }
      });

      // Append multi-select editions
      selectedEditions.forEach(ed => {
        formData.append('edition', ed);
      });

      // Append category path array
      categoryPath.forEach(p => {
        formData.append('categoryPath', p);
      });

      if (data.file && data.file.length > 0) {
        formData.append('file', data.file[0]);
      }

      await submitNomination(formData).unwrap();

      setSubmitStatus('success');
      reset();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Submission failed:', error);
      setSubmitStatus('error');
      setErrorMessage(error.data?.message || 'An error occurred while submitting your nomination. Please try again.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full px-4 py-3.5 rounded-xl border-2 border-slate-200/80 text-slate-900 focus:border-[#15b7b9] focus:ring-4 focus:ring-[#15b7b9]/15 outline-none transition-all bg-white shadow-sm font-bold placeholder:text-slate-400 placeholder:font-medium text-[15px]";
  const labelClass = "block text-[11px] font-black text-slate-800 mb-2.5 uppercase tracking-widest";
  const errorClass = "text-red-500 text-[11px] font-bold uppercase tracking-widest mt-2";

  if (submitStatus === 'success') {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center max-w-2xl mx-auto border border-sky-100">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Nomination Received!</h2>
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          Thank you for submitting your nomination. We have successfully received your details. Our team will evaluate your submission and get back to you soon.
        </p>
        <button
          onClick={() => setSubmitStatus(null)}
          className="px-8 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-full font-bold transition-all"
        >
          Submit Another Nomination
        </button>
      </div>
    );
  }

  // Helper labels
  const getDropdownLabel = (levelIndex, totalLevels) => {
    if (levelIndex === totalLevels - 1) {
      return `Select Subcategory *`;
    }
    if (levelIndex === 0 && totalLevels === 4) return "Select Sector *";
    if (levelIndex === 1 && totalLevels === 4) return "Select Segment *";
    if (levelIndex === 2 && totalLevels === 4) return "Select Subcategory *";
    
    if (levelIndex === 0 && totalLevels === 2) return "Select Core Focus Area *";

    return `Select Level ${levelIndex + 1} *`;
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-12 border border-slate-100">
      {submitStatus === 'error' && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-start gap-3 border border-red-200 mb-8">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="font-medium">{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* I Want To Selection */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
          <label className={`${labelClass} text-lg mb-3`}>I Want To *</label>
          <select
            className={`${inputClass} text-lg font-semibold py-3 ${errors.wantTo ? 'border-red-500' : ''}`}
            {...register('wantTo', { required: 'Please select your intent' })}
          >
            <option value="">-Please choose an option-</option>
            {WANT_TO_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          {errors.wantTo && <p className={errorClass}>{errors.wantTo.message}</p>}
        </div>

        {/* Section: Category Selection */}
        <div className="bg-slate-50/70 p-6 md:p-8 rounded-2xl border border-slate-100 space-y-6">
          <h3 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-4 mb-2">
            1. Select Event
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className={labelClass}>Select Award / Event Name *</label>
              {isSettingsLoading ? (
                <div className="p-3 bg-slate-100 animate-pulse rounded-xl text-sm font-bold text-slate-500">Loading awards...</div>
              ) : (
                <select
                  className={`${inputClass} ${errors.awardName ? 'border-red-500' : ''}`}
                  {...register('awardName', { required: 'Please select an award' })}
                >
                  <option value="">-Please choose an award-</option>
                  {Object.keys(categoryMap).map((awardKey, idx) => (
                    <option key={idx} value={awardKey}>{awardKey}</option>
                  ))}
                </select>
              )}
              {errors.awardName && <p className={errorClass}>{errors.awardName.message}</p>}
            </div>

            {awardName && (
              <div className="md:col-span-2 bg-white p-5 rounded-xl border border-slate-200">
                <label className={labelClass}>Select Editions (You can choose multiple) *</label>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                  {Array.from(new Set(settings?.categories?.filter(c => c.categoryName === awardName)?.flatMap(c => c.awards) || [])).map((award, idx) => (
                    <label key={idx} className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${selectedEditions.includes(award) ? 'border-sky-500 bg-sky-50' : 'border-slate-100 hover:border-slate-300'}`}>
                      <input 
                        type="checkbox" 
                        className="mt-1 w-4 h-4 text-sky-600 focus:ring-sky-500 rounded flex-shrink-0"
                        checked={selectedEditions.includes(award)}
                        onChange={() => toggleEdition(award)}
                      />
                      <span className={`text-sm font-bold leading-tight ${selectedEditions.includes(award) ? 'text-sky-900' : 'text-slate-700'}`}>{award}</span>
                    </label>
                  ))}
                  {(!settings?.categories?.some(c => c.categoryName === awardName && c.awards?.length > 0)) && (
                    <p className="text-sm text-slate-500 font-medium italic">Edition coming soon.</p>
                  )}
                </div>
                {(settings?.categories?.some(c => c.categoryName === awardName && c.awards?.length > 0) && selectedEditions.length === 0) && (
                  <p className="text-red-500 text-[11px] font-bold uppercase tracking-widest mt-3">Please select at least one edition.</p>
                )}
              </div>
            )}

            {/* Dynamic Category Dropdowns */}
            {(watch('wantTo') === 'Nominate for Awards' && dropdownData.length > 0) && (
              <div className="md:col-span-2 grid md:grid-cols-2 lg:grid-cols-3 gap-4 bg-sky-50/50 p-5 rounded-xl border border-sky-100 mt-2">
                <div className="md:col-span-2 lg:col-span-3 pb-2 border-b border-sky-200/50">
                  <h4 className="text-sm font-bold text-sky-800">Select Award Categories</h4>
                  <p className="text-xs text-sky-600/80 mt-1">Please specify the exact category you are nominating for.</p>
                </div>
                {dropdownData.map((dd, idx) => (
                  <div key={idx}>
                    <label className={labelClass}>{getDropdownLabel(dd.levelIndex, dropdownData.length)}</label>
                    <select
                      className={inputClass}
                      value={dd.selectedValue}
                      onChange={(e) => handleCategoryChange(dd.levelIndex, e.target.value)}
                      required
                    >
                      <option value="">-Select Option-</option>
                      {dd.options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className={labelClass}>Select your Registration type *</label>
            <div className="flex gap-6 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="organisation"
                  className="w-4 h-4 text-sky-600 focus:ring-sky-500"
                  {...register('registrationType')}
                />
                <span className="text-gray-700 font-medium">Organisation</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="individual"
                  className="w-4 h-4 text-sky-600 focus:ring-sky-500"
                  {...register('registrationType')}
                />
                <span className="text-gray-700 font-medium">Individual</span>
              </label>
            </div>
          </div>
        </div>

        {/* Section: Basic Details */}
        <div className="bg-slate-50/70 p-6 md:p-8 rounded-2xl border border-slate-100 space-y-6">
          <h3 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-4 mb-2">2. Entity Details</h3>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Nominee Name *</label>
              <input
                type="text"
                placeholder="Enter nominee name"
                className={`${inputClass} ${errors.nomineeName ? 'border-red-500' : ''}`}
                {...register('nomineeName', { required: 'Nominee name is required' })}
              />
              {errors.nomineeName && <p className={errorClass}>{errors.nomineeName.message}</p>}
            </div>

            {registrationType === 'organisation' && (
              <div>
                <label className={labelClass}>Organization/Clinic/Hospital Name *</label>
                <input
                  type="text"
                  placeholder="Enter organization name"
                  className={`${inputClass} ${errors.organizationName ? 'border-red-500' : ''}`}
                  {...register('organizationName', { required: 'Organization name is required' })}
                />
                {errors.organizationName && <p className={errorClass}>{errors.organizationName.message}</p>}
              </div>
            )}
          </div>
        </div>

        {/* Section: Head Details */}
        <div className="bg-slate-50/70 p-6 md:p-8 rounded-2xl border border-slate-100 space-y-6">
          <h3 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-4 mb-2">3. Head of Organization Details</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Head Name *</label>
              <input
                type="text"
                placeholder="Enter head name"
                className={`${inputClass} ${errors.headName ? 'border-red-500' : ''}`}
                {...register('headName', { required: 'Head name is required' })}
              />
              {errors.headName && <p className={errorClass}>{errors.headName.message}</p>}
            </div>

            <div>
              <label className={labelClass}>Head Designation *</label>
              <input
                type="text"
                placeholder="Enter head designation"
                className={`${inputClass} ${errors.headDesignation ? 'border-red-500' : ''}`}
                {...register('headDesignation', { required: 'Head designation is required' })}
              />
              {errors.headDesignation && <p className={errorClass}>{errors.headDesignation.message}</p>}
            </div>

            <div>
              <label className={labelClass}>Head Email Address *</label>
              <input
                type="email"
                placeholder="Enter head email"
                className={`${inputClass} ${errors.headEmail ? 'border-red-500' : ''}`}
                {...register('headEmail', { 
                  required: 'Head email is required',
                  pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email address" }
                })}
              />
              {errors.headEmail && <p className={errorClass}>{errors.headEmail.message}</p>}
            </div>

            <div>
              <label className={labelClass}>Head Mobile Number *</label>
              <input
                type="tel"
                placeholder="Enter head mobile number"
                className={`${inputClass} ${errors.headMobile ? 'border-red-500' : ''}`}
                {...register('headMobile', { required: 'Head mobile is required' })}
              />
              {errors.headMobile && <p className={errorClass}>{errors.headMobile.message}</p>}
            </div>
          </div>
        </div>

        {/* Section: Contact Person Details */}
        <div className="bg-slate-50/70 p-6 md:p-8 rounded-2xl border border-slate-100 space-y-6">
          <h3 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-4 mb-2">4. Primary Contact Person Details</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Contact Person Name *</label>
              <input
                type="text"
                placeholder="Enter contact person name"
                className={`${inputClass} ${errors.contactName ? 'border-red-500' : ''}`}
                {...register('contactName', { required: 'Contact name is required' })}
              />
              {errors.contactName && <p className={errorClass}>{errors.contactName.message}</p>}
            </div>

            <div>
              <label className={labelClass}>Contact Person Designation *</label>
              <input
                type="text"
                placeholder="Enter contact designation"
                className={`${inputClass} ${errors.contactDesignation ? 'border-red-500' : ''}`}
                {...register('contactDesignation', { required: 'Contact designation is required' })}
              />
              {errors.contactDesignation && <p className={errorClass}>{errors.contactDesignation.message}</p>}
            </div>

            <div>
              <label className={labelClass}>Contact Mobile Number *</label>
              <input
                type="tel"
                placeholder="Enter contact mobile number"
                className={`${inputClass} ${errors.contactMobile ? 'border-red-500' : ''}`}
                {...register('contactMobile', { required: 'Contact mobile is required' })}
              />
              {errors.contactMobile && <p className={errorClass}>{errors.contactMobile.message}</p>}
            </div>

            <div>
              <label className={labelClass}>Contact Email Address *</label>
              <input
                type="email"
                placeholder="Enter contact email"
                className={`${inputClass} ${errors.contactEmail ? 'border-red-500' : ''}`}
                {...register('contactEmail', { 
                  required: 'Contact email is required',
                  pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email address" }
                })}
              />
              {errors.contactEmail && <p className={errorClass}>{errors.contactEmail.message}</p>}
            </div>
          </div>
        </div>

        {/* Section: Additional Details */}
        <div className="bg-slate-50/70 p-6 md:p-8 rounded-2xl border border-slate-100 space-y-6">
          <h3 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-4 mb-2">5. Additional Details</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Website/Social Media Link</label>
              <input
                type="url"
                placeholder="https://example.com"
                className={inputClass}
                {...register('website')}
              />
            </div>

            {registrationType === 'organisation' && (
              <div>
                <label className={labelClass}>Annual Turnover/Revenue</label>
                <input
                  type="text"
                  placeholder="Enter annual turnover"
                  className={inputClass}
                  {...register('turnover')}
                />
              </div>
            )}
            
            <div className="md:col-span-2">
              <label className={labelClass}>Profile/Work File (PDF, DOC, DOCX - Max 5MB)</label>
              <div className="mt-2 flex justify-center rounded-xl border-2 border-dashed border-slate-300 px-6 py-8 hover:border-sky-500 hover:bg-sky-50/50 transition-colors bg-white">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-slate-300" aria-hidden="true" />
                  <div className="mt-4 flex text-sm leading-6 text-slate-600 justify-center">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md bg-white font-semibold text-sky-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-sky-600 focus-within:ring-offset-2 hover:text-sky-500 px-2"
                    >
                      <span>Upload a file</span>
                      <input id="file-upload" type="file" className="sr-only" accept=".pdf,.doc,.docx" {...register('file')} />
                    </label>
                  </div>
                  <p className="text-xs leading-5 text-slate-500 mt-2">
                    {selectedFile?.[0] ? (
                      <span className="font-medium text-sky-600">{selectedFile[0].name}</span>
                    ) : (
                      "PDF, DOC up to 5MB"
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Address */}
        <div className="bg-slate-50/70 p-6 md:p-8 rounded-2xl border border-slate-100 space-y-6">
          <h3 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-4 mb-2">6. Address</h3>
          
          <div>
            <label className={labelClass}>Street Address *</label>
            <input
              type="text"
              placeholder="Enter street address"
              className={`${inputClass} ${errors.streetAddress ? 'border-red-500' : ''}`}
              {...register('streetAddress', { required: 'Street address is required' })}
            />
            {errors.streetAddress && <p className={errorClass}>{errors.streetAddress.message}</p>}
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className={labelClass}>City *</label>
              <input
                type="text"
                placeholder="Enter city"
                className={`${inputClass} ${errors.city ? 'border-red-500' : ''}`}
                {...register('city', { required: 'City is required' })}
              />
              {errors.city && <p className={errorClass}>{errors.city.message}</p>}
            </div>

            <div>
              <label className={labelClass}>State/Province *</label>
              <input
                type="text"
                placeholder="Enter state"
                className={`${inputClass} ${errors.state ? 'border-red-500' : ''}`}
                {...register('state', { required: 'State is required' })}
              />
              {errors.state && <p className={errorClass}>{errors.state.message}</p>}
            </div>

            <div>
              <label className={labelClass}>ZIP/Postal Code *</label>
              <input
                type="text"
                placeholder="Enter ZIP code"
                className={`${inputClass} ${errors.zipCode ? 'border-red-500' : ''}`}
                {...register('zipCode', { required: 'ZIP code is required' })}
              />
              {errors.zipCode && <p className={errorClass}>{errors.zipCode.message}</p>}
            </div>
          </div>
        </div>

        {/* Section: Final Details */}
        <div className="bg-slate-50/70 p-6 md:p-8 rounded-2xl border border-slate-100 space-y-6">
          <h3 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-4 mb-2">7. Final Details</h3>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className={labelClass}>Referred By *</label>
              <select
                className={`${inputClass} ${errors.referredBy ? 'border-red-500' : ''}`}
                {...register('referredBy', { required: 'Please select an option' })}
              >
                <option value="">-Please choose an option-</option>
                {REFERRED_BY_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              {errors.referredBy && <p className={errorClass}>{errors.referredBy.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Your Message / Reason for Nomination</label>
              <textarea
                rows={4}
                placeholder="Tell us why you are nominating this person or organization..."
                className={`${inputClass} resize-none`}
                {...register('message')}
              />
            </div>
          </div>
        </div>

        {/* Terms and Submit */}
        <div className="space-y-6 px-2">
          <div className="flex items-start">
            <div className="flex items-center h-6">
              <input
                id="terms"
                type="checkbox"
                className="w-5 h-5 text-[#15b7b9] focus:ring-[#15b7b9] border-gray-300 rounded cursor-pointer"
                {...register('termsAccepted', { required: 'You must accept the terms and conditions' })}
              />
            </div>
            <div className="ml-3">
              <label htmlFor="terms" className="text-sm font-medium text-slate-700">
                I accept the <a href="/terms" className="text-sky-600 hover:underline">Terms and Conditions</a> and <a href="/privacy" className="text-sky-600 hover:underline">Privacy Policy</a>
              </label>
              {errors.termsAccepted && <p className={errorClass}>{errors.termsAccepted.message}</p>}
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full md:w-auto px-12 py-4 bg-[#15b7b9] hover:bg-[#129ea0] text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit Nomination</span>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NominationForm;
