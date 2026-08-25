import React from 'react';
import { Link } from 'react-router-dom';
import { StaggerContainer, StaggerItem } from '../animations/StaggerFadeIn';

const ServicesGrid = () => {
  const services = [
    {
      title: "Market Research",
      slug: "market-research",
      description: "Market research is \"the function that links the consumers, customers, and public to the marketer through information — information used to identify...",
      image: '/services/marketResearch/Survey-Analysis.jpeg'
    },
    {
      title: "Ratings & Accreditations",
      slug: "ratings-accreditations",
      description: "Prime time provides you best services for Ratings & Accreditations. Prime Time is devoted to quality advancement in the healthcare, education...",
      image: '/services/ratingsAccredetion/Quality-Assessment.webp'
    },
    {
      title: "Digital Marketing",
      slug: "digital-marketing",
      description: "In the digital age, a strong online presence is crucial. We offer comprehensive digital marketing strategies designed to increase visibility and engagement.",
      image: '/services/digitalMarketing/digital-marketing.webp'
    },
    {
      title: "Brand & Reputation Management",
      slug: "brand-reputation-management",
      description: "Protect and enhance your brand's image. We help you build trust and credibility through strategic PR and reputation management services.",
      image: '/services/brandReputation/hero.jpg'
    },
    {
      title: "Business Consultancy Services",
      slug: "business-consultancy",
      description: "Prime Time provides best Business Consultancy Services in India. Prime Time, along with its subsidiaries is a leading provider of advisory...",
      image: '/services/BuisnessConsultancy/business.jpg'
    },
    {
      title: "Public Relation Management",
      slug: "public-relation-management",
      description: "Public Relation Management today’s contemporary market scenario there is cut-throat competition and therefore it is essential to have an edge over your competitors...",
      image: '/services/publicRelations/pr_hero_1784181613020.webp'
    },
    {
      title: "Social Media Management",
      slug: "social-media-management",
      description: "Prime Time Media helps brands with different aspects of their social media management strategy by deploying result-driven services around social...",
      image: '/services/socialMediaManagement/smm-hero.jpg'
    },
    {
      title: "Web Development",
      slug: "web-development",
      description: "Prime Time Media provide expert web application development and web design services to our clients. Appnovation offers a variety of website design",
      image: '/services/webDevelopment/web-hero.jpg'
    },
  ];

  return (
    <section className="py-12 md:py-20 bg-white">
      <div>

        {/* Header */}
        <div className="text-center mb-16">
          <h4 className="text-sky-700 font-bold uppercase tracking-widest text-sm mb-4">WHAT WE OFFER</h4>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-black mb-6">Provide Best Services</h2>
          <p className="text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Prime Time Media is committed to delivering excellence across a variety of professional services tailored to your organizational needs.
          </p>
        </div>

        {/* Grid Section */}
        <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <StaggerItem key={index} className="group bg-white-800 rounded-2xl overflow-hidden shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 flex flex-col h-full border border-gray-100 p-4 md:p-5">
              <Link to={`/services/${service.slug}`} className="flex flex-col h-full">

                {/* Image Container with Fallback Background */}
                <div className="w-full relative overflow-hidden rounded-md bg-gray-100 aspect-[4/3] flex flex-col items-center justify-center text-gray-400 p-4 text-center">
                  {service.image ? (
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 absolute inset-0"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2 relative z-10"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                      <span className="text-xs font-medium relative z-10">Image coming soon</span>
                    </>
                  )}
                </div>

                {/* Content Container */}
                <div className="pt-5 pb-2 flex flex-col flex-grow bg-white">
                  <h3 className="text-xl font-bold text-sky-700 mb-3 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed flex-grow text-sm">
                    {service.description}
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

export default ServicesGrid;
