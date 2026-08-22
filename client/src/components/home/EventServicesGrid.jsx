import React from 'react';
import { Link } from 'react-router-dom';
import { StaggerContainer, StaggerItem } from '../animations/StaggerFadeIn';
import { eventServicesData } from '../../data/eventServicesData';

const EventServicesGrid = () => {
  return (
    <section className="py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header Section */}
        <div className="text-center mb-16">
          <h4 className="text-sky-700 font-bold uppercase tracking-widest text-sm mb-4">OUR EVENTS</h4>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-black mb-6">Event Management Services</h2>
          <p className="text-gray-700 max-w-3xl mx-auto leading-relaxed">
            From corporate events and brand activations to luxury weddings and automotive launches, PRIME TIME MEDIA creates unforgettable event experiences across Delhi NCR and India.
          </p>
        </div>

        {/* Grid Section */}
        <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {eventServicesData.map((service) => (
            <StaggerItem key={service.id} className="group bg-white-800 rounded-2xl overflow-hidden shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 flex flex-col h-full border border-gray-100 p-4 md:p-5">
              <Link to={`/event-services/${service.id}`} className="flex flex-col h-full">

                {/* Image Container with Fallback */}
                <div className="w-full relative overflow-hidden rounded-md bg-gray-100">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `<div class="w-full aspect-video flex flex-col items-center justify-center bg-gradient-to-br from-cyan-50 to-slate-100 text-slate-400 p-4 text-center"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mb-2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg><span class="text-xs font-medium">Image coming soon</span></div>`;
                    }}
                  />
                </div>

                {/* Content Container */}
                <div className="pt-5 pb-2 flex flex-col flex-grow bg-white">
                  <h3 className="text-2xl font-bold text-sky-700 mb-3 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed flex-grow">
                    {service.shortDescription}
                  </p>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>

      </div>
    </section>
  );
};

export default EventServicesGrid;
