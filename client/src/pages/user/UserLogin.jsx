import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams, Link, Navigate } from 'react-router-dom';
import {
  useUserLoginMutation,
  useForgotPasswordMutation,
  useVerifyResetOtpMutation,
  useResetPasswordMutation,
} from '../../store/apiSlice';
import { setUserCredentials } from '../../store/authSlice';
import {
  Lock,
  Mail,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Sparkles,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const UserLogin = () => {
  const { register, handleSubmit, setValue, getValues, formState: { errors } } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // In-Card View Mode: 'login' | 'forgot_email' | 'forgot_otp' | 'forgot_new_password'
  const [cardMode, setCardMode] = useState('login');

  // Forgot Password Form States
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Notifications
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Resend Countdown
  const [countdown, setCountdown] = useState(0);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/profile';

  const { userInfo } = useSelector((state) => state.auth);

  // RTK Query Mutations
  const [userLogin, { isLoading: isLoginLoading }] = useUserLoginMutation();
  const [forgotPassword, { isLoading: isForgotLoading }] = useForgotPasswordMutation();
  const [verifyResetOtp, { isLoading: isVerifyLoading }] = useVerifyResetOtpMutation();
  const [resetPassword, { isLoading: isResetLoading }] = useResetPasswordMutation();

  // If already logged in, redirect
  if (userInfo) {
    return <Navigate to={redirect} replace />;
  }

  // Resend OTP Countdown Timer
  useEffect(() => {
    let timer;
    if (cardMode === 'forgot_otp' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cardMode, countdown]);

  // Standard Login Submit
  const onLoginSubmit = async (data) => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await userLogin(data).unwrap();
      dispatch(setUserCredentials(res.data));
      navigate(redirect);
    } catch (err) {
      setErrorMsg(err.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  // Switch to Forgot Password
  const handleOpenForgot = () => {
    setErrorMsg('');
    setSuccessMsg('');
    const currentId = getValues('identifier') || '';
    if (currentId.includes('@')) {
      setForgotEmail(currentId.trim().toLowerCase());
    }
    setCardMode('forgot_email');
  };

  // Switch back to Login
  const handleBackToLogin = () => {
    setErrorMsg('');
    setSuccessMsg('');
    setCardMode('login');
  };

  // Step 1: Send OTP to Email
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanEmail = forgotEmail.trim().toLowerCase();
    if (!cleanEmail || !/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      setErrorMsg('Please enter a valid registered email address.');
      return;
    }

    try {
      const res = await forgotPassword({ email: cleanEmail }).unwrap();
      setSuccessMsg(res.message || 'Verification code sent to your email.');
      setCountdown(60);
      setOtpCode('');
      setCardMode('forgot_otp');
    } catch (err) {
      setErrorMsg(err.data?.message || 'Failed to send verification code. Please check your email.');
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (countdown > 0 || isForgotLoading) return;
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await forgotPassword({ email: forgotEmail.trim().toLowerCase() }).unwrap();
      setSuccessMsg(res.message || 'A new verification code has been dispatched.');
      setCountdown(60);
    } catch (err) {
      setErrorMsg(err.data?.message || 'Failed to resend verification code.');
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanOtp = otpCode.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setErrorMsg('Please enter the full 6-digit verification code.');
      return;
    }

    try {
      const res = await verifyResetOtp({
        email: forgotEmail.trim().toLowerCase(),
        otp: cleanOtp,
      }).unwrap();

      setSuccessMsg(res.message || 'Verification successful. Please enter your new password.');
      setNewPassword('');
      setConfirmPassword('');
      setCardMode('forgot_new_password');
    } catch (err) {
      setErrorMsg(err.data?.message || 'Invalid or expired verification code.');
    }
  };

  // Step 3: Update / Reset Password
  const handleResetPassword = async (e) => {
    e?.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match. Please verify.');
      return;
    }

    try {
      const res = await resetPassword({
        email: forgotEmail.trim().toLowerCase(),
        otp: otpCode.trim(),
        newPassword,
      }).unwrap();

      // Return to Login with email pre-filled and success message
      setValue('identifier', forgotEmail.trim().toLowerCase());
      setValue('password', '');
      setSuccessMsg(res.message || 'Password reset successfully! Please sign in with your new password.');
      setCardMode('login');
      setOtpCode('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setErrorMsg(err.data?.message || 'Failed to reset password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-16 px-4 relative overflow-hidden">
      <Helmet>
        <title>
          {cardMode === 'login' ? 'Sign In' : 'Reset Password'} | Prime Time Research Media
        </title>
      </Helmet>

      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#15b7b9]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden relative z-10 transition-all duration-300">
        
        {/* Header Ribbon (Dynamic per cardMode) */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 p-7 sm:p-8 text-center text-white relative">
          {cardMode === 'login' && (
            <>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-bold tracking-wider uppercase mb-3 text-[#15b7b9]">
                <Sparkles size={14} /> Welcome Back
              </div>
              <h1 className="text-2xl md:text-3xl font-black font-display tracking-tight">
                User <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#15b7b9] to-sky-400">Portal</span>
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm mt-1">
                Access your profile and track your award nominations
              </p>
            </>
          )}

          {cardMode === 'forgot_email' && (
            <>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-bold tracking-wider uppercase mb-3 text-sky-400">
                <KeyRound size={14} /> Account Recovery
              </div>
              <h1 className="text-2xl md:text-3xl font-black font-display tracking-tight">
                Forgot <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#15b7b9] to-sky-400">Password</span>
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm mt-1">
                Step 1 of 3: Enter your registered email address
              </p>
            </>
          )}

          {cardMode === 'forgot_otp' && (
            <>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-bold tracking-wider uppercase mb-3 text-emerald-400">
                <ShieldCheck size={14} /> Verification Code
              </div>
              <h1 className="text-2xl md:text-3xl font-black font-display tracking-tight">
                Verify <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-[#15b7b9]">OTP</span>
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm mt-1">
                Step 2 of 3: Enter the 6-digit code sent to your email
              </p>
            </>
          )}

          {cardMode === 'forgot_new_password' && (
            <>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-bold tracking-wider uppercase mb-3 text-[#15b7b9]">
                <Lock size={14} /> New Credentials
              </div>
              <h1 className="text-2xl md:text-3xl font-black font-display tracking-tight">
                Set New <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#15b7b9] to-sky-400">Password</span>
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm mt-1">
                Step 3 of 3: Choose a secure password for your account
              </p>
            </>
          )}
        </div>

        {/* Card Body */}
        <div className="p-7 sm:p-9">
          
          {/* Success Banner */}
          {successMsg && (
            <div className="mb-5 p-3.5 bg-emerald-50 text-emerald-800 rounded-2xl text-xs sm:text-sm font-semibold border border-emerald-200 flex items-start gap-2.5 animate-fadeIn">
              <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="mb-5 p-3.5 bg-rose-50 text-rose-700 rounded-2xl text-xs sm:text-sm font-semibold border border-rose-200 text-center animate-shake">
              {errorMsg}
            </div>
          )}

          {/* ========================================================
              VIEW 1: STANDARD LOGIN FORM
              ======================================================== */}
          {cardMode === 'login' && (
            <>
              <form onSubmit={handleSubmit(onLoginSubmit)} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Email or Phone Number *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <Mail className="h-5 w-5" />
                    </div>
                    <input
                      type="text"
                      placeholder="you@company.com or 9876543210"
                      className={`w-full pl-11 pr-4 py-3.5 rounded-xl border-2 ${
                        errors.identifier ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-[#15b7b9]'
                      } focus:outline-none focus:ring-4 focus:ring-[#15b7b9]/15 transition-all text-slate-800 font-medium text-sm`}
                      {...register('identifier', {
                        required: 'Email or phone number is required',
                      })}
                    />
                  </div>
                  {errors.identifier && (
                    <span className="text-rose-500 text-xs font-semibold mt-1.5 block">{errors.identifier.message}</span>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Password *
                    </label>
                    <button
                      type="button"
                      onClick={handleOpenForgot}
                      className="text-xs font-bold text-[#15b7b9] hover:text-[#119ea0] hover:underline transition-colors cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <Lock className="h-5 w-5" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className={`w-full pl-11 pr-11 py-3.5 rounded-xl border-2 ${
                        errors.password ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-[#15b7b9]'
                      } focus:outline-none focus:ring-4 focus:ring-[#15b7b9]/15 transition-all text-slate-800 font-medium text-sm`}
                      {...register('password', { required: 'Password is required' })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <span className="text-rose-500 text-xs font-semibold mt-1.5 block">{errors.password.message}</span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoginLoading}
                  className="w-full mt-3 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#15b7b9] to-sky-600 hover:from-[#119ea0] hover:to-sky-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-[#15b7b9]/25 hover:shadow-xl hover:shadow-[#15b7b9]/35 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoginLoading ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5" />
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-7 pt-5 border-t border-slate-100 text-center">
                <p className="text-sm text-slate-600">
                  Don't have an account yet?{' '}
                  <Link
                    to={`/register${redirect !== '/profile' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
                    className="font-bold text-[#15b7b9] hover:text-[#119ea0] transition-colors"
                  >
                    Register here
                  </Link>
                </p>
              </div>
            </>
          )}

          {/* ========================================================
              VIEW 2: FORGOT PASSWORD - STEP 1: ENTER EMAIL
              ======================================================== */}
          {cardMode === 'forgot_email' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Registered Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@example.com"
                    autoFocus
                    required
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border-2 border-slate-200 focus:border-[#15b7b9] focus:outline-none focus:ring-4 focus:ring-[#15b7b9]/15 transition-all text-slate-800 font-medium text-sm"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  We will send a 6-digit OTP verification code to this email to confirm your identity.
                </p>
              </div>

              <button
                type="submit"
                disabled={isForgotLoading || !forgotEmail}
                className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#15b7b9] to-sky-600 hover:from-[#119ea0] hover:to-sky-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-[#15b7b9]/25 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isForgotLoading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5" />
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification OTP</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>

              <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <ArrowLeft size={14} /> Back to Sign In
                </button>
              </div>
            </form>
          )}

          {/* ========================================================
              VIEW 3: FORGOT PASSWORD - STEP 2: VERIFY OTP
              ======================================================== */}
          {cardMode === 'forgot_otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center justify-between text-xs">
                <div className="overflow-hidden pr-2">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Sending OTP to</span>
                  <span className="font-bold text-slate-800 truncate block">{forgotEmail}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('');
                    setCardMode('forgot_email');
                  }}
                  className="text-[#15b7b9] font-bold text-xs hover:underline flex-shrink-0 cursor-pointer"
                >
                  Change
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 text-center">
                  Enter 6-Digit OTP Code *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="••••••"
                    autoFocus
                    required
                    className="w-full text-center tracking-[0.5em] text-2xl font-black font-mono py-3.5 px-4 rounded-xl border-2 border-slate-200 focus:border-[#15b7b9] focus:outline-none focus:ring-4 focus:ring-[#15b7b9]/15 transition-all text-slate-900 placeholder:tracking-widest"
                  />
                </div>
                <div className="flex items-center justify-between mt-2.5 text-xs">
                  <span className="text-slate-500 font-medium">Didn't receive code?</span>
                  {countdown > 0 ? (
                    <span className="font-bold text-slate-400">Resend in {countdown}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isForgotLoading}
                      className="font-bold text-[#15b7b9] hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw size={12} /> Resend OTP
                    </button>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isVerifyLoading || otpCode.trim().length !== 6}
                className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-[#15b7b9] hover:from-emerald-600 hover:to-[#119ea0] text-white font-bold text-sm tracking-wide shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isVerifyLoading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <span>Verify Code</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>

              <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <ArrowLeft size={14} /> Back to Sign In
                </button>
              </div>
            </form>
          )}

          {/* ========================================================
              VIEW 4: FORGOT PASSWORD - STEP 3: NEW PASSWORD
              ======================================================== */}
          {cardMode === 'forgot_new_password' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  New Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    autoFocus
                    required
                    minLength={6}
                    className="w-full pl-11 pr-11 py-3.5 rounded-xl border-2 border-slate-200 focus:border-[#15b7b9] focus:outline-none focus:ring-4 focus:ring-[#15b7b9]/15 transition-all text-slate-800 font-medium text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    required
                    minLength={6}
                    className="w-full pl-11 pr-11 py-3.5 rounded-xl border-2 border-slate-200 focus:border-[#15b7b9] focus:outline-none focus:ring-4 focus:ring-[#15b7b9]/15 transition-all text-slate-800 font-medium text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isResetLoading || !newPassword || !confirmPassword}
                className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#15b7b9] to-sky-600 hover:from-[#119ea0] hover:to-sky-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-[#15b7b9]/25 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isResetLoading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <span>Reset & Save Password</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>

              <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <ArrowLeft size={14} /> Back to Sign In
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default UserLogin;
