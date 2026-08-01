import React from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import { Helmet } from 'react-helmet-async';
import { MapPin, Calendar, Shield, Sparkles, Handshake, Megaphone, User } from 'lucide-react';
import RelatedAwards from '../components/common/RelatedAwards';
import UpcomingEventsSection from '../components/home/UpcomingEventsSection';
import ChiefGuestsCarousel from '../components/home/ChiefGuestsCarousel';

const UpcomingAwardEventView = ({ event, categorySlug, relatedEvents }) => {
    const displayYear = event.year || new Date(event.eventDate).getFullYear() || new Date().getFullYear();
    const locationString = event.venue || "Location TBD";

    return (
        <div className="bg-slate-50 min-h-screen">
            <Helmet><title>{event.title} | Prime Time Media</title></Helmet>

            <PageContainer className="pt-24 pb-32">
                {/* Hero Banner */}
                {event.heroImage?.url ? (
                    <div className="relative w-full mb-12 sm:mb-16 rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] group bg-slate-900">
                        <img
                            src={event.heroImage.url}
                            className="w-full h-auto max-h-[500px] md:max-h-[600px] object-cover"
                            alt={event.heroImage.alt || event.title}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent pointer-events-none" />
                    </div>
                ) : (
                    <div className="relative w-full h-[250px] sm:h-[400px] md:h-[500px] mb-12 rounded-[2rem] overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] border border-slate-800 flex flex-col items-center justify-center text-center p-6 shadow-2xl">
                        <div className="text-4xl sm:text-6xl mb-4 sm:mb-6 animate-pulse text-[#15b7b9]">📅</div>
                        <h3 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-slate-300 mb-3 font-display">Planning in Progress...</h3>
                        <p className="text-slate-300 text-sm sm:text-base max-w-md font-medium">We are currently organizing and uploading promotional media for this upcoming event. Check back soon!</p>
                    </div>
                )}

                <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start mt-12 mb-16">
                    {/* LEFT CONTENT: Event Details */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="bg-white border border-slate-200 rounded-[2rem] p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#15b7b9]/10 blur-[80px] rounded-full pointer-events-none" />

                            <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight text-slate-900 font-display relative z-10">
                                {event.title}
                            </h2>
                            <div className="w-24 h-1.5 bg-gradient-to-r from-[#15b7b9] to-blue-600 mb-8 rounded-full relative z-10"></div>

                            <div className="prose prose-lg prose-slate max-w-none relative z-10">
                                {event.narrativeHtml ? (
                                    <div dangerouslySetInnerHTML={{ __html: event.narrativeHtml }} />
                                ) : (
                                    <div className="space-y-6 text-slate-700 text-lg leading-relaxed">
                                        {event.shortDescription && <p className="font-medium text-slate-900 text-xl border-l-4 border-[#15b7b9] pl-4">{event.shortDescription}</p>}
                                        <p>
                                            The event aims to recognize and honor outstanding contributions, celebrating professionals who are driving innovation and excellence.
                                        </p>
                                        <h4 className="text-slate-900 font-bold text-xl pt-4">Recognizing Excellence</h4>
                                        <p>
                                            This edition continues our legacy by honoring those who have made a significant impact on industry and entrepreneurship.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Features Box Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="bg-white border border-slate-200 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center shadow-md hover:border-[#15b7b9]/50 hover:bg-[#15b7b9]/5 transition-all group">
                                <Sparkles className="text-[#15b7b9] w-12 h-12 mb-5 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                                <h4 className="text-slate-900 font-black tracking-widest text-sm mb-2 uppercase">RECOGNITION</h4>
                                <p className="text-slate-500 text-xs font-bold tracking-[0.2em] uppercase">ELITE GLOBAL FAME</p>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center shadow-md hover:border-[#15b7b9]/50 hover:bg-[#15b7b9]/5 transition-all group">
                                <Handshake className="text-[#15b7b9] w-12 h-12 mb-5 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                                <h4 className="text-slate-900 font-black tracking-widest text-sm mb-2 uppercase">NETWORKING</h4>
                                <p className="text-slate-500 text-xs font-bold tracking-[0.2em] uppercase">VVIP CONNECTIONS</p>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center shadow-md hover:border-[#15b7b9]/50 hover:bg-[#15b7b9]/5 transition-all group">
                                <Megaphone className="text-[#15b7b9] w-12 h-12 mb-5 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                                <h4 className="text-slate-900 font-black tracking-widest text-sm mb-2 uppercase">NEWS</h4>
                                <p className="text-slate-500 text-xs font-bold tracking-[0.2em] uppercase">TOP MEDIA COVERAGE</p>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT CONTENT: Sidebar Cards */}
                    <div className="lg:col-span-4 space-y-8 sticky top-28">
                        {/* Registration Box */}
                        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#15b7b9]/20 blur-[50px] rounded-full pointer-events-none" />

                            <div className="flex items-center gap-3 mb-10 relative z-10">
                                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_12px_#22c55e]"></div>
                                <h3 className="text-[#15b7b9] font-black tracking-[0.2em] text-xs uppercase">Nominations Open</h3>
                            </div>

                            <div className="space-y-8 mb-10 relative z-10">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 shrink-0 rounded-2xl border border-[#15b7b9]/30 flex items-center justify-center bg-[#15b7b9]/10 text-[#15b7b9]">
                                        <Calendar size={26} strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <p className="text-[#15b7b9] text-[10px] font-black tracking-[0.2em] uppercase mb-1.5">Event Date</p>
                                        <p className="text-white font-bold text-lg leading-tight">
                                            {event.eventDate ? new Date(event.eventDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : "To Be Announced"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 shrink-0 rounded-2xl border border-[#15b7b9]/30 flex items-center justify-center bg-[#15b7b9]/10 text-[#15b7b9]">
                                        <MapPin size={26} strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <p className="text-[#15b7b9] text-[10px] font-black tracking-[0.2em] uppercase mb-1.5">Venue Location</p>
                                        <p className="text-white font-bold text-lg leading-tight">{locationString}</p>
                                    </div>
                                </div>
                                
                                {event.chiefGuest && (
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 shrink-0 rounded-2xl border border-[#15b7b9]/30 flex items-center justify-center bg-[#15b7b9]/10 text-[#15b7b9]">
                                            <User size={26} strokeWidth={1.5} />
                                        </div>
                                        <div>
                                            <p className="text-[#15b7b9] text-[10px] font-black tracking-[0.2em] uppercase mb-1.5">Chief Guest</p>
                                            <p className="text-white font-bold text-lg leading-tight">{event.chiefGuest}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4 relative z-10">
                                <Link to="/nomination" className="relative w-full py-5 px-6 rounded-xl font-black text-white overflow-hidden group/btn transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-[#15b7b9] shadow-lg shadow-[#15b7b9]/20">
                                    <span className="relative z-10 text-sm tracking-[0.15em] uppercase">NOMINATE NOW</span>
                                    <svg className="w-5 h-5 relative z-10 group-hover/btn:translate-x-2 transition-transform duration-500 text-white" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                </Link>
                            </div>
                        </div>

                        {/* Trusted Recognition Hub Box */}
                        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-lg flex items-center gap-6">
                            <div className="w-14 h-16 shrink-0 bg-rose-50 rounded-t-sm rounded-b-[1.5rem] flex items-center justify-center text-rose-600 border-2 border-rose-100">
                                <Shield size={28} fill="currentColor" className="text-rose-500" />
                            </div>
                            <h4 className="text-slate-800 font-black tracking-[0.15em] text-xs sm:text-sm uppercase leading-relaxed flex-1">
                                The World's Most Trusted Recognition Hub
                            </h4>
                        </div>
                    </div>
                </div>

                {/* Guests Carousel */}
                <div className="my-20 -mx-4 md:mx-0">
                    <ChiefGuestsCarousel />
                </div>

                {/* Evaluation Architecture */}
                <section className="bg-white p-8 sm:p-14 md:p-16 rounded-[2rem] sm:rounded-[3rem] border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative overflow-hidden mt-16 mb-20">
                    <div className="text-center mb-12 sm:mb-20 relative z-10">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4 font-display">
                            Registration & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#15b7b9] to-blue-600">Evaluation</span>
                        </h2>
                        <div className="w-24 h-1 bg-gradient-to-r from-[#15b7b9] to-blue-600 mx-auto rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12 relative z-10">
                        {[
                            { title: "Nominate", desc: "Submit your application for the upcoming awards." },
                            { title: "Audit", desc: "Detailed performance analysis and benchmarking." },
                            { title: "Review", desc: "Secondary feedback from industry peers." },
                            { title: "Jury", desc: "Final selection by our elite board of experts." }
                        ].map((step, i) => (
                            <div key={i} className="text-center group relative">
                                {/* Connecting Line for desktop */}
                                {i < 3 && <div className="hidden lg:block absolute top-[2.5rem] sm:top-[3rem] left-[60%] w-[80%] h-[2px] bg-slate-200 z-0 group-hover:bg-[#15b7b9] transition-colors duration-500"></div>}

                                <div className="relative z-10 w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-white border-2 border-slate-200 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-black text-slate-400 mb-6 shadow-sm group-hover:border-[#15b7b9] group-hover:text-[#15b7b9] group-hover:scale-110 transition-all duration-500 bg-clip-padding">
                                    0{i + 1}
                                </div>
                                <h4 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 group-hover:text-[#15b7b9] transition-colors">{step.title}</h4>
                                <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-[180px] sm:max-w-[220px] mx-auto">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Section: Related Awards */}
                <RelatedAwards relatedEvents={relatedEvents} categorySlug={categorySlug} />
                <UpcomingEventsSection />

            </PageContainer>
        </div>
    );
};

export default UpcomingAwardEventView;
