import React, { useEffect } from 'react';
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useSelector, useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { useGetAdminProfileQuery } from '../../store/apiSlice';
import { setCredentials, logout } from '../../store/authSlice';

const ROUTE_PERMISSION_MAP = [
  { path: '/admin/dashboard', key: 'dashboard', name: 'Dashboard' },
  { path: '/admin/nominations', key: 'nominations', name: 'Nominations' },
  { path: '/admin/questionnaire-nominations', key: 'questionnaireNominations', name: 'Questionnaire Nominations' },
  { path: '/admin/nomination-settings', key: 'nominationSettings', name: 'Editions' },
  { path: '/admin/contact', key: 'inquiries', name: 'Inquiries' },
  { path: '/admin/award-categories', key: 'awardCategories', name: 'Award Categories' },
  { path: '/admin/award-events', key: 'awardEvents', name: 'Award Events' },
  { path: '/admin/blogs', key: 'blogs', name: 'Blogs' },
  { path: '/admin/gallery', key: 'gallery', name: 'Media Gallery' },
  { path: '/admin/settings', key: 'settings', name: 'Settings' },
];

const AdminLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { adminInfo } = useSelector((state) => state.auth);
  const location = useLocation();

  // Sync admin profile on page load / refresh (no recurring polling overhead)
  const { data: currentAdminProfile } = useGetAdminProfileQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    if (currentAdminProfile) {
      if (currentAdminProfile.status === 'inactive') {
        dispatch(logout());
        navigate('/admin/login');
        return;
      }
      // If permissions or status changed, sync to Redux and localStorage immediately
      const prevPerms = JSON.stringify(adminInfo?.permissions || {});
      const newPerms = JSON.stringify(currentAdminProfile.permissions || {});
      if (prevPerms !== newPerms || adminInfo?.status !== currentAdminProfile.status) {
        dispatch(setCredentials(currentAdminProfile));
      }
    }
  }, [currentAdminProfile, adminInfo, dispatch, navigate]);

  const isSuperAdmin = adminInfo?.role === 'admin' || adminInfo?.role === 'superadmin' || !adminInfo?.role;

  // Determine if the current route is blocked by staff permissions
  const currentRouteConfig = ROUTE_PERMISSION_MAP.find((item) =>
    location.pathname.startsWith(item.path)
  );

  const isBlocked =
    !isSuperAdmin &&
    currentRouteConfig &&
    adminInfo?.permissions?.[currentRouteConfig.key] === false;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Helmet>
        <title>Admin Dashboard | TimeMedia</title>
      </Helmet>
      
      {/* Sidebar - Fixed width on desktop */}
      <div className="hidden md:block w-64 flex-shrink-0">
        <div className="fixed w-64 h-full">
          <Sidebar />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-slate-200 h-16 flex items-center justify-between px-6 sticky top-0 z-10">
          <h1 className="text-xl font-bold text-slate-800 hidden md:block">
            {currentRouteConfig ? currentRouteConfig.name : 'Portal Overview'}
          </h1>
          <div className="flex items-center gap-4 ml-auto">
            <div className="text-sm text-right">
              <p className="text-slate-500 text-xs">Logged in as</p>
              <p className="font-bold text-slate-800 leading-tight">{adminInfo?.name || 'Administrator'}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-bold border-2 border-sky-200 shadow-sm">
              {adminInfo?.name ? adminInfo.name.charAt(0).toUpperCase() : 'A'}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {isBlocked ? (
            <div className="max-w-xl mx-auto my-12 bg-white border border-red-200 rounded-2xl p-8 shadow-sm text-center">
              <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100">
                <ShieldAlert size={28} />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Access Restricted</h2>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                You do not have permission to access the <span className="font-semibold text-slate-800">{currentRouteConfig?.name}</span> module. 
                Please contact your Super Administrator to request permission access.
              </p>
              <Link
                to="/admin/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors shadow-sm"
              >
                Return to Permitted Modules
              </Link>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
