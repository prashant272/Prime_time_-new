import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { eventServicesData } from '../../data/eventServicesData';

const RelatedEventServices = ({ currentServiceId }) => {
  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Use all event services except the current one
  const services = eventServicesData.filter(s => s.id !== currentServiceId);
  const scrollItems = [...services, ...services, ...services, ...services]; // Duplicate for infinite effect

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 350; // card width + gap approx
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollPosition = scrollRef.current.scrollLeft;
      const newIndex = Math.round(scrollPosition / 350);
      setActiveIndex(newIndex % services.length);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        // If we've reached the end, scroll back to the start
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scroll('right');
        }
      }
    }, 3500); // Auto scroll every 3.5 seconds

    return () => clearInterval(interval);
  }, []);

  if (services.length === 0) return null;

  return (
    <div className="py-20 bg-white overflow-hidden border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-[#111827]">
            Explore Other Event Services
          </h2>
          <div className="w-16 h-1 bg-[#15b7b9] mx-auto rounded-full mt-4"></div>
        </div>

        <div className="relative w-full group mt-4">
        {/* Left Arrow */}
        <button 
          onClick={() => scroll('left')} 
          className="absolute left-2 md:-left-4 top-[40%] -translate-y-1/2 z-20 p-2 text-white bg-black/30 rounded-full hover:bg-black/50 transition-colors backdrop-blur-sm shadow-md"
        >
          <ChevronLeft size={24} strokeWidth={2} />
        </button>

        {/* Scroll Container */}
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-4 md:gap-6 px-4 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {scrollItems.map((service, index) => (
            <Link
              key={`${service.id}-${index}`}
              to={`/event-services/${service.id}`}
              className="flex-shrink-0 w-[280px] sm:w-[320px] md:w-[350px] block group/card snap-center"
            >
              <div className="rounded-[12px] overflow-hidden border border-gray-200 shadow-sm relative bg-gray-100 transition-all hover:shadow-lg group-hover/card:border-[#15b7b9] p-4 md:p-5">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-auto rounded-xl group-hover/card:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = `<div class="w-full aspect-video flex flex-col items-center justify-center bg-gray-100 text-gray-400 p-4 text-center"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mb-2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg><span class="text-[10px] font-medium uppercase tracking-wider">Coming Soon</span></div>`;
                  }}
                />
              </div>
              
              {/* Title below image */}
              <h3 className="mt-4 text-center font-bold text-slate-800 group-hover/card:text-[#15b7b9] transition-colors">
                {service.title}
              </h3>
            </Link>
          ))}
        </div>

        {/* Right Arrow */}
        <button 
          onClick={() => scroll('right')} 
          className="absolute right-2 md:-right-4 top-[40%] -translate-y-1/2 z-20 p-2 text-white bg-black/30 rounded-full hover:bg-black/50 transition-colors backdrop-blur-sm shadow-md"
        >
          <ChevronRight size={24} strokeWidth={2} />
        </button>
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center items-center gap-2 mt-10 flex-wrap max-w-2xl mx-auto">
        {services.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              if (scrollRef.current) {
                scrollRef.current.scrollTo({ left: index * 350, behavior: 'smooth' });
                setActiveIndex(index);
              }
            }}
            className={`transition-all duration-300 rounded-full ${
              activeIndex === index 
                ? 'w-6 h-2 bg-[#15b7b9]' 
                : 'w-2 h-2 bg-slate-300 hover:bg-slate-400'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
      </div>
      
      <style dangerouslySetInnerHTML={{
        __html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}} />
    </div>
  );
};

export default RelatedEventServices;
