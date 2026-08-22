import React, { useEffect, useState } from 'react';
import { useLocation, useParams, Navigate } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import { eventServicesDetailData } from '../data/eventServicesDetailData';
import { getEventServiceSEO, buildEventServiceSchema } from '../data/eventServicesSeoData';
import EventHero from '../components/events/EventHero';
import EventBenefits from '../components/events/EventBenefits';
import EventWhyUs from '../components/events/EventWhyUs';
import RelatedEventServices from '../components/events/RelatedEventServices';
import UpcomingEventsSection from '../components/home/UpcomingEventsSection';
import SEO from '../components/common/SEO';
import EventGallery from '../components/home/EventGallery';

export default function EventDetails() {
  const { eventId } = useParams();
  const location = useLocation();
  const [data, setData] = useState(null);

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);

    // Load data
    if (eventId && eventServicesDetailData[eventId]) {
      setData(eventServicesDetailData[eventId]);
    } else {
      setData(null);
    }
  }, [eventId]);

  if (!eventId) {
    return <Navigate to="/event-services/corporate-events" replace />;
  }

  // If ID provided but not found in data
  if (data === null) {
    if (eventServicesDetailData[eventId]) {
      // Waiting for state update
      return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;
    }
    return <Navigate to="/event-services/corporate-events" replace />;
  }

  if (!data) {
    return <div className="min-h-screen pt-32 text-center text-slate-500">Event service not found.</div>;
  }

  const seoData = getEventServiceSEO(eventId);
  const schemas = buildEventServiceSchema(data, seoData, location.pathname);

  return (
    <PageContainer as="main" className="min-h-screen font-sans">
      <SEO
        title={seoData.metaTitle}
        description={seoData.metaDescription}
        keywords={seoData.keywords.join(', ')}
        image={data.hero && data.hero.image ? `https://www.primetimemedia.in${data.hero.image}` : undefined}
        schema={schemas}
      />

      {/* Section 1: Hero */}
      <EventHero data={data.hero} />

      {/* Section 2: Key Benefits / Services */}
      <EventBenefits data={data.benefits} />

      {/* Section 3: Why Choose Us & Why It Matters */}
      {(data.whyItMatters || data.whyChooseUs || data.extraSections) && (
        <EventWhyUs
          whyItMatters={data.whyItMatters}
          whyChooseUs={data.whyChooseUs}
          extraSections={data.extraSections}
        />
      )}


      {/* Section 4: Related Event Services Slider */}
      <RelatedEventServices currentServiceId={eventId} />

      <UpcomingEventsSection />
    </PageContainer>
  );
}
