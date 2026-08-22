import React from 'react';
import { StaggerContainer, StaggerItem } from '../animations/StaggerFadeIn';

const EventBenefits = ({ data }) => {
  if (!data || !data.cards || data.cards.length === 0) return null;

  return (
    <div className="py-20 bg-white">
      <div>
        <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-800 mb-12">
          {data.title}
        </h2>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.cards.map((card, index) => (
            <StaggerItem key={index} className="h-full">
              <div
                className="bg-white rounded-xl border-2 backdrop-blur-2xl border-[#15b7b9] overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full"
              >
                {/* Card Image */}
                <div className="w-full h-48 bg-slate-100 flex items-center justify-center relative border-b border-cyan-500/20">
                  {card.image ? (
                    <img
                      src={card.image}
                      alt={card.subtitle}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-cyan-50 to-slate-100 flex items-center justify-center text-slate-400 font-medium text-sm">
                      <span className="text-4xl">🎯</span>
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-6 flex flex-col flex-grow text-center">
                  <h3 className="text-lg font-bold text-slate-800 mb-3">
                    {card.subtitle}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </div>
  );
};

export default EventBenefits;
