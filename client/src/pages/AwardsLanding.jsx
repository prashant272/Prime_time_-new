import React from 'react';
import { useGetAwardCategoriesQuery, useGetAwardEventsQuery } from '../store/apiSlice';
import PageContainer from '../components/layout/PageContainer';
import { Link, useParams } from 'react-router-dom';
import SEO from '../components/common/SEO';
import { Award, ChevronRight, Calendar, MapPin } from 'lucide-react';

const AwardsLanding = () => {
  const { categorySlug } = useParams();

  const { data: catResponse, isLoading: catLoading } = useGetAwardCategoriesQuery();
  const categories = catResponse?.data || [];

  const { data: evtResponse, isLoading: evtLoading } = useGetAwardEventsQuery(
    categorySlug ? { category: categorySlug } : {},
    { skip: !categorySlug }
  );

  // Sort events so 'upcoming' status is always at the top
  const events = (evtResponse?.data || []).slice().sort((a, b) => {
    if (a.status === 'upcoming' && b.status !== 'upcoming') return -1;
    if (a.status !== 'upcoming' && b.status === 'upcoming') return 1;
    return 0;
  });

  const currentCat = categories.find(c => c.slug === categorySlug);

  if (catLoading || (categorySlug && evtLoading)) {
    return <div className="py-20 text-center text-slate-500">Loading...</div>;
  }

  // If a specific category is selected, show its events
  if (categorySlug && currentCat) {
    // Generate Event Schema for all events in this category
    const eventSchemas = events.map(ev => ({
      "@context": "https://schema.org",
      "@type": "Event",
      "name": ev.title,
      "startDate": ev.eventDate ? new Date(ev.eventDate).toISOString() : undefined,
      "location": {
        "@type": "Place",
        "name": ev.venue || "TBA",
        "address": ev.venue || "TBA"
      },
      "image": ev.heroImage?.url ? ev.heroImage.url : currentCat.bannerImage ? `https://www.primetimemedia.in${currentCat.bannerImage}` : "https://www.primetimemedia.in/og-image.jpg",
      "description": `Join the prestigious ${ev.title} hosted by Prime Time Research Media.`,
      "organizer": {
        "@type": "Organization",
        "name": "Prime Time Research Media",
        "url": "https://www.primetimemedia.in"
      }
    }));

    return (
      <main className="bg-slate-50 min-h-screen py-16">
        <SEO
          title={`${currentCat.name} | Award Summits`}
          description={currentCat.description ? currentCat.description.substring(0, 150) + "..." : "Explore prestigious award summits, conferences, and recognition events hosted by Prime Time Research Media."}
          image={currentCat.bannerImage ? `https://www.primetimemedia.in${currentCat.bannerImage}` : undefined}
          schema={eventSchemas.length > 0 ? eventSchemas : undefined}
        />

        <PageContainer>
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 font-display">{currentCat.name}</h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Explore all past and upcoming editions of this prestigious award.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.length > 0 ? events.map(ev => (
              <Link
                key={ev._id}
                to={`/awards/${categorySlug}/${ev.slug}`}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 group flex flex-col"
              >
                <div className="h-48 bg-slate-200 overflow-hidden relative">
                  {ev.heroImage?.url ? (
                    <img src={ev.heroImage.url} alt={ev.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-800 text-white opacity-80">
                      <Award size={48} className="text-[#15b7b9]" />
                    </div>
                  )}
                  {ev.year && (
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-800 shadow-sm">
                      {ev.year}
                    </div>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="font-bold text-xl text-slate-800 mb-3 group-hover:text-[#15b7b9] transition-colors">{ev.title}</h3>
                  <div className="mt-auto space-y-2">
                    {ev.venue && (
                      <p className="text-slate-500 text-sm flex items-center gap-2">
                        <MapPin size={16} className="text-[#15b7b9]" /> {ev.venue}
                      </p>
                    )}
                    {ev.eventDate && (
                      <p className="text-slate-500 text-sm flex items-center gap-2">
                        <Calendar size={16} className="text-[#15b7b9]" /> {new Date(ev.eventDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            )) : (
              <div className="col-span-full text-center py-20 text-slate-500">No events found for this category yet.</div>
            )}
          </div>
        </PageContainer>
      </main>
    );
  }

  // Otherwise, show all categories
  return (
    <main className="bg-slate-50 min-h-screen py-16">
      <SEO
        title="Awards & Recognitions | Prime Time Media"
        description="Celebrating excellence and recognizing pioneers across industries through our prestigious national and international award programs."
      />

      <PageContainer>
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 font-display">Awards & Recognitions</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Celebrating excellence and recognizing the pioneers across various industries through our prestigious national and international award programs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.filter(cat => cat.isActive).map(cat => (
            <Link
              key={cat._id}
              to={`/awards/${cat.slug}`}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 group"
            >
              <div className="w-14 h-14 bg-[#15b7b9]/10 rounded-xl flex items-center justify-center text-[#15b7b9] mb-6 group-hover:scale-110 transition-transform">
                <Award size={28} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-4 group-hover:text-[#15b7b9] transition-colors">{cat.name}</h2>
              <div className="flex items-center text-sm font-semibold text-[#15b7b9] group-hover:gap-2 transition-all">
                Explore Events <ChevronRight size={16} className="ml-1 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
              </div>
            </Link>
          ))}
        </div>
      </PageContainer>
    </main>
  );
};

export default AwardsLanding;
