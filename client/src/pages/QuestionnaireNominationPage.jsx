import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Award,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  HelpCircle,
  XCircle,
  RotateCcw,
  Loader2,
  Globe,
  Sparkles,
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { useSubmitQuestionnaireNominationMutation } from '../store/apiSlice';

const EDITIONS = [
  {
    id: 'US Edition (18 Nov, Washington D.C., USA)',
    title: 'US Edition',
    subtitle: '18 Nov, Washington D.C., USA',
    icon: '🇺🇸',
    desc: 'International Gala & Global Leadership Recognition at Washington D.C.'
  },
  {
    id: 'UAE Edition (Dubai, UAE)',
    title: 'UAE Edition',
    subtitle: 'Dubai, UAE',
    icon: '🇦🇪',
    desc: 'Middle East Executive Conclave & Global Business Honours in Dubai.'
  },
  {
    id: 'India Edition (New Delhi, India)',
    title: 'India Edition',
    subtitle: 'New Delhi, India',
    icon: '🇮🇳',
    desc: 'National Excellence Conclave & Brand PR Gala in New Delhi.'
  }
];

export default function QuestionnaireNominationPage() {
  const { userInfo } = useSelector((state) => state.auth);

  // Step state:
  // 'q1' -> 'q2' -> 'q3' -> 'q4_redirect' -> 'q5' -> 'dossier' -> 'exit' -> 'success'
  const [currentStep, setCurrentStep] = useState('q1');

  // Answers State
  const [formData, setFormData] = useState({
    edition: '',
    hasUSVisa: 'N/A',
    itrExceeded12L: 'N/A',
    agreedToFees: null,
    applyType: 'Individual',
    nomineeName: '',
    organizationName: '',
    headName: '',
    headNumber: '',
    headEmail: '',
    contactName: '',
    contactNumber: '',
    contactEmail: '',
    website: '',
    city: '',
    state: '',
    country: 'India',
  });

  const [exitReason, setExitReason] = useState('');
  const [submittedData, setSubmittedData] = useState(null);
  const [validationError, setValidationError] = useState('');

  const [submitNomination, { isLoading }] = useSubmitQuestionnaireNominationMutation();

  // Reset form
  const handleRestart = () => {
    setFormData({
      edition: '',
      hasUSVisa: 'N/A',
      itrExceeded12L: 'N/A',
      agreedToFees: null,
      applyType: 'Individual',
      nomineeName: '',
      organizationName: '',
      headName: '',
      headNumber: '',
      headEmail: '',
      contactName: '',
      contactNumber: '',
      contactEmail: '',
      website: '',
      city: '',
      state: '',
      country: 'India',
    });
    setExitReason('');
    setValidationError('');
    setCurrentStep('q1');
  };

  // Branching: Q1 Select Edition
  const handleSelectEdition = (editionId) => {
    setFormData((prev) => ({ ...prev, edition: editionId }));
    if (editionId.startsWith('US Edition')) {
      setCurrentStep('q2');
    } else {
      // UAE or India -> proceed to Q5
      setCurrentStep('q5');
    }
  };

  // Branching: Q2 US Visa
  const handleQ2Visa = (hasVisa) => {
    setFormData((prev) => ({ ...prev, hasUSVisa: hasVisa ? 'Yes' : 'No' }));
    if (hasVisa) {
      // Yes -> proceed to Q6 (Dossier)
      setCurrentStep('dossier');
    } else {
      // No -> proceed to Q3
      setCurrentStep('q3');
    }
  };

  // Branching: Q3 ITR > 12 Lakhs
  const handleQ3ITR = (itrExceeded) => {
    setFormData((prev) => ({ ...prev, itrExceeded12L: itrExceeded ? 'Yes' : 'No' }));
    if (itrExceeded) {
      // Yes -> proceed to Q5
      setCurrentStep('q5');
    } else {
      // No -> proceed to Q4
      setCurrentStep('q4_redirect');
    }
  };

  // Branching: Q4 Not eligible for US Visa
  const handleQ4Redirect = (switchEdition) => {
    if (switchEdition) {
      // Return to Q1 to pick UAE or India
      setCurrentStep('q1');
    } else {
      // End form
      setExitReason('You chose not to participate in the Dubai or India Edition at this time.');
      setCurrentStep('exit');
    }
  };

  // Branching: Q5 Willing to pay fees for Nomination & PR
  const handleQ5Fees = (agreed) => {
    setFormData((prev) => ({ ...prev, agreedToFees: agreed }));
    if (agreed) {
      // Proceed to Q6 (Dossier)
      setCurrentStep('dossier');
    } else {
      // End form
      setExitReason('Participation requires agreement to the standard Nomination & Brand PR processing fees.');
      setCurrentStep('exit');
    }
  };

  // Submit Final Application
  const handleSubmitDossier = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!formData.nomineeName.trim()) {
      setValidationError('Nominee Name is required.');
      return;
    }
    if ((formData.applyType === 'Organization' || formData.applyType === 'Both') && !formData.organizationName.trim()) {
      setValidationError('Organization Name is required.');
      return;
    }
    if (!formData.headName.trim() || !formData.headNumber.trim() || !formData.headEmail.trim()) {
      setValidationError('Please provide complete Organization Head/Owner information.');
      return;
    }
    if (!formData.contactName.trim() || !formData.contactNumber.trim() || !formData.contactEmail.trim()) {
      setValidationError('Please provide complete Contact Person details.');
      return;
    }
    if (!formData.city.trim() || !formData.state.trim() || !formData.country.trim()) {
      setValidationError('City, State, and Country are required.');
      return;
    }

    try {
      const res = await submitNomination({
        ...formData,
        userId: userInfo?._id || undefined,
        agreedToFees: true
      }).unwrap();
      setSubmittedData(res.data);
      setCurrentStep('success');
    } catch (err) {
      console.error(err);
      setValidationError(err?.data?.message || 'Failed to submit application. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-amber-200 selection:text-slate-900">
      <Helmet>
        <title>Nomination Application Questionnaire | Prime Time Research Media</title>
        <meta name="description" content="Exclusive Edition Nomination Application Questionnaire for prestigious Global Leadership & Brand Excellence recognitions." />
      </Helmet>

      {/* Decorative ambient background accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[550px] h-[550px] bg-gradient-to-br from-amber-200/30 via-sky-100/20 to-transparent rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-tl from-indigo-100/30 via-amber-100/20 to-transparent rounded-full blur-3xl opacity-60" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 max-w-4xl mx-auto w-full px-4 py-8 sm:py-14">

        {/* Brand Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-black uppercase tracking-[0.25em] mb-4 shadow-sm">
            <Sparkles size={14} className="text-amber-600" />
            <span>Global Awards</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 uppercase">
            Nomination Form
          </h1>
          <p className="text-slate-600 font-semibold text-sm sm:text-base max-w-xl mx-auto mt-2.5">
            submit your nominations and get recognized for your achievements
          </p>
        </div>

        {/* Card Wrapper */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xl shadow-slate-200/60 backdrop-blur-sm transition-all">

          {/* STEP 1: Q1 EDITION SELECTION */}
          {currentStep === 'q1' && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="border-b border-slate-200 pb-4">
                <span className="text-amber-700 font-black text-xs uppercase tracking-widest block mb-1">
                  Question 01 of 05
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                  Which edition would you like to apply for?
                </h2>
                <p className="text-slate-600 text-xs sm:text-sm mt-1.5 font-medium">
                  Select your targeted annual flagship ceremony location.
                </p>
              </div>

              <div className="grid gap-4">
                {EDITIONS.map((ed) => (
                  <button
                    key={ed.id}
                    type="button"
                    onClick={() => handleSelectEdition(ed.id)}
                    className="w-full text-left p-5 rounded-2xl bg-slate-50/80 hover:bg-amber-50/50 border-2 border-slate-200 hover:border-amber-500 transition-all flex items-start gap-4 group cursor-pointer shadow-sm hover:shadow-md"
                  >
                    <span className="text-3xl p-3 bg-white rounded-xl flex-shrink-0 border border-slate-200 group-hover:scale-105 transition-transform shadow-sm">
                      {ed.icon}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
                          {ed.title}
                        </h3>
                        <span className="text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all">
                          <ArrowRight size={20} />
                        </span>
                      </div>
                      <p className="text-xs font-bold text-amber-700 mt-0.5">{ed.subtitle}</p>
                      <p className="text-xs text-slate-600 font-medium mt-1.5">{ed.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Q2 US VISA */}
          {currentStep === 'q2' && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="border-b border-slate-200 pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-amber-700 font-black text-xs uppercase tracking-widest block mb-1">
                    Question 02 of 05 • US Edition Qualification
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep('q1')}
                    className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <ArrowLeft size={14} /> Change Edition
                  </button>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                  Do you hold a valid US Visa?
                </h2>
                <p className="text-slate-600 text-xs sm:text-sm mt-1.5 font-medium">
                  Required for travel clearance to Washington D.C., USA for the ceremony.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleQ2Visa(true)}
                  className="p-6 rounded-2xl bg-emerald-50/70 hover:bg-emerald-100/80 border-2 border-emerald-200 hover:border-emerald-500 transition-all text-left group cursor-pointer shadow-sm hover:shadow-md"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black mb-3 border border-emerald-200 shadow-sm">
                    <CheckCircle2 size={24} />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 group-hover:text-emerald-900">
                    Yes, I hold a valid US Visa
                  </h3>
                  <p className="text-xs text-slate-600 font-medium mt-1">
                    Proceed directly to complete nomination registration.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleQ2Visa(false)}
                  className="p-6 rounded-2xl bg-slate-50 hover:bg-amber-50/40 border-2 border-slate-200 hover:border-amber-400 transition-all text-left group cursor-pointer shadow-sm hover:shadow-md"
                >
                  <div className="w-12 h-12 rounded-xl bg-white text-slate-700 flex items-center justify-center font-black mb-3 border border-slate-200 shadow-sm">
                    <HelpCircle size={24} />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 group-hover:text-amber-900">
                    No, I do not hold a US Visa
                  </h3>
                  <p className="text-xs text-slate-600 font-medium mt-1">
                    Proceed to secondary visa eligibility evaluation.
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Q3 ITR QUALIFICATION */}
          {currentStep === 'q3' && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="border-b border-slate-200 pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-amber-700 font-black text-xs uppercase tracking-widest block mb-1">
                    Question 03 of 05 • Financial Verification
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep('q2')}
                    className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <ArrowLeft size={14} /> Back
                  </button>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                  Has your annual Income Tax Return (ITR) exceeded ₹12 Lakhs for the past 3 consecutive years?
                </h2>
                <p className="text-slate-600 text-xs sm:text-sm mt-1.5 font-medium">
                  This financial benchmark assists in visa processing and business travel facilitation.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleQ3ITR(true)}
                  className="p-6 rounded-2xl bg-emerald-50/70 hover:bg-emerald-100/80 border-2 border-emerald-200 hover:border-emerald-500 transition-all text-left group cursor-pointer shadow-sm hover:shadow-md"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black mb-3 border border-emerald-200 shadow-sm">
                    <CheckCircle2 size={24} />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 group-hover:text-emerald-900">
                    Yes, Exceeded ₹12 Lakhs
                  </h3>
                  <p className="text-xs text-slate-600 font-medium mt-1">
                    I meet the consecutive 3-year financial criteria.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleQ3ITR(false)}
                  className="p-6 rounded-2xl bg-slate-50 hover:bg-amber-50/40 border-2 border-slate-200 hover:border-amber-400 transition-all text-left group cursor-pointer shadow-sm hover:shadow-md"
                >
                  <div className="w-12 h-12 rounded-xl bg-white text-slate-700 flex items-center justify-center font-black mb-3 border border-slate-200 shadow-sm">
                    <XCircle size={24} />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 group-hover:text-amber-900">
                    No, Below ₹12 Lakhs
                  </h3>
                  <p className="text-xs text-slate-600 font-medium mt-1">
                    I do not meet the consecutive 3-year threshold.
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Q4 REDIRECT TO DUBAI / INDIA */}
          {currentStep === 'q4_redirect' && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="border-b border-slate-200 pb-4">
                <span className="text-amber-700 font-black text-xs uppercase tracking-widest block mb-1">
                  Question 04 • Edition Reassignment
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                  You are currently not eligible for a US Visa. Would you like to participate in the Dubai or India Edition instead?
                </h2>
                <p className="text-slate-600 text-xs sm:text-sm mt-1.5 font-medium">
                  Both UAE and India editions offer equal global honours and comprehensive PR benefits.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleQ4Redirect(true)}
                  className="p-6 rounded-2xl bg-sky-50 hover:bg-sky-100/80 border-2 border-sky-200 hover:border-sky-500 transition-all text-left group cursor-pointer shadow-sm hover:shadow-md"
                >
                  <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-black mb-3 border border-sky-200 shadow-sm">
                    <Globe size={24} />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 group-hover:text-sky-900">
                    Yes, Apply for Dubai / India
                  </h3>
                  <p className="text-xs text-slate-600 font-medium mt-1">
                    Switch to Dubai or New Delhi edition and proceed.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleQ4Redirect(false)}
                  className="p-6 rounded-2xl bg-slate-50 hover:bg-red-50/60 border-2 border-slate-200 hover:border-red-400 transition-all text-left group cursor-pointer shadow-sm hover:shadow-md"
                >
                  <div className="w-12 h-12 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-black mb-3 border border-red-200 shadow-sm">
                    <XCircle size={24} />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 group-hover:text-red-900">
                    No, End Application
                  </h3>
                  <p className="text-xs text-slate-600 font-medium mt-1">
                    Exit application questionnaire at this time.
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Q5 FEE AGREEMENT */}
          {currentStep === 'q5' && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="border-b border-slate-200 pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-amber-700 font-black text-xs uppercase tracking-widest block mb-1">
                    Question 05 • Commercial Agreement
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep('q1')}
                    className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <ArrowLeft size={14} /> Back
                  </button>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                  Are you willing to pay the required fees for Nomination &amp; PR?
                </h2>
                <p className="text-slate-600 text-xs sm:text-sm mt-1.5 font-medium">
                  Includes jury evaluation, executive profiling, media telecast, trophies, and digital branding assets.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleQ5Fees(true)}
                  className="p-5 sm:p-6 rounded-2xl bg-emerald-50/70 hover:bg-emerald-100/80 border-2 border-emerald-200 hover:border-emerald-500 transition-all text-left group cursor-pointer shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black border border-emerald-200 shadow-xs flex-shrink-0">
                      <CheckCircle2 size={22} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 group-hover:text-emerald-900 leading-none">
                      Yes
                    </h3>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-600 font-medium leading-relaxed pl-0.5">
                    I am willing to pay the required fees.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleQ5Fees(false)}
                  className="p-5 sm:p-6 rounded-2xl bg-slate-50 hover:bg-red-50/60 border-2 border-slate-200 hover:border-red-400 transition-all text-left group cursor-pointer shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className="w-11 h-11 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-black border border-red-200 shadow-xs flex-shrink-0">
                      <XCircle size={22} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 group-hover:text-red-900 leading-none">
                      No
                    </h3>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-600 font-medium leading-relaxed pl-0.5">
                    I am not willing to pay the required fees.
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: DOSSIER FORM (Q6 - Q15) */}
          {currentStep === 'dossier' && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="border-b border-slate-200 pb-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-emerald-700 font-black text-xs uppercase tracking-widest block mb-1">
                    Eligible Candidate • Complete Registration
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-sm">
                    {formData.edition}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                  Applicant Dossier &amp; Contact Information
                </h2>
                <p className="text-slate-600 text-xs sm:text-sm mt-1.5 font-medium">
                  Please provide accurate verification details for executive committee review.
                </p>
              </div>

              {validationError && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold shadow-sm">
                  ⚠️ {validationError}
                </div>
              )}

              <form onSubmit={handleSubmitDossier} className="space-y-6">
                {/* Q6: How would you like to apply? */}
                <div>
                  <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-2">
                    Q6. How would you like to apply? *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['Individual', 'Organization', 'Both'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({ ...formData, applyType: type })}
                        className={`py-3 px-4 rounded-xl font-bold text-xs transition-all cursor-pointer border-2 ${formData.applyType === type
                          ? 'bg-amber-50 border-amber-500 text-amber-950 font-black shadow-sm ring-1 ring-amber-400'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Q7 & Q8: Nominee and Organization */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
                      Q7. Nominee Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Rajesh Kumar"
                      value={formData.nomineeName}
                      onChange={(e) => setFormData({ ...formData, nomineeName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 shadow-sm transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
                      Q8. Organization Name {formData.applyType !== 'Individual' ? '*' : '(Optional)'}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Acme Healthcorp Global"
                      value={formData.organizationName}
                      onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 shadow-sm transition-all"
                    />
                  </div>
                </div>

                {/* Leadership: Q9, Q10, Q11 */}
                <div className="bg-slate-50/80 border border-slate-200 p-5 rounded-2xl space-y-4 shadow-sm">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <User size={15} className="text-amber-600" /> Organization Head / Owner Details
                  </h3>
                  <div className="grid sm:grid-cols-3 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Q9. Head / Owner Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Full Name"
                        value={formData.headName}
                        onChange={(e) => setFormData({ ...formData, headName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Q10. Head Mobile Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={formData.headNumber}
                        onChange={(e) => setFormData({ ...formData, headNumber: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Q11. Head Email *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="head@company.com"
                        value={formData.headEmail}
                        onChange={(e) => setFormData({ ...formData, headEmail: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Primary Contact: Q12, Q13, Q14 */}
                <div className="bg-slate-50/80 border border-slate-200 p-5 rounded-2xl space-y-4 shadow-sm">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <Phone size={15} className="text-sky-600" /> Primary Contact Person
                  </h3>
                  <div className="grid sm:grid-cols-3 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Q12. Contact Person Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contact Name"
                        value={formData.contactName}
                        onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Q13. Contact Mobile Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={formData.contactNumber}
                        onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Q14. Contact Email *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="contact@company.com"
                        value={formData.contactEmail}
                        onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Location & Web: Q15 */}
                <div className="grid sm:grid-cols-4 gap-3.5">
                  <div className="sm:col-span-1">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Q15. Website
                    </label>
                    <input
                      type="text"
                      placeholder="www.company.com"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mumbai"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Maharashtra"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Country *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. India"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 shadow-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setCurrentStep('q1')}
                    className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer border border-slate-300"
                  >
                    ← Review Answers
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading && <Loader2 size={16} className="animate-spin" />}
                    <span>Submit Official Nomination</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP: EXIT SCREEN (DISQUALIFIED OR WITHDREW) */}
          {currentStep === 'exit' && (
            <div className="text-center py-10 space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mx-auto border border-slate-300 shadow-sm">
                <XCircle size={32} />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-2xl font-black text-slate-900">Application Concluded</h3>
                <p className="text-slate-600 text-xs sm:text-sm mt-2 leading-relaxed font-medium">
                  {exitReason || 'Thank you for your interest in Prime Time Research Media awards. Your application has concluded.'}
                </p>
                <p className="text-slate-500 text-xs mt-3">
                  For customized corporate sponsorships or future edition inquiries, please contact our secretarial board.
                </p>
              </div>
              <div className="flex items-center justify-center gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleRestart}
                  className="px-6 py-2.5 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs hover:bg-amber-200 transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <RotateCcw size={14} />
                  <span>Restart Questionnaire</span>
                </button>
                <a
                  href="/"
                  className="px-6 py-2.5 rounded-xl bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Return to Homepage
                </a>
              </div>
            </div>
          )}

          {/* STEP: SUCCESS CONFIRMATION */}
          {currentStep === 'success' && (
            <div className="text-center py-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-300 shadow-lg shadow-emerald-500/10">
                <CheckCircle2 size={36} />
              </div>
              <div className="max-w-lg mx-auto">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200 inline-block mb-2 font-mono">
                  Dossier Logged Successfully
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">
                  Nomination Received
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm mt-2 leading-relaxed font-medium">
                  Thank you, <span className="font-bold text-slate-900">{submittedData?.nomineeName}</span>. Your application for <span className="font-bold text-amber-700">{submittedData?.edition}</span> has been securely entered into the jury evaluation queue.
                </p>
              </div>

              {/* Summary Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 max-w-md mx-auto text-left text-xs space-y-2 shadow-sm">
                <div className="flex justify-between py-1.5 border-b border-slate-200">
                  <span className="text-slate-500 font-bold">Edition:</span>
                  <span className="text-slate-900 font-bold">{submittedData?.edition}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-200">
                  <span className="text-slate-500 font-bold">Category:</span>
                  <span className="text-slate-900 font-bold">{submittedData?.applyType}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-200">
                  <span className="text-slate-500 font-bold">Contact Email:</span>
                  <span className="text-slate-900 font-bold">{submittedData?.contactEmail}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500 font-bold">Reference Token:</span>
                  <span className="text-amber-700 font-mono font-black">{submittedData?._id?.slice(-8)?.toUpperCase()}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                <Link
                  to="/profile?tab=nominations"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Award size={14} />
                  <span>View in My Nominations</span>
                </Link>
                <button
                  type="button"
                  onClick={handleRestart}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Submit Another
                </button>
                <Link
                  to="/"
                  className="px-5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          )}

        </div>

        {/* Footer Guarantee */}
        <div className="mt-8 text-center text-xs text-slate-500 font-medium flex items-center justify-center gap-2">
          <ShieldCheck size={16} className="text-amber-600" />
          <span>Prime Time Research Media Private Limited • Strictly Confidential Jury Process</span>
        </div>
      </div>
    </div>
  );
}
