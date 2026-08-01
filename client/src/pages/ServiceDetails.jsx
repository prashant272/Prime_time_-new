import React, { useEffect, useState } from 'react';
import { useLocation, useParams, Navigate } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import { servicesData } from '../data/servicesData';
import { getServiceSEO, buildServiceSchema } from '../data/serviceseodata';
import ServiceHero from '../components/services/ServiceHero';
import ServiceBenefits from '../components/services/ServiceBenefits';
import ServiceWhyUs from '../components/services/ServiceWhyUs';
import ServiceMiddleImage from '../components/services/ServiceMiddleImage';
import ServiceSectors from '../components/services/ServiceSectors';
import RelatedServices from '../components/services/RelatedServices';
import UpcomingEventsSection from '../components/home/UpcomingEventsSection';
import SEO from '../components/common/SEO';

export default function ServiceDetails() {
  const { serviceId } = useParams();
  const location = useLocation();
  const [data, setData] = useState(null);

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);

    // Load data
    if (serviceId && servicesData[serviceId]) {
      setData(servicesData[serviceId]);
    } else {
      setData(null);
    }
  }, [serviceId]);

  if (!serviceId) {
    // If no ID provided, default to the first service
    return <Navigate to="/services/market-research" replace />;
  }

  // If ID provided but not found in data
  if (data === null) {
    if (servicesData[serviceId]) {
      // Waiting for state update
      return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;
    }
    return <Navigate to="/services/market-research" replace />;
  }

  if (!data) {
    return <div className="min-h-screen pt-32 text-center text-slate-500">Service not found.</div>;
  }

  const seoData = getServiceSEO(serviceId);
  const schemas = buildServiceSchema(data, seoData, location.pathname);

  return (
    <PageContainer as="main" className="min-h-screen  font-sans">
      <SEO
        title={seoData.metaTitle}
        description={seoData.metaDescription}
        keywords={seoData.keywords.join(', ')}
        image={data.hero && data.hero.image ? `https://www.primetimemedia.in${data.hero.image}` : undefined}
        schema={schemas}
      />
      {/* Section 1: Hero */}
      <ServiceHero data={data.hero} />

      {/* Section 2: Key Benefits */}
      <ServiceBenefits data={data.benefits} />

      {/* Section 2.5: Why Us and Extra Info */}
      {(data.whyItMatters || data.whyChooseUs || data.extraSections) && (
        <ServiceWhyUs
          whyItMatters={data.whyItMatters}
          whyChooseUs={data.whyChooseUs}
          extraSections={data.extraSections}
        />
      )}

      {/* Section 3: Middle Large Image */}
      {data.middleImage && (
        <ServiceMiddleImage imageSrc={data.middleImage} />
      )}

      {/* Section 4: Our Sectors */}
      {data.sectors && (
        <ServiceSectors data={data.sectors} />
      )}

      {/* Section 5: Related Services Slider */}
      <RelatedServices relatedIds={data.relatedServices} />

      <UpcomingEventsSection />
    </PageContainer>
  );
}
