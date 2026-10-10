import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Settings,
  LogOut,
  FileText,
  MessageSquare,
  Award,
  Trophy,
  Tag,
  Image as ImageIcon,
  ShieldCheck,
  UserCheck,
  ClipboardCheck
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/authSlice';
import { useLogoutMutation } from '../../store/apiSlice';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { adminInfo } = useSelector((state) => state.auth);

  const [logoutMutation] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
      dispatch(logout());
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, permissionKey: 'dashboard' },
    { name: 'Nominations', path: '/admin/nominations', icon: Trophy, permissionKey: 'nominations' },
    { name: 'Questionnaire Nominations', path: '/admin/questionnaire-nominations', icon: ClipboardCheck, permissionKey: 'questionnaireNominations' },
    { name: 'Editions', path: '/admin/nomination-settings', icon: Settings, permissionKey: 'nominationSettings' },
    { name: 'Inquiries', path: '/admin/contact', icon: MessageSquare, permissionKey: 'inquiries' },
    { name: 'Award Categories', path: '/admin/award-categories', icon: Tag, permissionKey: 'awardCategories' },
    { name: 'Award Events', path: '/admin/award-events', icon: Award, permissionKey: 'awardEvents' },
    { name: 'Blogs', path: '/admin/blogs', icon: FileText, permissionKey: 'blogs' },
    { name: 'Media Gallery', path: '/admin/gallery', icon: ImageIcon, permissionKey: 'gallery' },
    { name: 'Settings', path: '/admin/settings', icon: Settings, permissionKey: 'settings' },
  ];

  const isSuperAdmin = adminInfo?.role === 'admin' || adminInfo?.role === 'superadmin' || !adminInfo?.role;
  const visibleNavItems = navItems.filter((item) => {
    if (isSuperAdmin) return true;
    return adminInfo?.permissions?.[item.permissionKey] === true;
  });

  return (
    <div className="w-64 bg-slate-900 text-white h-full max-h-screen flex flex-col z-20 shadow-xl relative overflow-hidden">
      <div className="p-5 border-b border-slate-800 flex-shrink-0">
        <h2 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-blue-400 tracking-tight">
          Admin Portal
        </h2>
        <div className="mt-1.5 flex items-center gap-1.5">
          {isSuperAdmin ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
              <ShieldCheck size={12} /> Super Administrator
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-sky-400 bg-sky-400/10 px-2 py-0.5 rounded border border-sky-400/20">
              <UserCheck size={12} /> Staff Member
            </span>
          )}
        </div>
      </div>

      <nav className="flex-1 min-h-0 px-3 py-2 space-y-1 overflow-y-auto custom-scrollbar">
        {visibleNavItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 font-semibold tracking-wide text-sm ${isActive
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{item.name}</span>
          </NavLink>
        ))}

        {visibleNavItems.length === 0 && (
          <div className="p-4 text-center text-slate-500 text-xs font-semibold">
            No tabs assigned yet. Please contact your Super Administrator.
          </div>
        )}
      </nav>

      <div className="p-3 border-t border-slate-800 flex-shrink-0 bg-slate-900">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 px-3 py-2.5 w-full rounded-xl text-red-400 font-bold hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 text-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
