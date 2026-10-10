import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ChevronDown, Menu, X, User, Trophy, LogOut, Sparkles } from 'lucide-react';
import { servicesList } from '../../data/servicesData';
import { advertisingServicesData } from '../../data/advertisingServicesData';
import { eventServicesData } from '../../data/eventServicesData';
import { useGetAwardCategoriesQuery, useGetAwardEventsQuery, useUserLogoutMutation } from '../../store/apiSlice';
import { userLogout } from '../../store/authSlice';

const Navbar = () => {
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [advertisingDropdownOpen, setAdvertisingDropdownOpen] = useState(false);
  const [eventsDropdownOpen, setEventsDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [awardsMobileOpen, setAwardsMobileOpen] = useState(false);
  const [advertisingMobileOpen, setAdvertisingMobileOpen] = useState(false);
  const [eventsMobileOpen, setEventsMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch();

  const { userInfo } = useSelector((state) => state.auth);
  const [logoutApi] = useUserLogoutMutation();

  const handleUserLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch (e) {}
    dispatch(userLogout());
    setUserMenuOpen(false);
  };

  const { data: catRes } = useGetAwardCategoriesQuery();
  const { data: evtRes } = useGetAwardEventsQuery({});

  const categories = catRes?.data || [];
  const events = evtRes?.data || [];

  const getEventsForCategory = (catId) => {
    if (catId === 'upcoming-hardcode') {
      return events.filter(ev => ev.status === 'upcoming');
    }
    return events.filter(ev => ev.category?._id === catId && ev.status !== 'upcoming');
  };

  const [activeCategory, setActiveCategory] = useState(null);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setServicesDropdownOpen(false);
    setAdvertisingDropdownOpen(false);
    setEventsDropdownOpen(false);
    setAwardsMobileOpen(false);
    setAdvertisingMobileOpen(false);
    setEventsMobileOpen(false);
    setActiveCategory(null);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Our Patrons', path: '/our-patrons' },
    { name: 'Awards', path: '/awards' },
    // Services is handled separately
    { name: 'Nomination', path: '/nomination' },
    { name: 'Contact Us', path: '/contact' },
    { name: 'Blog', path: '/blog' },
  ];

  return (
    <>
      <header
        className={`bg-white/95 backdrop-blur-md text-slate-900 sticky top-0 z-50 border-b border-slate-100 transition-all duration-300 print:hidden ${
          isScrolled ? 'shadow-md bg-white/98 py-0' : 'shadow-xs'
        }`}
      >
        <div className="w-full max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-3 lg:py-3.5 flex justify-between items-center">

          {/* Logo */}
          <Link
            to="/"
            className={`flex items-center gap-2 flex-shrink-0 relative z-30 transition-opacity duration-300 ${
              mobileMenuOpen ? 'opacity-0 lg:opacity-100 pointer-events-none lg:pointer-events-auto' : 'opacity-100'
            }`}
          >
            <img src="/primetimelogo.gif" alt="Prime Time Media" className="h-12 w-auto lg:h-14 xl:h-[60px] object-contain" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center">
            <ul className="flex items-center gap-2 lg:gap-2.5 xl:gap-4 2xl:gap-6 font-bold text-[11px] lg:text-[11.5px] xl:text-[12.5px] 2xl:text-sm uppercase tracking-wider">
              {navLinks.slice(0, 3).map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className={`relative whitespace-nowrap group/link transition-colors hover:text-[#15b7b9] py-1 ${
                      location.pathname === link.path ? 'text-[#15b7b9]' : 'text-slate-800'
                    }`}
                  >
                    {link.name}
                    <span
                      className={`absolute -bottom-1 left-0 w-full h-[2px] bg-[#15b7b9] transform origin-left transition-transform duration-300 ${
                        location.pathname === link.path ? 'scale-x-100' : 'scale-x-0 group-hover/link:scale-x-100'
                      }`}
                    ></span>
                  </Link>
                </li>
              ))}

              {/* Awards Dropdown (Desktop) */}
              <li className="relative group h-full py-1">
                <Link
                  to="/awards"
                  className={`flex items-center whitespace-nowrap relative group/link transition-colors gap-1 uppercase font-bold text-[11px] lg:text-[11.5px] xl:text-[12.5px] 2xl:text-sm ${
                    location.pathname.includes('/awards') ? 'text-[#15b7b9]' : 'text-slate-800'
                  } hover:text-[#15b7b9]`}
                >
                  Awards <ChevronDown size={14} className="transition-transform duration-200 group-hover:rotate-180" />
                  <span
                    className={`absolute -bottom-1 left-0 w-full h-[2px] bg-[#15b7b9] transform origin-left transition-transform duration-300 ${
                      location.pathname.includes('/awards') ? 'scale-x-100' : 'scale-x-0 group-hover/link:scale-x-100'
                    }`}
                  ></span>
                </Link>

                <div className="absolute top-full left-0 w-64 bg-white shadow-xl rounded-xl border border-slate-100 transition-all duration-300 origin-top z-50 opacity-0 scale-y-0 invisible group-hover:opacity-100 group-hover:scale-y-100 group-hover:visible pt-2">
                  <div className="py-2 flex flex-col bg-white rounded-xl shadow-lg border border-slate-100">
                    {categories.map((cat) => (
                      <div
                        key={cat._id}
                        className="relative group/sub"
                        onMouseEnter={() => setActiveCategory(cat._id)}
                        onMouseLeave={() => setActiveCategory(null)}
                      >
                        <Link
                          to={`/awards/${cat.slug}`}
                          className={`px-4 py-2.5 text-xs font-bold transition-colors flex justify-between items-center text-left uppercase tracking-wider hover:bg-slate-50 hover:text-[#15b7b9] ${
                            location.pathname.includes(`/awards/${cat.slug}`) ? 'text-[#15b7b9] bg-slate-50' : 'text-slate-700'
                          }`}
                        >
                          {cat.name}
                          <ChevronDown size={14} className="-rotate-90 text-slate-400 group-hover/sub:text-[#15b7b9] transition-colors" />
                        </Link>

                        {/* Nested Events Dropdown */}
                        <div
                          className={`absolute top-0 left-full ml-1 w-72 bg-white shadow-xl rounded-xl overflow-hidden border border-slate-100 transition-all duration-200 z-50 ${
                            activeCategory === cat._id ? 'opacity-100 visible translate-x-0' : 'opacity-0 invisible -translate-x-2'
                          }`}
                        >
                          <div className="py-2 flex flex-col max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {getEventsForCategory(cat._id).length > 0 ? (
                              getEventsForCategory(cat._id).map((ev) => (
                                <Link
                                  key={ev._id}
                                  to={`/awards/${cat.slug}/${ev.slug}`}
                                  className={`px-4 py-2 text-[11px] font-bold transition-colors block text-left uppercase tracking-wider hover:bg-slate-50 hover:text-[#15b7b9] ${
                                    location.pathname === `/awards/${cat.slug}/${ev.slug}` ? 'text-[#15b7b9] bg-slate-50' : 'text-slate-600'
                                  }`}
                                >
                                  {ev.title}
                                </Link>
                              ))
                            ) : (
                              <span className="px-4 py-2 text-[11px] text-slate-400 font-medium">No events yet</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </li>

              {/* Services Dropdown (Desktop) */}
              <li
                className="relative group h-full py-1"
                onMouseEnter={() => setServicesDropdownOpen(true)}
                onMouseLeave={() => setServicesDropdownOpen(false)}
              >
                <button
                  className={`flex items-center whitespace-nowrap relative group/link transition-colors gap-1 uppercase font-bold text-[11px] lg:text-[11.5px] xl:text-[12.5px] 2xl:text-sm ${
                    location.pathname.includes('/services') ? 'text-[#15b7b9]' : 'text-slate-800'
                  } hover:text-[#15b7b9]`}
                >
                  Services <ChevronDown size={14} className={`transition-transform duration-200 ${servicesDropdownOpen ? 'rotate-180' : ''}`} />
                  <span
                    className={`absolute -bottom-1 left-0 w-full h-[2px] bg-[#15b7b9] transform origin-left transition-transform duration-300 ${
                      location.pathname.includes('/services') ? 'scale-x-100' : 'scale-x-0 group-hover/link:scale-x-100'
                    }`}
                  ></span>
                </button>

                <div
                  className={`absolute top-full left-0 w-64 bg-white shadow-xl rounded-xl overflow-hidden border border-slate-100 transition-all duration-300 origin-top z-50 pt-2 ${
                    servicesDropdownOpen ? 'opacity-100 scale-y-100 visible' : 'opacity-0 scale-y-0 invisible'
                  }`}
                >
                  <div className="py-2 flex flex-col max-h-[60vh] overflow-y-auto custom-scrollbar bg-white rounded-xl shadow-lg border border-slate-100">
                    {servicesList.map((service) => (
                      <Link
                        key={service.id}
                        to={`/services/${service.id}`}
                        className={`px-4 py-2.5 text-xs font-bold transition-colors block text-left uppercase tracking-wider hover:bg-slate-50 hover:text-[#15b7b9] ${
                          location.pathname === `/services/${service.id}` ? 'text-[#15b7b9] bg-slate-50' : 'text-slate-700'
                        }`}
                        onClick={() => setServicesDropdownOpen(false)}
                      >
                        {service.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </li>

              {/* Advertising Services Dropdown (Desktop) */}
              <li
                className="relative group h-full py-1"
                onMouseEnter={() => setAdvertisingDropdownOpen(true)}
                onMouseLeave={() => setAdvertisingDropdownOpen(false)}
              >
                <button
                  className={`flex items-center whitespace-nowrap relative group/link transition-colors gap-1 uppercase font-bold text-[11px] lg:text-[11.5px] xl:text-[12.5px] 2xl:text-sm ${
                    location.pathname.includes('/advertising-services') ? 'text-[#15b7b9]' : 'text-slate-800'
                  } hover:text-[#15b7b9]`}
                >
                  Advertising <ChevronDown size={14} className={`transition-transform duration-200 ${advertisingDropdownOpen ? 'rotate-180' : ''}`} />
                  <span
                    className={`absolute -bottom-1 left-0 w-full h-[2px] bg-[#15b7b9] transform origin-left transition-transform duration-300 ${
                      location.pathname.includes('/advertising-services') ? 'scale-x-100' : 'scale-x-0 group-hover/link:scale-x-100'
                    }`}
                  ></span>
                </button>

                <div
                  className={`absolute top-full left-0 w-64 bg-white shadow-xl rounded-xl overflow-hidden border border-slate-100 transition-all duration-300 origin-top z-50 pt-2 ${
                    advertisingDropdownOpen ? 'opacity-100 scale-y-100 visible' : 'opacity-0 scale-y-0 invisible'
                  }`}
                >
                  <div className="py-2 flex flex-col max-h-[60vh] overflow-y-auto custom-scrollbar bg-white rounded-xl shadow-lg border border-slate-100">
                    {advertisingServicesData.map((service) => (
                      <Link
                        key={service.id}
                        to={`/advertising-services/${service.id}`}
                        className={`px-4 py-2.5 text-xs font-bold transition-colors block text-left uppercase tracking-wider hover:bg-slate-50 hover:text-[#15b7b9] ${
                          location.pathname === `/advertising-services/${service.id}` ? 'text-[#15b7b9] bg-slate-50' : 'text-slate-700'
                        }`}
                        onClick={() => setAdvertisingDropdownOpen(false)}
                      >
                        {service.title}
                      </Link>
                    ))}
                  </div>
                </div>
              </li>

              {/* Events Services Dropdown (Desktop) */}
              <li
                className="relative group h-full py-1"
                onMouseEnter={() => setEventsDropdownOpen(true)}
                onMouseLeave={() => setEventsDropdownOpen(false)}
              >
                <button
                  className={`flex items-center whitespace-nowrap relative group/link transition-colors gap-1 uppercase font-bold text-[11px] lg:text-[11.5px] xl:text-[12.5px] 2xl:text-sm ${
                    location.pathname.includes('/event-services') ? 'text-[#15b7b9]' : 'text-slate-800'
                  } hover:text-[#15b7b9]`}
                >
                  Events <ChevronDown size={14} className={`transition-transform duration-200 ${eventsDropdownOpen ? 'rotate-180' : ''}`} />
                  <span
                    className={`absolute -bottom-1 left-0 w-full h-[2px] bg-[#15b7b9] transform origin-left transition-transform duration-300 ${
                      location.pathname.includes('/event-services') ? 'scale-x-100' : 'scale-x-0 group-hover/link:scale-x-100'
                    }`}
                  ></span>
                </button>

                <div
                  className={`absolute top-full left-0 w-64 bg-white shadow-xl rounded-xl overflow-hidden border border-slate-100 transition-all duration-300 origin-top z-50 pt-2 ${
                    eventsDropdownOpen ? 'opacity-100 scale-y-100 visible' : 'opacity-0 scale-y-0 invisible'
                  }`}
                >
                  <div className="py-2 flex flex-col max-h-[60vh] overflow-y-auto custom-scrollbar bg-white rounded-xl shadow-lg border border-slate-100">
                    {eventServicesData.map((service) => (
                      <Link
                        key={service.id}
                        to={`/event-services/${service.id}`}
                        className={`px-4 py-2.5 text-xs font-bold transition-colors block text-left uppercase tracking-wider hover:bg-slate-50 hover:text-[#15b7b9] ${
                          location.pathname === `/event-services/${service.id}` ? 'text-[#15b7b9] bg-slate-50' : 'text-slate-700'
                        }`}
                        onClick={() => setEventsDropdownOpen(false)}
                      >
                        {service.title}
                      </Link>
                    ))}
                  </div>
                </div>
              </li>

              {navLinks.slice(4).map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className={`relative whitespace-nowrap group/link transition-colors hover:text-[#15b7b9] py-1 ${
                      location.pathname === link.path ? 'text-[#15b7b9]' : 'text-slate-800'
                    }`}
                  >
                    {link.name}
                    <span
                      className={`absolute -bottom-1 left-0 w-full h-[2px] bg-[#15b7b9] transform origin-left transition-transform duration-300 ${
                        location.pathname === link.path ? 'scale-x-100' : 'scale-x-0 group-hover/link:scale-x-100'
                      }`}
                    ></span>
                  </Link>
                </li>
              ))}

              {/* User Account Button & Dropdown (Desktop) */}
              <li className="relative flex-shrink-0">
                {userInfo ? (
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 pl-2.5 pr-2 py-1 xl:pl-3 xl:pr-2.5 xl:py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors font-bold text-xs cursor-pointer border border-slate-200 whitespace-nowrap flex-shrink-0"
                    >
                      <div className="w-6 h-6 rounded-full bg-[#15b7b9] text-white flex items-center justify-center text-xs font-black uppercase flex-shrink-0">
                        {(userInfo?.name?.trim()?.charAt(0) || userInfo?.email?.charAt(0) || 'U').toUpperCase()}
                      </div>
                      <span className="max-w-[85px] truncate">
                        {(userInfo?.name ? userInfo.name.trim().split(' ')[0] : (userInfo?.email?.split('@')[0] || 'User'))}
                      </span>
                      <ChevronDown size={14} className={`transition-transform duration-200 flex-shrink-0 ${userMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {userMenuOpen && (
                      <div className="absolute top-full right-0 mt-2 w-56 bg-white shadow-xl rounded-2xl border border-slate-100 py-2 z-50 animate-scale-up">
                        <div className="px-4 py-2 border-b border-slate-100">
                          <p className="text-xs font-black text-slate-800 truncate">
                            {userInfo?.name || userInfo?.email || 'User Account'}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">{userInfo?.email}</p>
                        </div>
                        <Link
                          to="/profile?tab=nominations"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-[#15b7b9] transition-colors"
                        >
                          <Trophy size={15} className="text-[#15b7b9]" /> My Nominations
                        </Link>
                        <Link
                          to="/profile?tab=profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-[#15b7b9] transition-colors"
                        >
                          <User size={15} className="text-[#15b7b9]" /> Account Profile
                        </Link>
                        <div className="border-t border-slate-100 mt-1 pt-1">
                          <button
                            onClick={handleUserLogout}
                            className="flex items-center gap-2.5 w-full text-left px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <LogOut size={15} /> Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 xl:px-4 xl:py-2 rounded-full bg-slate-950 hover:bg-[#15b7b9] text-white font-bold text-[11px] xl:text-xs uppercase tracking-wider transition-all duration-200 hover:shadow-md whitespace-nowrap flex-shrink-0"
                  >
                    <User size={13} className="flex-shrink-0" />
                    <span className="whitespace-nowrap">Sign In</span>
                  </Link>
                )}
              </li>
            </ul>
          </nav>

          {/* Mobile Menu Toggle Button */}
          <button
            className={`lg:hidden p-2 text-slate-800 hover:text-[#15b7b9] transition-opacity duration-300 focus:outline-none z-[40] ${mobileMenuOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Toggle Menu"
          >
            <Menu size={28} />
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 lg:hidden ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile Menu Drawer */}
      <div className={`fixed top-0 right-0 h-full w-[85vw] max-w-sm bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* Mobile Menu Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <Link to="/" onClick={() => setMobileMenuOpen(false)}>
            <img src="/primetimelogo.gif" alt="Logo" className="w-12 h-12 object-contain" />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors focus:outline-none"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mobile Menu Links */}
        <div className="flex-1 overflow-y-auto py-6 px-6 flex flex-col gap-6">
          {/* User Status Bar in Mobile Drawer */}
          <div className="pb-4 border-b border-gray-100">
            {userInfo ? (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#15b7b9] text-white flex items-center justify-center font-bold text-sm uppercase">
                    {(userInfo?.name?.trim()?.charAt(0) || userInfo?.email?.charAt(0) || 'U').toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-black text-slate-800 truncate">
                      {userInfo?.name || userInfo?.email || 'User Account'}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{userInfo?.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center text-xs font-bold">
                  <Link
                    to="/profile?tab=nominations"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2 px-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-[#15b7b9]"
                  >
                    My Nominations
                  </Link>
                  <Link
                    to="/profile?tab=profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2 px-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-[#15b7b9]"
                  >
                    Profile
                  </Link>
                </div>
                <button
                  onClick={() => {
                    handleUserLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full mt-2.5 py-2 text-center text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 text-center rounded-xl bg-slate-900 text-white font-bold text-xs uppercase tracking-wider shadow-md"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 text-center rounded-xl bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-wider hover:bg-slate-200 transition-colors"
                >
                  Create an Account
                </Link>
              </div>
            )}
          </div>

          <ul className="flex flex-col space-y-6 font-bold text-sm uppercase tracking-wide">
            {navLinks.slice(0, 3).map((link) => (
              <li key={link.name}>
                <Link
                  to={link.path}
                  className={`block transition-colors hover:text-[#15b7b9] ${location.pathname === link.path ? 'text-[#15b7b9]' : 'text-slate-800'}`}
                >
                  {link.name}
                </Link>
              </li>
            ))}

            {/* Awards Accordion (Mobile) */}
            <li className="flex flex-col">
              <button
                className={`flex items-center justify-between w-full transition-colors uppercase font-bold text-sm ${location.pathname.includes('/awards') ? 'text-[#15b7b9]' : 'text-slate-800'} hover:text-[#15b7b9]`}
                onClick={() => setAwardsMobileOpen(!awardsMobileOpen)}
              >
                Awards
                <ChevronDown size={18} className={`transition-transform duration-300 ${awardsMobileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Mobile Awards Sub-menu */}
              <div
                className={`flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${awardsMobileOpen ? 'max-h-[800px] mt-4 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="pl-4 border-l-2 border-[#15b7b9]/30 flex flex-col space-y-4 py-2">
                  <Link
                    to="/awards"
                    className="text-xs font-black text-slate-800 hover:text-[#15b7b9] uppercase"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    All Awards Overview
                  </Link>
                  {categories.map((cat) => (
                    <div key={cat._id} className="flex flex-col space-y-1 mt-1">
                      <Link
                        to={`/awards/${cat.slug}`}
                        className={`text-[11px] font-bold uppercase tracking-wider ${location.pathname.includes(`/awards/${cat.slug}`) ? 'text-[#15b7b9]' : 'text-slate-700'}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        • {cat.name}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </li>

            {/* Services Accordion (Mobile) */}
            <li className="flex flex-col">
              <button
                className={`flex items-center justify-between w-full transition-colors uppercase font-bold text-sm ${location.pathname.includes('/services') ? 'text-[#15b7b9]' : 'text-slate-800'} hover:text-[#15b7b9]`}
                onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
              >
                Services
                <ChevronDown size={18} className={`transition-transform duration-300 ${servicesDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Mobile Services Sub-menu */}
              <div
                className={`flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${servicesDropdownOpen ? 'max-h-[500px] mt-4 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="pl-4 border-l-2 border-[#15b7b9]/30 flex flex-col space-y-4 py-2">
                  {servicesList.map((service) => (
                    <Link
                      key={service.id}
                      to={`/services/${service.id}`}
                      className={`text-xs font-bold transition-colors block uppercase tracking-wider ${location.pathname === `/services/${service.id}` ? 'text-[#15b7b9]' : 'text-slate-600'}`}
                    >
                      {service.name}
                    </Link>
                  ))}
                </div>
              </div>
            </li>

            {/* Advertising Services Accordion (Mobile) */}
            <li className="flex flex-col">
              <button
                className={`flex items-center justify-between w-full transition-colors uppercase font-bold text-sm ${location.pathname.includes('/advertising-services') ? 'text-[#15b7b9]' : 'text-slate-800'} hover:text-[#15b7b9]`}
                onClick={() => setAdvertisingMobileOpen(!advertisingMobileOpen)}
              >
                Advertising
                <ChevronDown size={18} className={`transition-transform duration-300 ${advertisingMobileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Mobile Advertising Sub-menu */}
              <div
                className={`flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${advertisingMobileOpen ? 'max-h-[800px] mt-4 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="pl-4 border-l-2 border-[#15b7b9]/30 flex flex-col space-y-4 py-2">
                  {advertisingServicesData.map((service) => (
                    <Link
                      key={service.id}
                      to={`/advertising-services/${service.id}`}
                      className={`text-xs font-bold transition-colors block uppercase tracking-wider ${location.pathname === `/advertising-services/${service.id}` ? 'text-[#15b7b9]' : 'text-slate-600'}`}
                    >
                      {service.title}
                    </Link>
                  ))}
                </div>
              </div>
            </li>

            {/* Events Services Accordion (Mobile) */}
            <li className="flex flex-col">
              <button
                className={`flex items-center justify-between w-full transition-colors uppercase font-bold text-sm ${location.pathname.includes('/event-services') ? 'text-[#15b7b9]' : 'text-slate-800'} hover:text-[#15b7b9]`}
                onClick={() => setEventsMobileOpen(!eventsMobileOpen)}
              >
                Events
                <ChevronDown size={18} className={`transition-transform duration-300 ${eventsMobileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Mobile Events Sub-menu */}
              <div
                className={`flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${eventsMobileOpen ? 'max-h-[800px] mt-4 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="pl-4 border-l-2 border-[#15b7b9]/30 flex flex-col space-y-4 py-2">
                  {eventServicesData.map((service) => (
                    <Link
                      key={service.id}
                      to={`/event-services/${service.id}`}
                      className={`text-xs font-bold transition-colors block uppercase tracking-wider ${location.pathname === `/event-services/${service.id}` ? 'text-[#15b7b9]' : 'text-slate-600'}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {service.title}
                    </Link>
                  ))}
                </div>
              </div>
            </li>

            {navLinks.slice(4).map((link) => (
              <li key={link.name}>
                <Link
                  to={link.path}
                  className={`block transition-colors hover:text-[#15b7b9] ${location.pathname === link.path ? 'text-[#15b7b9]' : 'text-slate-800'}`}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default Navbar;
