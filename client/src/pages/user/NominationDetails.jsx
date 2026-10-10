import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  useGetMyNominationByIdQuery,
} from '../../store/apiSlice';
import {
  ArrowLeft,
  Trophy,
  Calendar,
  Clock,
  Building,
  User,
  Briefcase,
  Mail,
  Phone,
  Globe,
  MapPin,
  FileText,
  Download,
  Printer,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Share2,
  Layers,
  Sparkles,
  ShieldCheck,
  Award,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Tag,
} from 'lucide-react';

const STATUS_CONFIG = {
  'NOMINATION RECEIVED': {
    stage: 1,
    label: 'Nomination Received',
    badgeClass: 'bg-blue-50 text-blue-800 border-blue-300',
    dotClass: 'bg-blue-600',
    description: 'Your nomination has been successfully recorded in our central registry and queued for committee review.',
  },
  'UNDER EVALUATION': {
    stage: 2,
    label: 'Under Evaluation',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-300',
    dotClass: 'bg-amber-600',
    description: 'Our jury and research team are actively evaluating your submitted profile and credentials.',
  },
  'IN PROGRESS (SHORTLISTED)': {
    stage: 3,
    label: 'Shortlisted for Award',
    badgeClass: 'bg-purple-50 text-purple-800 border-purple-300',
    dotClass: 'bg-purple-600',
    description: 'Congratulations! Your profile has qualified into the shortlist for the final award selection round.',
  },
  'SELECTED (WINNER)': {
    stage: 4,
    label: 'Selected (Winner)',
    badgeClass: 'bg-emerald-50 text-emerald-900 border-emerald-400 shadow-sm shadow-emerald-500/10 font-black',
    dotClass: 'bg-emerald-600',
    description: 'Distinguished recognition! You / your organization has been selected as the prestigious award winner.',
  },
  'REJECTED': {
    stage: 0,
    label: 'Evaluation Concluded',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-300',
    dotClass: 'bg-rose-600',
    description: 'This nomination round has concluded. We appreciate your submission and invite you to participate in upcoming editions.',
  },
};

const STAGES = [
  { step: 1, title: 'Received', desc: 'Application Logged' },
  { step: 2, title: 'Screening', desc: 'Jury Evaluation' },
  { step: 3, title: 'Shortlisted', desc: 'Committee Review' },
  { step: 4, title: 'Result', desc: 'Final Award' },
];

export default function NominationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: response, isLoading, error } = useGetMyNominationByIdQuery(id);
  const nomination = response?.data;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyRef = () => {
    if (nomination?._id) {
      navigator.clipboard.writeText(`TM-NOM-${nomination._id.slice(-8).toUpperCase()}`);
      alert('Application Reference ID copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 bg-slate-50">
        <div className="w-16 h-16 rounded-2xl bg-white shadow-xl flex items-center justify-center mb-4 border border-slate-200">
          <Loader2 className="w-8 h-8 text-[#15b7b9] animate-spin" />
        </div>
        <h3 className="text-lg font-black text-slate-900">Loading Nomination Dossier...</h3>
        <p className="text-xs text-slate-600 font-semibold mt-1">Fetching official submission records</p>
      </div>
    );
  }

  if (error || !nomination) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-4 sm:p-6 bg-slate-50">
        <div className="bg-white rounded-3xl p-6 sm:p-10 max-w-lg w-full text-center shadow-xl border border-slate-200">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto mb-4">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-950 mb-2">Nomination Not Found</h2>
          <p className="text-slate-600 text-sm mb-6 leading-relaxed font-medium">
            {error?.data?.message || 'We could not retrieve the requested nomination. It may not belong to your account or has been removed.'}
          </p>
          <Link
            to="/profile?tab=nominations"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-all"
          >
            <ArrowLeft size={16} /> Back to My Nominations
          </Link>
        </div>
      </div>
    );
  }

  const currentStatus = STATUS_CONFIG[nomination.status] || {
    stage: 1,
    label: nomination.status || 'Received',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
    dotClass: 'bg-slate-600',
    description: 'Nomination status under review.',
  };

  const applicationRef = `TM-NOM-${nomination._id.slice(-8).toUpperCase()}`;
  const submissionDate = new Date(nomination.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-slate-50/80 pb-28 pt-4 sm:pt-8 print:p-0 print:bg-white print:text-black">
      <Helmet>
        <title>{nomination.awardName} - Dossier | Prime Time Research Media</title>
      </Helmet>

      {/* =========================================================================
          1. DEDICATED PROFESSIONAL PRINT VIEW (Renders ONLY during Print / PDF)
          ========================================================================= */}
      <div className="hidden print:block w-full text-black font-sans bg-white leading-normal p-2">
        {/* Prime Time Corporate Header */}
        <div className="border-b-2 border-black pb-3 mb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src="/primetimelogo.png"
                alt="Prime Time Research Media"
                className="w-16 h-16 object-contain flex-shrink-0"
              />
              <div>
                <h1 className="text-xl font-bold tracking-tight text-black uppercase leading-tight font-serif">
                  PRIME TIME RESEARCH MEDIA PVT. LTD.
                </h1>
                <p className="text-[9.5px] text-neutral-800 font-medium mt-1 leading-snug">
                  Regd. Office: C-31, Nawada Housing Complex, Shivaji Marg, New Delhi - 110059, India
                </p>
                <p className="text-[9.5px] text-neutral-800 font-medium leading-snug">
                  Tel: +91 11 69268754 | Helpline: +91 9810 88 2769 | Web: www.primetimemedia.in | Email: contact@primetimemedia.in
                </p>
              </div>
            </div>

            <div className="text-right border-l-2 border-black pl-4 flex-shrink-0 flex flex-col justify-center">
              <div className="text-[10px] font-black uppercase tracking-wider bg-black text-white px-2.5 py-0.5 rounded-xs self-end">
                OFFICIAL REGISTRATION RECEIPT
              </div>
              <div className="text-xs font-black font-mono mt-1 text-black">
                REF: {applicationRef}
              </div>
              <div className="text-[10px] font-bold text-black mt-0.5">
                Date: {submissionDate}
              </div>
              <div className="text-[10px] font-black uppercase text-black mt-0.5">
                STATUS: {nomination.status}
              </div>
            </div>
          </div>
        </div>

        {/* Form Document Banner */}
        <div className="bg-slate-100 border border-black py-1.5 px-3 text-center mb-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-black">
            NOMINATION & PARTICIPATION APPLICATION FORM
          </h2>
        </div>

        {/* SECTION I: AWARD SPECIFICATION */}
        <div className="border border-black mb-3 break-inside-avoid">
          <div className="bg-slate-100 border-b border-black px-2.5 py-1 text-[11px] font-black uppercase tracking-wider">
            I. Award & Participation Category
          </div>
          <div className="p-2.5 grid grid-cols-2 gap-x-4 gap-y-2 text-[10px]">
            <div>
              <span className="font-bold uppercase text-slate-700 block">Award Event:</span>
              <span className="font-black text-black text-[11px]">{nomination.awardName}</span>
            </div>
            <div>
              <span className="font-bold uppercase text-slate-700 block">Edition(s):</span>
              <span className="font-bold text-black">{nomination.edition?.join(', ') || 'General Edition'}</span>
            </div>
            <div>
              <span className="font-bold uppercase text-slate-700 block">Registration Type:</span>
              <span className="font-bold text-black capitalize">{nomination.registrationType || 'Organisation'}</span>
            </div>
            <div>
              <span className="font-bold uppercase text-slate-700 block">Participation Intent:</span>
              <span className="font-bold text-black">{nomination.wantTo || 'Nominate for Awards'}</span>
            </div>
            <div className="col-span-2 pt-1 border-t border-slate-300">
              <span className="font-bold uppercase text-slate-700 block">Category Classification:</span>
              <span className="font-black text-black text-[11px]">
                {nomination.categoryPath?.join('  ›  ') || 'Standard Category'}
              </span>
            </div>
          </div>
        </div>

        {/* SECTION II: NOMINEE & ORGANISATION PROFILE */}
        <div className="border border-black mb-3 break-inside-avoid">
          <div className="bg-slate-100 border-b border-black px-2.5 py-1 text-[11px] font-black uppercase tracking-wider">
            II. Nominee & Corporate Entity Credentials
          </div>
          <div className="p-2.5 grid grid-cols-2 gap-x-4 gap-y-2 text-[10px]">
            <div>
              <span className="font-bold uppercase text-slate-700 block">Nominee / Candidate Name:</span>
              <span className="font-black text-black text-[11px]">{nomination.nomineeName}</span>
            </div>
            <div>
              <span className="font-bold uppercase text-slate-700 block">Organization / Brand Name:</span>
              <span className="font-black text-black text-[11px]">{nomination.organizationName || 'N/A (Individual Entry)'}</span>
            </div>
            <div>
              <span className="font-bold uppercase text-slate-700 block">Annual Turnover:</span>
              <span className="font-bold text-black">{nomination.turnover || 'Not Disclosed'}</span>
            </div>
            <div>
              <span className="font-bold uppercase text-slate-700 block">Official Website:</span>
              <span className="font-bold text-black">{nomination.website || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* SECTION III: LEADERSHIP & CONTACT REPRESENTATIVE */}
        <div className="border border-black mb-3 break-inside-avoid">
          <div className="bg-slate-100 border-b border-black px-2.5 py-1 text-[11px] font-black uppercase tracking-wider">
            III. Key Executive & Authorized Representative
          </div>
          <div className="p-2.5 grid grid-cols-2 gap-4 text-[10px]">
            {/* Head of Organization */}
            <div className="border-r border-slate-300 pr-3">
              <div className="font-black uppercase text-black text-[10px] mb-1.5 underline">
                Head of the Organization (MD / Director / Principal)
              </div>
              <div className="mb-1">
                <span className="font-bold text-slate-700">Name:</span> <span className="font-black text-black">{nomination.headName || 'N/A'}</span>
              </div>
              <div className="mb-1">
                <span className="font-bold text-slate-700">Designation:</span> <span className="font-bold text-black">{nomination.headDesignation || 'N/A'}</span>
              </div>
              <div className="mb-1">
                <span className="font-bold text-slate-700">Email:</span> <span className="font-bold text-black">{nomination.headEmail || 'N/A'}</span>
              </div>
              <div>
                <span className="font-bold text-slate-700">Phone:</span> <span className="font-bold text-black">{nomination.headMobile || 'N/A'}</span>
              </div>
            </div>

            {/* Primary Contact Representative */}
            <div className="pl-1">
              <div className="font-black uppercase text-black text-[10px] mb-1.5 underline">
                Primary Contact Person / Applicant Coordinator
              </div>
              <div className="mb-1">
                <span className="font-bold text-slate-700">Name:</span> <span className="font-black text-black">{nomination.contactName || 'N/A'}</span>
              </div>
              <div className="mb-1">
                <span className="font-bold text-slate-700">Designation:</span> <span className="font-bold text-black">{nomination.contactDesignation || 'N/A'}</span>
              </div>
              <div className="mb-1">
                <span className="font-bold text-slate-700">Email:</span> <span className="font-bold text-black">{nomination.contactEmail || 'N/A'}</span>
              </div>
              <div>
                <span className="font-bold text-slate-700">Phone:</span> <span className="font-bold text-black">{nomination.contactMobile || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION IV: REGISTERED ADDRESS & REFERRAL */}
        <div className="border border-black mb-3 break-inside-avoid">
          <div className="bg-slate-100 border-b border-black px-2.5 py-1 text-[11px] font-black uppercase tracking-wider">
            IV. Registered Postal Address & Coordination
          </div>
          <div className="p-2.5 grid grid-cols-4 gap-2 text-[10px]">
            <div className="col-span-2">
              <span className="font-bold uppercase text-slate-700 block">Street Address:</span>
              <span className="font-bold text-black">{nomination.streetAddress || 'N/A'}</span>
            </div>
            <div>
              <span className="font-bold uppercase text-slate-700 block">City:</span>
              <span className="font-bold text-black">{nomination.city || 'N/A'}</span>
            </div>
            <div>
              <span className="font-bold uppercase text-slate-700 block">State:</span>
              <span className="font-bold text-black">{nomination.state || 'N/A'}</span>
            </div>
            <div>
              <span className="font-bold uppercase text-slate-700 block">PIN / Postal Code:</span>
              <span className="font-bold text-black">{nomination.zipCode || 'N/A'}</span>
            </div>
            <div>
              <span className="font-bold uppercase text-slate-700 block">Supporting Dossier:</span>
              <span className="font-bold text-black">{nomination.fileUrl ? 'Document Attached (Verified)' : 'No File Attached'}</span>
            </div>
            {nomination.referredBy && (
              <div className="col-span-2">
                <span className="font-bold uppercase text-slate-700 block">Referred By / Executive:</span>
                <span className="font-bold text-black">{nomination.referredBy}</span>
              </div>
            )}
          </div>
        </div>

        {/* SECTION V: STATEMENT OF ACHIEVEMENTS / NARRATIVE */}
        {nomination.message && (
          <div className="border border-black mb-3 break-inside-avoid">
            <div className="bg-slate-100 border-b border-black px-2.5 py-1 text-[11px] font-black uppercase tracking-wider">
              V. Executive Statement of Achievements & Case Narrative
            </div>
            <div className="p-2.5 text-[10px] leading-relaxed text-black whitespace-pre-wrap font-medium">
              {nomination.message}
            </div>
          </div>
        )}

        {/* SECTION VI: DECLARATION & OFFICIAL ENDORSEMENT */}
        <div className="border border-black mb-3 break-inside-avoid">
          <div className="bg-slate-100 border-b border-black px-2.5 py-1 text-[11px] font-black uppercase tracking-wider">
            VI. Official Declaration & Scrutiny Endorsement
          </div>
          <div className="p-2.5 text-[9px] text-slate-800 leading-tight">
            I / We hereby declare that the particulars submitted in this Nomination Form are true, accurate, and authentic to the best of our knowledge. We agree to abide by the terms, jury regulations, and screening processes established by Prime Time Research Media Pvt. Ltd. and its affiliated awards committee.
          </div>

          <div className="border-t border-black grid grid-cols-2 p-3 text-[10px]">
            <div className="border-r border-slate-300 pr-4 flex flex-col justify-between h-20">
              <span className="font-bold uppercase text-slate-700 text-[9px]">
                Authorized Signatory & Seal (Nominee / Entity):
              </span>
              <div className="border-b border-dashed border-slate-400 w-3/4"></div>
              <div className="text-[9px] text-slate-600">
                Date: ____________________ | Place: ____________________
              </div>
            </div>

            <div className="pl-4 flex flex-col justify-between h-20">
              <div className="flex items-center justify-between">
                <span className="font-bold uppercase text-slate-700 text-[9px]">
                  For Prime Time Research Media Pvt. Ltd.
                </span>
                <span className="font-black text-[9px] text-slate-900 border border-slate-400 px-1 py-0.5">
                  SECRETARIAT DESK
                </span>
              </div>
              <div className="border-b border-dashed border-slate-400 w-3/4"></div>
              <div className="text-[9px] text-slate-600">
                Scrutinized & Logged By Desk Officer | Official Registration
              </div>
            </div>
          </div>
        </div>

        {/* Print Footer Note */}
        <div className="border-t border-black pt-1.5 text-center text-[9px] text-slate-600">
          This document is an authentic electronic registration confirmation generated by Prime Time Research Media Pvt. Ltd. | For queries or verification, contact secretariat@primetimemedia.in | CIN & Corporate Rights Reserved.
        </div>
      </div>

      {/* =========================================================================
          2. SCREEN-ONLY INTERACTIVE PORTAL (Hidden during Print)
          ========================================================================= */}
      <div className="max-w-5xl mx-auto px-3.5 sm:px-6 print:hidden">

        {/* Top Screen Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <Link
            to="/profile?tab=nominations"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 hover:text-[#15b7b9] transition-colors py-2 px-3 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 w-fit"
          >
            <ArrowLeft size={16} /> Back to My Nominations
          </Link>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopyRef}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs border border-slate-300 shadow-2xs transition-all cursor-pointer whitespace-nowrap"
              title="Copy Application ID"
            >
              <Share2 size={14} className="text-[#15b7b9]" />
              <span>{applicationRef}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs border border-slate-900 shadow-xs transition-all cursor-pointer whitespace-nowrap"
            >
              <Printer size={15} />
              <span>Print Registration Form</span>
            </button>

            <Link
              to="/nomination"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#15b7b9] to-sky-600 hover:from-[#119ea0] hover:to-sky-500 text-white font-bold text-xs shadow-md shadow-[#15b7b9]/20 transition-all whitespace-nowrap"
            >
              <Sparkles size={14} />
              <span>Submit Another</span>
            </Link>
          </div>
        </div>

        {/* Screen-Only Executive Header Banner */}
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 text-white rounded-3xl p-5 sm:p-10 shadow-xl border border-slate-800 relative overflow-hidden mb-6 sm:mb-8">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#15b7b9]/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

          <div className="relative z-10 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3 sm:mb-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-white/15 text-white border border-white/20 backdrop-blur-md">
                  Prime Time Official Nomination
                </span>
                <span className="text-slate-200 text-xs font-semibold flex items-center gap-1">
                  <Calendar size={13} className="text-[#15b7b9]" />
                  Submitted on {submissionDate}
                </span>
              </div>

              <span className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-xs font-extrabold border backdrop-blur-sm ${currentStatus.badgeClass}`}>
                <span className={`w-2 h-2 rounded-full ${currentStatus.dotClass} animate-pulse`}></span>
                {currentStatus.label}
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl lg:text-4xl font-black text-white font-display tracking-tight leading-tight break-words">
              {nomination.awardName}
            </h1>

            <p className="text-slate-100 text-xs sm:text-base mt-2.5 font-semibold max-w-2xl break-words leading-relaxed">
              Nomination entry submitted on behalf of{' '}
              <strong className="text-white font-extrabold underline decoration-[#15b7b9] decoration-2 underline-offset-4">
                {nomination.nomineeName}
              </strong>
              {nomination.organizationName ? ` (${nomination.organizationName})` : ''}.
            </p>

            {/* Quick Metadata Tags */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-white/15 text-xs font-bold">
              <div className="bg-white/15 border border-white/20 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-xl flex items-center gap-1.5 text-white">
                <Tag size={13} className="text-[#15b7b9]" />
                <span>Type: <strong className="text-white capitalize">{nomination.registrationType || 'Organisation'}</strong></span>
              </div>

              {nomination.wantTo && (
                <div className="bg-white/15 border border-white/20 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 text-white">
                  <Trophy size={13} className="text-[#15b7b9]" />
                  <span>Purpose: <strong className="text-white">{nomination.wantTo}</strong></span>
                </div>
              )}

              {nomination.edition && nomination.edition.length > 0 && (
                <div className="bg-white/15 border border-white/20 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 text-white">
                  <Layers size={13} className="text-[#15b7b9]" />
                  <span>Edition: <strong className="text-white">{nomination.edition.join(', ')}</strong></span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Screen-Only Lifecycle Stepper / Progress Tracker */}
        <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-xs border border-slate-200 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="text-base font-black text-slate-950 flex items-center gap-2">
                <TrendingUp size={18} className="text-[#15b7b9]" />
                Evaluation Lifecycle
              </h3>
              <p className="text-xs text-slate-600 font-semibold mt-0.5">Real-time status of this award submission</p>
            </div>
            <div className="text-xs font-bold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 w-fit">
              Current Stage: <span className="text-[#15b7b9] font-black">{currentStatus.label}</span>
            </div>
          </div>

          {/* Stepper Bar */}
          <div className="relative">
            <div className="grid grid-cols-4 gap-1 sm:gap-2 relative z-10">
              {STAGES.map((s) => {
                const isPassed = currentStatus.stage >= s.step;
                const isCurrent = currentStatus.stage === s.step;

                return (
                  <div key={s.step} className="flex flex-col items-center text-center min-w-0">
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center font-black text-xs transition-all shadow-2xs ${isCurrent
                        ? 'bg-gradient-to-tr from-[#15b7b9] to-sky-500 text-white ring-2 sm:ring-4 ring-[#15b7b9]/20'
                        : isPassed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-600'
                        }`}
                    >
                      {isPassed && !isCurrent ? <CheckCircle2 size={16} /> : s.step}
                    </div>
                    <span className={`text-[10px] sm:text-xs font-extrabold mt-1.5 sm:mt-2 truncate w-full ${isCurrent ? 'text-slate-950' : isPassed ? 'text-slate-800' : 'text-slate-500'}`}>
                      {s.title}
                    </span>
                    <span className="text-[10px] text-slate-600 font-semibold hidden md:block mt-0.5">
                      {s.desc}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Connecting line behind */}
            <div className="absolute top-4 sm:top-5 left-[12%] right-[12%] h-1 bg-slate-200 -z-0">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-[#15b7b9] transition-all duration-500"
                style={{
                  width: `${currentStatus.stage === 0
                    ? 0
                    : Math.min(100, ((currentStatus.stage - 1) / (STAGES.length - 1)) * 100)
                    }%`,
                }}
              ></div>
            </div>
          </div>

          {/* Status Description Callout */}
          <div className="mt-5 sm:mt-6 p-3.5 sm:p-4 rounded-2xl bg-sky-50 border border-sky-200 flex items-start gap-2.5 sm:gap-3">
            <ShieldCheck size={18} className="text-[#15b7b9] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-sky-950 font-bold leading-relaxed break-words">
              {currentStatus.description}
            </p>
          </div>
        </div>

        {/* Screen Data Cards */}
        <div className="space-y-4 sm:space-y-6">

          {/* Section: Questionnaire Application Eligibility & Verification (Shown if questionnaire nomination) */}
          {nomination.isQuestionnaire && (
            <div className="bg-gradient-to-br from-amber-50/80 via-white to-amber-50/30 rounded-3xl p-5 sm:p-8 shadow-xs border border-amber-200">
              <div className="flex items-center gap-3 pb-3 sm:pb-4 mb-4 sm:mb-5 border-b border-amber-200">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold flex-shrink-0">
                  <Sparkles size={20} className="text-amber-700" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-slate-950 uppercase truncate">
                      Questionnaire & Eligibility Verification
                    </h3>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200/80 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300">
                      Isolated Edition
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-semibold">
                    Applicant verification criteria and edition qualification answers
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-sm">
                <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-amber-200 min-w-0 shadow-2xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-1">
                    Applied Edition
                  </span>
                  <span className="font-black text-slate-950 text-sm break-words block">
                    {nomination.edition?.[0] || nomination.awardName}
                  </span>
                </div>

                <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-amber-200 min-w-0 shadow-2xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-1">
                    Valid US Visa
                  </span>
                  <span className={`font-black text-sm inline-flex items-center gap-1.5 ${nomination.hasUSVisa === 'Yes' ? 'text-emerald-700' : 'text-slate-800'}`}>
                    {nomination.hasUSVisa === 'Yes' ? '✓ Yes' : nomination.hasUSVisa === 'No' ? '✗ No' : nomination.hasUSVisa || 'N/A'}
                  </span>
                </div>

                <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-amber-200 min-w-0 shadow-2xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-1">
                    3-Yr ITR &gt; ₹12 Lakhs
                  </span>
                  <span className={`font-black text-sm inline-flex items-center gap-1.5 ${nomination.itrExceeded12L === 'Yes' ? 'text-emerald-700' : 'text-slate-800'}`}>
                    {nomination.itrExceeded12L === 'Yes' ? '✓ Yes' : nomination.itrExceeded12L === 'No' ? '✗ No' : nomination.itrExceeded12L || 'N/A'}
                  </span>
                </div>

                <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-amber-200 min-w-0 shadow-2xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-1">
                    Commercial Fee Agreement
                  </span>
                  <span className="font-black text-sm text-emerald-700 inline-flex items-center gap-1">
                    ✓ {nomination.agreedToFees ? 'Agreed' : 'Yes'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Section 1: Award & Category Classification */}
          <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-xs border border-slate-200">
            <div className="flex items-center gap-3 pb-3 sm:pb-4 mb-4 sm:mb-5 border-b border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold flex-shrink-0">
                <Award size={20} />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-black text-slate-950 uppercase truncate">
                  1. Award & Category Classification
                </h3>
                <p className="text-xs text-slate-600 font-semibold">
                  Event edition and category hierarchy registered
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-sm">
              <div className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200 min-w-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-1">
                  Award Event Title
                </span>
                <span className="font-black text-slate-950 text-base break-words block">{nomination.awardName}</span>
              </div>

              <div className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200 min-w-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-1">
                  Selected Edition(s)
                </span>
                <span className="font-extrabold text-slate-950 break-words block">
                  {nomination.edition && nomination.edition.length > 0 ? nomination.edition.join(', ') : 'Not Specified'}
                </span>
              </div>

              <div className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200 min-w-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-1">
                  Registration Type
                </span>
                <span className="font-extrabold text-slate-950 capitalize block">
                  {nomination.registrationType || 'Organisation'}
                </span>
              </div>

              {/* Category Hierarchy Path */}
              <div className="sm:col-span-2 lg:col-span-3 bg-gradient-to-r from-sky-50 to-blue-50/70 p-4 sm:p-5 rounded-2xl border border-sky-200 min-w-0">
                <span className="text-[11px] font-black uppercase tracking-wider text-sky-950 block mb-2">
                  Category Classification Tree
                </span>
                {nomination.categoryPath && nomination.categoryPath.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    {nomination.categoryPath.map((step, idx) => (
                      <React.Fragment key={idx}>
                        <span className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-white text-slate-950 font-black text-xs shadow-2xs border border-sky-200 break-words max-w-full">
                          {step}
                        </span>
                        {idx < nomination.categoryPath.length - 1 && (
                          <ChevronRight size={14} className="text-sky-600 flex-shrink-0" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-700 text-xs italic font-semibold">General Category</span>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Nominee & Organisation Details */}
          <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-xs border border-slate-200">
            <div className="flex items-center gap-3 pb-3 sm:pb-4 mb-4 sm:mb-5 border-b border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold flex-shrink-0">
                <Building size={20} />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-black text-slate-950 uppercase truncate">
                  2. Nominee & Organization Profile
                </h3>
                <p className="text-xs text-slate-600 font-semibold">
                  Corporate and candidate identity credentials
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-sm">
              <div className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200 sm:col-span-2 min-w-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-1">
                  Nominee / Candidate Name
                </span>
                <span className="font-black text-slate-950 text-base break-words block">{nomination.nomineeName}</span>
              </div>

              <div className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200 sm:col-span-2 min-w-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-1">
                  Organization / Brand Name
                </span>
                <span className="font-black text-slate-950 text-base break-words block">
                  {nomination.organizationName || 'N/A (Individual Entry)'}
                </span>
              </div>

              <div className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200 sm:col-span-2 min-w-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-1">
                  Annual Turnover
                </span>
                <span className="font-extrabold text-slate-950 break-words block">
                  {nomination.turnover || 'Not Disclosed'}
                </span>
              </div>

              <div className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200 sm:col-span-2 min-w-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-1">
                  Official Website
                </span>
                {nomination.website ? (
                  <a
                    href={nomination.website.startsWith('http') ? nomination.website : `https://${nomination.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-extrabold text-[#0e9496] hover:underline flex items-center gap-1.5 break-all min-w-0"
                  >
                    <Globe size={14} className="flex-shrink-0" />
                    <span className="break-all">{nomination.website}</span>
                    <ExternalLink size={12} className="flex-shrink-0" />
                  </a>
                ) : (
                  <span className="text-slate-600 font-semibold">N/A</span>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Leadership & Contact Representatives */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">

            {/* Head of Organization */}
            <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-xs border border-slate-200 min-w-0">
              <div className="flex items-center gap-3 pb-3 sm:pb-4 mb-4 sm:mb-5 border-b border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold flex-shrink-0">
                  <User size={20} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-black text-slate-950 uppercase truncate">
                    3. Head of Organization
                  </h3>
                  <p className="text-xs text-slate-600 font-semibold">Principal Executive / Director</p>
                </div>
              </div>

              <div className="space-y-3.5 text-sm min-w-0">
                <div className="min-w-0">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-0.5">
                    Full Name & Title
                  </span>
                  <span className="font-black text-slate-950 break-words block">
                    {nomination.headName || 'N/A'}
                  </span>
                  {nomination.headDesignation && (
                    <span className="text-slate-700 font-bold block text-xs mt-0.5 break-words">
                      {nomination.headDesignation}
                    </span>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200 min-w-0">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-1">
                    Official Email
                  </span>
                  {nomination.headEmail ? (
                    <a
                      href={`mailto:${nomination.headEmail}`}
                      className="text-slate-950 font-bold hover:text-[#15b7b9] flex items-center gap-1.5 min-w-0"
                    >
                      <Mail size={14} className="text-slate-500 flex-shrink-0" />
                      <span className="break-all">{nomination.headEmail}</span>
                    </a>
                  ) : (
                    <span className="text-slate-500 font-medium">N/A</span>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200 min-w-0">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-1">
                    Direct Mobile Phone
                  </span>
                  {nomination.headMobile ? (
                    <a
                      href={`tel:${nomination.headMobile}`}
                      className="text-slate-950 font-bold hover:text-[#15b7b9] flex items-center gap-1.5 min-w-0"
                    >
                      <Phone size={14} className="text-slate-500 flex-shrink-0" />
                      <span className="break-all">{nomination.headMobile}</span>
                    </a>
                  ) : (
                    <span className="text-slate-500 font-medium">N/A</span>
                  )}
                </div>
              </div>
            </div>

            {/* Primary Contact Person */}
            <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-xs border border-slate-200 min-w-0">
              <div className="flex items-center gap-3 pb-3 sm:pb-4 mb-4 sm:mb-5 border-b border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold flex-shrink-0">
                  <Briefcase size={20} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-black text-slate-950 uppercase truncate">
                    4. Primary Contact Representative
                  </h3>
                  <p className="text-xs text-slate-600 font-semibold">Applicant / Coordinator</p>
                </div>
              </div>

              <div className="space-y-3.5 text-sm min-w-0">
                <div className="min-w-0">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-0.5">
                    Contact Name & Designation
                  </span>
                  <span className="font-black text-slate-950 break-words block">
                    {nomination.contactName || 'N/A'}
                  </span>
                  {nomination.contactDesignation && (
                    <span className="text-slate-700 font-bold block text-xs mt-0.5 break-words">
                      {nomination.contactDesignation}
                    </span>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200 min-w-0">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-1">
                    Contact Email
                  </span>
                  {nomination.contactEmail ? (
                    <a
                      href={`mailto:${nomination.contactEmail}`}
                      className="text-slate-950 font-bold hover:text-[#15b7b9] flex items-center gap-1.5 min-w-0"
                    >
                      <Mail size={14} className="text-slate-500 flex-shrink-0" />
                      <span className="break-all">{nomination.contactEmail}</span>
                    </a>
                  ) : (
                    <span className="text-slate-500 font-medium">N/A</span>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200 min-w-0">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-1">
                    Contact Mobile Phone
                  </span>
                  {nomination.contactMobile ? (
                    <a
                      href={`tel:${nomination.contactMobile}`}
                      className="text-slate-950 font-bold hover:text-[#15b7b9] flex items-center gap-1.5 min-w-0"
                    >
                      <Phone size={14} className="text-slate-500 flex-shrink-0" />
                      <span className="break-all">{nomination.contactMobile}</span>
                    </a>
                  ) : (
                    <span className="text-slate-500 font-medium">N/A</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Address Details */}
          <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-xs border border-slate-200">
            <div className="flex items-center gap-3 pb-3 sm:pb-4 mb-4 sm:mb-5 border-b border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold flex-shrink-0">
                <MapPin size={20} />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-black text-slate-950 uppercase truncate">
                  5. Headquarters / Postal Address
                </h3>
                <p className="text-xs text-slate-600 font-semibold">
                  Physical registered address of the nominated entity
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-sm">
              <div className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200 sm:col-span-2 min-w-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-1">
                  Street Address
                </span>
                <span className="font-extrabold text-slate-950 break-words block">{nomination.streetAddress || 'N/A'}</span>
              </div>

              <div className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200 min-w-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-1">
                  City
                </span>
                <span className="font-extrabold text-slate-950 break-words block">{nomination.city || 'N/A'}</span>
              </div>

              <div className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200 min-w-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-1">
                  State / Province
                </span>
                <span className="font-extrabold text-slate-950 break-words block">{nomination.state || 'N/A'}</span>
              </div>

              <div className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200 min-w-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-1">
                  Postal / ZIP Code
                </span>
                <span className="font-extrabold text-slate-950 break-words block">{nomination.zipCode || 'N/A'}</span>
              </div>

              {nomination.referredBy && (
                <div className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200 sm:col-span-3 min-w-0">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-1">
                    Referred By / Executive Coordinator
                  </span>
                  <span className="font-extrabold text-slate-950 break-words block">{nomination.referredBy}</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 5: Statement of Achievements & Justification */}
          {nomination.message && (
            <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-xs border border-slate-200 min-w-0">
              <div className="flex items-center gap-3 pb-3 sm:pb-4 mb-4 sm:mb-5 border-b border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold flex-shrink-0">
                  <FileText size={20} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-black text-slate-950 uppercase truncate">
                    6. Statement of Achievements & Case Narrative
                  </h3>
                  <p className="text-xs text-slate-600 font-semibold">
                    Official justification and track record submitted
                  </p>
                </div>
              </div>

              <div className="p-4 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 text-sm leading-relaxed text-slate-950 whitespace-pre-wrap font-medium break-words overflow-hidden">
                {nomination.message}
              </div>
            </div>
          )}

          {/* Section 6: Attached Documents & Supporting Dossier */}
          {nomination.fileUrl && (
            <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-xs border border-slate-200 min-w-0">
              <div className="flex items-center gap-3 pb-3 sm:pb-4 mb-4 sm:mb-5 border-b border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold flex-shrink-0">
                  <Download size={20} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-black text-slate-950 uppercase truncate">
                    7. Supporting Documents Attached
                  </h3>
                  <p className="text-xs text-slate-600 font-semibold">
                    Official company presentations, credentials, and attachments
                  </p>
                </div>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 min-w-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white shadow-2xs border border-emerald-200 flex items-center justify-center text-emerald-700 flex-shrink-0">
                    <FileText size={22} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-black text-xs sm:text-sm text-slate-950 truncate">Uploaded Profile / Presentation Dossier</h4>
                    <p className="text-xs text-slate-700 font-semibold mt-0.5">Status: Verified file attached</p>
                  </div>
                </div>

                <a
                  href={nomination.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider shadow-xs transition-all flex-shrink-0"
                >
                  <Download size={14} /> Download Document
                </a>
              </div>
            </div>
          )}

          {/* Screen-Only Need Assistance Card */}
          <div className="bg-slate-950 text-white rounded-3xl p-5 sm:p-8 shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-5 min-w-0">
            <div className="min-w-0">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#15b7b9] block mb-1">
                Official Jury & Committee Secretariat
              </span>
              <h4 className="text-base sm:text-lg font-black font-display text-white">Have questions about your nomination?</h4>
              <p className="text-xs text-slate-300 font-medium mt-1 max-w-xl break-words">
                Our awards desk is available to assist you with updates, additional document attachments, or delegate badge confirmations.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
              <Link
                to="/contact"
                className="w-full sm:w-auto text-center px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-black text-xs uppercase tracking-wider transition-all"
              >
                Contact Helpdesk
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
