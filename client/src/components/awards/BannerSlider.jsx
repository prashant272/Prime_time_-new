import React, { useState, useEffect } from "react";

// Banner slider with auto-scroll and modern UI
export default function BannerSlider({ images }) {
    const [curr, setCurr] = useState(0);

    useEffect(() => {
        if (!images || images.length === 0) return;
        const timer = setInterval(() => {
            setCurr((c) => (c + 1) % images.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [images]);

    if (!images || images.length === 0) {
        return (
            <div className="relative w-full h-[250px] sm:h-[400px] md:h-[500px] mb-12 rounded-[2rem] overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] border border-white/10 flex flex-col items-center justify-center text-center p-6 shadow-2xl">
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 pointer-events-none mix-blend-overlay"></div>
                <div className="text-4xl sm:text-6xl mb-4 sm:mb-6 animate-pulse text-[#15b7b9]">📅</div>
                <h3 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-slate-300 mb-3 font-display">Planning in Progress...</h3>
                <p className="text-slate-300 text-sm sm:text-base max-w-md font-medium">We are currently organizing and uploading promotional media for this upcoming event. Check back soon!</p>
            </div>
        );
    }

    function next() { setCurr((c) => (c + 1) % images.length); }
    function prev() { setCurr((c) => (c - 1 + images.length) % images.length); }

    return (
        <div className="relative w-full mb-12 sm:mb-16 rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] group bg-slate-900">
            <img
                src={images[curr]?.url || images[curr]}
                className="w-full h-auto max-h-[600px] object-cover transform scale-105 group-hover:scale-100 transition duration-1000 ease-out"
                alt={`Banner ${curr + 1}`}
                loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent opacity-90 pointer-events-none" />
            
            {/* Navigation Buttons */}
            <button
                aria-label="Previous"
                onClick={prev}
                className="absolute top-1/2 -translate-y-1/2 left-4 sm:left-8 w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center bg-white/20 hover:bg-[#15b7b9] hover:text-white backdrop-blur-sm text-white rounded-full transition-all duration-300 z-10 border border-white/30 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0"
            >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button
                aria-label="Next"
                onClick={next}
                className="absolute top-1/2 -translate-y-1/2 right-4 sm:right-8 w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center bg-white/20 hover:bg-[#15b7b9] hover:text-white backdrop-blur-sm text-white rounded-full transition-all duration-300 z-10 border border-white/30 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0"
            >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>

            {/* Navigation Dots */}
            {images.length > 1 && (
                <div className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3 z-20 bg-black/40 backdrop-blur-md px-5 py-3 rounded-full border border-white/20 shadow-xl">
                    {images.map((_, i) => (
                        <button
                            key={i}
                            aria-label={`Go to banner ${i + 1}`}
                            onClick={() => setCurr(i)}
                            className={`h-2 sm:h-2.5 rounded-full transition-all duration-500 ${curr === i
                                ? "bg-[#15b7b9] w-8 sm:w-12 shadow-[0_0_15px_rgba(21,183,185,0.6)]"
                                : "bg-white/60 w-2.5 hover:bg-white"
                                }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
