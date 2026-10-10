import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams, Link, Navigate } from 'react-router-dom';
import { useUserRegisterMutation } from '../../store/apiSlice';
import { setUserCredentials } from '../../store/authSlice';
import { Lock, Mail, Loader2, ArrowRight, Eye, EyeOff, User, Phone, Sparkles } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const UserRegister = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/profile';

  const { userInfo } = useSelector((state) => state.auth);
  const [userRegister, { isLoading }] = useUserRegisterMutation();

  if (userInfo) {
    return <Navigate to={redirect} replace />;
  }

  const password = watch('password');

  const onSubmit = async (data) => {
    setErrorMsg('');
    try {
      const res = await userRegister(data).unwrap();
      dispatch(setUserCredentials(res.data));
      navigate(redirect);
    } catch (err) {
      setErrorMsg(err.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-16 px-4 relative overflow-hidden">
      <Helmet>
        <title>Create an Account | TimeMedia</title>
      </Helmet>

      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#15b7b9]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden relative z-10">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-center text-white relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-bold tracking-wider uppercase mb-3 text-[#15b7b9]">
            <Sparkles size={14} /> Join TimeMedia
          </div>
          <h1 className="text-2xl md:text-3xl font-black font-display tracking-tight">
            Create Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#15b7b9] to-sky-400">Account</span>
          </h1>
          <p className="text-slate-300 text-sm mt-1 max-w-md mx-auto">
            Manage your profile, track nomination statuses, and unlock seamless award entries
          </p>
        </div>

        <div className="p-8 sm:p-10">
          {errorMsg && (
            <div className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-2xl text-sm font-semibold border border-rose-100 text-center animate-shake">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Full Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 ${
                      errors.name ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-[#15b7b9]'
                    } focus:outline-none focus:ring-4 focus:ring-[#15b7b9]/15 transition-all text-slate-800 font-medium text-sm`}
                    {...register('name', { required: 'Full Name is required' })}
                  />
                </div>
                {errors.name && (
                  <span className="text-rose-500 text-xs font-semibold mt-1 block">{errors.name.message}</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="tel"
                    placeholder="+91 9876543210"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-[#15b7b9] focus:outline-none focus:ring-4 focus:ring-[#15b7b9]/15 transition-all text-slate-800 font-medium text-sm"
                    {...register('phone')}
                  />
                </div>
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <input
                  type="email"
                  placeholder="you@company.com"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 ${
                    errors.email ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-[#15b7b9]'
                  } focus:outline-none focus:ring-4 focus:ring-[#15b7b9]/15 transition-all text-slate-800 font-medium text-sm`}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+\.\S+$/i, message: 'Invalid email address' }
                  })}
                />
              </div>
              {errors.email && (
                <span className="text-rose-500 text-xs font-semibold mt-1 block">{errors.email.message}</span>
              )}
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 6 chars"
                    className={`w-full pl-10 pr-10 py-3 rounded-xl border-2 ${
                      errors.password ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-[#15b7b9]'
                    } focus:outline-none focus:ring-4 focus:ring-[#15b7b9]/15 transition-all text-slate-800 font-medium text-sm`}
                    {...register('password', {
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Password must be at least 6 characters' }
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <span className="text-rose-500 text-xs font-semibold mt-1 block">{errors.password.message}</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Re-enter password"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 ${
                      errors.confirmPassword ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-[#15b7b9]'
                    } focus:outline-none focus:ring-4 focus:ring-[#15b7b9]/15 transition-all text-slate-800 font-medium text-sm`}
                    {...register('confirmPassword', {
                      required: 'Please confirm password',
                      validate: value => value === password || 'Passwords do not match'
                    })}
                  />
                </div>
                {errors.confirmPassword && (
                  <span className="text-rose-500 text-xs font-semibold mt-1 block">{errors.confirmPassword.message}</span>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-4 px-6 rounded-2xl bg-gradient-to-r from-[#15b7b9] to-sky-600 hover:from-[#119ea0] hover:to-sky-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-[#15b7b9]/25 hover:shadow-xl hover:shadow-[#15b7b9]/35 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-600">
              Already have an account?{' '}
              <Link
                to={`/login${redirect !== '/profile' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
                className="font-bold text-[#15b7b9] hover:text-[#119ea0] transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserRegister;
