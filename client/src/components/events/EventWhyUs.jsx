import React from 'react';
import { CheckCircle } from 'lucide-react';

export default function EventWhyUs({ whyItMatters, whyChooseUs, extraSections }) {
  if (!whyItMatters && !whyChooseUs && (!extraSections || extraSections.length === 0)) return null;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Why Choose Us */}
        {whyChooseUs && (
          <div className="flex flex-col lg:flex-row items-center gap-12 mb-24">
            <div className="w-full lg:w-1/2">
              <div className="rounded-2xl overflow-hidden shadow-2xl relative group">
                <img
                  src={whyChooseUs.image}
                  alt="Why Choose Us"
                  loading="lazy"
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                  onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.style.display = 'none'; }}
                />
              </div>
            </div>
            <div className="w-full lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">{whyChooseUs.title}</h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed whitespace-pre-line">
                {whyChooseUs.description}
              </p>
              {whyChooseUs.points && (
                <ul className="space-y-4 mb-8">
                  {whyChooseUs.points.map((point, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-6 h-6 text-[#15b7b9] mr-4 flex-shrink-0 mt-0.5" />
                      <span className="text-lg text-slate-700 font-medium">{point}</span>
                    </li>
                  ))}
                </ul>
              )}
              {whyChooseUs.highlight && (
                <div className="bg-slate-50 border-l-4 border-[#15b7b9] p-6 rounded-r-lg mb-6 shadow-sm">
                  <p className="text-xl font-semibold text-slate-800">
                    {whyChooseUs.highlight}
                  </p>
                </div>
              )}
              {whyChooseUs.footer && (
                <p className="text-slate-600 italic">
                  {whyChooseUs.footer}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Why It Matters */}
        {whyItMatters && (
          <div className="flex flex-col-reverse lg:flex-row items-center gap-12 bg-cyan-50/50 rounded-3xl p-8 lg:p-12 border border-cyan-100/50">
            <div className="w-full lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">{whyItMatters.title}</h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed whitespace-pre-line">
                {whyItMatters.description}
              </p>
              <ul className="space-y-4">
                {whyItMatters.points.map((point, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="w-6 h-6 text-[#15b7b9] mr-4 flex-shrink-0 mt-0.5" />
                    <span className="text-lg text-slate-700 font-medium">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="w-full lg:w-1/2">
              <div className="rounded-2xl overflow-hidden shadow-xl relative group border-4 border-white">
                <img
                  src={whyItMatters.image}
                  alt="Our Process"
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                  onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.style.display = 'none'; }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Extra Sections */}
        {extraSections && extraSections.map((section, index) => (
          <div key={index} className={`flex flex-col lg:flex-row items-center gap-12 mt-24 ${index % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>
            <div className="w-full lg:w-1/2">
              <div className="rounded-2xl overflow-hidden shadow-2xl relative group">
                <img
                  src={section.image || '/placeholder-image.jpg'}
                  alt={section.title}
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                  onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.style.display = 'none'; }}
                />
              </div>
            </div>
            <div className="w-full lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">{section.title}</h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed whitespace-pre-line">
                {section.description}
              </p>
              {section.points && (
                <ul className="space-y-4">
                  {section.points.map((point, idx) => (
                    <li key={idx} className="flex items-start">
                      <CheckCircle className="w-6 h-6 text-[#15b7b9] mr-4 flex-shrink-0 mt-0.5" />
                      <span className="text-lg text-slate-700 font-medium">{point}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}

      </div>
    </section>
  );
}
