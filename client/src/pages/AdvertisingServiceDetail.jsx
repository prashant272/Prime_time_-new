import React, { useEffect, useState } from 'react';
import { useParams, Navigate, useLocation } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import { advertisingServicesData } from '../data/advertisingServicesData';
import { getServiceSEO, buildAdvertisingServiceSchema } from '../data/Advertisingserviceseodata';
import UpcomingEventsSection from '../components/home/UpcomingEventsSection';
import RelatedAdvertisingServices from '../components/services/RelatedAdvertisingServices';
import AdvertisingServiceHero from '../components/services/AdvertisingServiceHero';
import AdvertisingServiceBenefits from '../components/services/AdvertisingServiceBenefits';
import SEO from '../components/common/SEO';
import CitiesWeServe from '../components/services/CitiesWeServe';

const FALLBACK_SERVICE_ID = 'auto-rickshaw-branding';

export default function AdvertisingServiceDetail() {
  const { serviceId } = useParams();
  const location = useLocation();
  const [data, setData] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const service = advertisingServicesData.find((s) => s.id === serviceId);
    setData(service || null);
  }, [serviceId]);

  if (!serviceId) {
    return <Navigate to={`/advertising-services/${FALLBACK_SERVICE_ID}`} replace />;
  }

  if (data === null) {
    const exists = advertisingServicesData.some((s) => s.id === serviceId);
    if (exists) {
      // Data hasn't been set into state yet on this render pass.
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50">Loading...</div>
      );
    }
    return <Navigate to={`/advertising-services/${FALLBACK_SERVICE_ID}`} replace />;
  }

  const seoEntry = getServiceSEO(serviceId);
  const schema = buildAdvertisingServiceSchema(data, seoEntry, location.pathname);

  return (
    <PageContainer as="main" className="min-h-screen font-sans">
      <SEO
        title={seoEntry.metaTitle}
        description={seoEntry.metaDescription}
        keywords={seoEntry.keywords}
        image={`https://www.primetimemedia.in${data.image}`}
        schema={schema}
      />

      <AdvertisingServiceHero data={data} />
      <AdvertisingServiceBenefits data={data} />
      <CitiesWeServe />

      <RelatedAdvertisingServices currentServiceId={serviceId} />

      <UpcomingEventsSection />
    </PageContainer>
  );
}