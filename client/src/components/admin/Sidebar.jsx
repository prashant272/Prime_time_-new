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
  Image as ImageIcon
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';
import { useLogoutMutation } from '../../store/apiSlice';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Nominations', path: '/admin/nominations', icon: Trophy },
    { name: 'Inquiries', path: '/admin/contact', icon: MessageSquare },
    { name: 'Award Categories', path: '/admin/award-categories', icon: Tag },
    { name: 'Award Events', path: '/admin/award-events', icon: Award },
    { name: 'Blogs', path: '/admin/blogs', icon: FileText },
    { name: 'Media Gallery', path: '/admin/gallery', icon: ImageIcon },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white min-h-screen flex flex-col z-20 shadow-xl relative">
      <div className="p-6 border-b border-slate-800 mb-6">
        <h2 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-blue-400 tracking-tight">
          Admin Portal
        </h2>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-200 font-semibold tracking-wide text-[15px] ${isActive
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                : 'text-slate-200 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 mt-4">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 px-4 py-3 w-full rounded-xl text-red-400 font-bold hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
