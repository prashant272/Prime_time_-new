import React, { useState, useRef } from 'react';
import { Send, Loader2, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useSubmitContactFormMutation } from '../../store/apiSlice';
import TurnstileWidget from './TurnstileWidget';

const ContactForm = ({ theme = 'light' }) => {
  const isDark = theme === 'dark';
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' or 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [captchaToken, setCaptchaToken] = useState(null);
  const [captchaError, setCaptchaError] = useState('');
  const turnstileRef = useRef(null);

  const inputStyles = isDark
    ? "w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl px-5 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 focus:bg-slate-900/80 transition-all shadow-inner"
    : "w-full px-4 py-3 rounded-lg border border-gray-200 text-gray-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all";

  const labelStyles = isDark ? "text-sm font-semibold text-gray-300" : "text-sm font-semibold text-gray-700";

  const [submitContact] = useSubmitContactFormMutation();

  const onSubmit = async (data) => {
    if (!captchaToken) {
      setCaptchaError('Please complete the security check before submitting.');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);
    setErrorMessage('');
    setCaptchaError('');

    try {
      await submitContact({ ...data, captchaToken }).unwrap();
      setSubmitStatus('success');
      reset(); // Clear the form
      setCaptchaToken(null);
      turnstileRef.current?.reset();
      
      // Clear success message after 5 seconds
      setTimeout(() => setSubmitStatus(null), 5000);
    } catch (error) {
      console.error('Submission failed:', error);
      setSubmitStatus('error');
      setErrorMessage(error?.data?.message || 'Something went wrong. Please try again later.');
      setCaptchaToken(null);
      turnstileRef.current?.reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="flex flex-col gap-6 w-full" onSubmit={handleSubmit(onSubmit)}>
      {submitStatus === 'success' && (
        <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl flex items-center gap-3 border border-emerald-100 font-medium">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          Thank you! Your message has been sent successfully. We will get back to you soon.
        </div>
      )}
      
      {submitStatus === 'error' && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage || 'Something went wrong. Please try again later.'}</span>
        </div>
      )}

      {/* Anti-spam Honeypot (invisible to real users) */}
      <div className="hidden" aria-hidden="true" style={{ display: 'none' }}>
        <input 
          type="text" 
          tabIndex="-1" 
          autoComplete="off" 
          {...register('_hp_website')} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          {theme === 'light' && <label className={labelStyles}>Full Name *</label>}
          <input 
            type="text" 
            placeholder="Name" 
            className={`${inputStyles} ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}`}
            {...register('name', { required: 'Name is required' })} 
          />
          {errors.name && <span className="text-red-500 text-xs font-medium">{errors.name.message}</span>}
        </div>
        <div className="flex flex-col gap-2">
          {theme === 'light' && <label className={labelStyles}>Organization Name</label>}
          <input 
            type="text" 
            placeholder="Organization Name" 
            className={inputStyles}
            {...register('organization')} 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          {theme === 'light' && <label className={labelStyles}>Email Address *</label>}
          <input 
            type="email" 
            placeholder="Email Address" 
            className={`${inputStyles} ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}`}
            {...register('email', { 
              required: 'Email is required',
              pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
            })} 
          />
          {errors.email && <span className="text-red-500 text-xs font-medium">{errors.email.message}</span>}
        </div>
        <div className="flex flex-col gap-2">
          {theme === 'light' && <label className={labelStyles}>Phone Number</label>}
          <input 
            type="tel" 
            placeholder="Phone Number" 
            className={inputStyles}
            {...register('phone')} 
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {theme === 'light' && <label className={labelStyles}>Your Message *</label>}
        <textarea
          rows={isDark ? "3" : "5"}
          placeholder="Write your message here..."
          className={`${inputStyles} resize-none ${errors.message ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}`}
          {...register('message', { required: 'Message is required' })}
        ></textarea>
        {errors.message && <span className="text-red-500 text-xs font-medium">{errors.message.message}</span>}
      </div>

      {/* Cloudflare Turnstile CAPTCHA */}
      <div className="flex flex-col gap-1">
        <TurnstileWidget
          ref={turnstileRef}
          theme={isDark ? 'dark' : 'light'}
          onVerify={(token) => {
            setCaptchaToken(token);
            setCaptchaError('');
          }}
          onExpire={() => {
            setCaptchaToken(null);
          }}
          onError={() => {
            setCaptchaError('Security check failed to load. Please refresh the page.');
          }}
        />
        {captchaError && (
          <span className="text-rose-500 text-xs font-medium flex items-center gap-1.5 mt-1">
            <AlertCircle size={14} className="flex-shrink-0" />
            {captchaError}
          </span>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`mt-2 ${isDark ? 'w-full py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 shadow-lg shadow-sky-500/25' : 'w-full md:w-auto self-start py-4 px-10 rounded-full bg-sky-600 hover:bg-sky-700'} text-white font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed ${!isSubmitting ? 'hover:-translate-y-1' : ''}`}
      >
        {isSubmitting ? (
          <Loader2 size={20} className="animate-spin" />
        ) : (
          <Send size={20} />
        )}
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
};

export default ContactForm;
