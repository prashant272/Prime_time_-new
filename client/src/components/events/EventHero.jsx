import React from 'react';
import { StaggerContainer, StaggerItem } from '../animations/StaggerFadeIn';

const EventHero = ({ data }) => {
  return (
    <div className="w-full bg-white pt-10 pb-10">
      <StaggerContainer>
        {/* Title */}
        <StaggerItem>
          <h1 className="text-4xl md:text-5xl  text-center font-bold text-[#15b7b9] mb-6">
            {data.title}
          </h1>
        </StaggerItem>

        {/* Description */}
        <StaggerItem>
          <p className="text-base md:text-lg text-slate-900 font-sans leading-relaxed mb-10 text-justify whitespace-pre-line">
            {data.description}
          </p>
        </StaggerItem>

        {/* Main Image */}
        {data.image && (
          <StaggerItem className="w-full">
            <img
              src={data.image}
              alt={data.title}
              className="w-full h-auto object-cover"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </StaggerItem>
        )}
      </StaggerContainer>
    </div>
  );
};

export default EventHero;
