import React from 'react';
import { motion } from 'framer-motion';
import PageContainer from '../components/layout/PageContainer';
import ServicesMarquee from '../components/home/ServicesMarquee';
import HeroSection from '../components/home/HeroSection';
import HomeFaqSection from '../components/home/HomeFaqSection';
import ServicesGrid from '../components/home/ServicesGrid';
import AdvertisingServicesGrid from '../components/home/AdvertisingServicesGrid';
import AdvertisingServicesMarquee from '../components/home/AdvertisingServicesMarquee';
import ResearchMethodology from '../components/home/ResearchMethodology';
import SelectionProcess from '../components/home/SelectionProcess';
import TestimonialSection from '../components/home/TestimonialSection';
import StatsSection from '../components/home/StatsSection';
import LatestNewsSection from '../components/home/LatestNewsSection';
import UpcomingEventsSection from '../components/home/UpcomingEventsSection';
import ClientLogosStrip from '../components/home/ClientLogosStrip';
import AboutSummary from '../components/home/AboutSummary';
import ChiefGuestsCarousel from '../components/home/ChiefGuestsCarousel';
import BrandDivider from '../components/home/BrandDivider';
import EventGallery from '../components/home/EventGallery';
import SEO from '../components/common/SEO';

const HomePage = () => {
  const sectionVariants = {
    hidden: { opacity: 0, y: 60, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 1.2,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  const SectionWrapper = ({ children }) => (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={sectionVariants}
      className="w-full"
    >
      {children}
    </motion.div>
  );

  return (
    <main>
      <h1 className="sr-only">Prime Time Research Media - Top PR, Awards & Market Research Agency in India</h1>
      <SEO
        title="Prime Time Research Media | Top PR, Awards & Market Research India"
        description="Prime Time Research Media provides top PR, market research, and business consultancy in India, hosting prestigious national & international award summits."
      />
      <HeroSection />
      <PageContainer className="flex flex-col w-full overflow-hidden">
        <SectionWrapper><BrandDivider /></SectionWrapper>
        <SectionWrapper><ClientLogosStrip /></SectionWrapper>
        <SectionWrapper><AboutSummary /></SectionWrapper>
        <SectionWrapper><ChiefGuestsCarousel /></SectionWrapper>
        <SectionWrapper><AdvertisingServicesGrid /></SectionWrapper>
        <SectionWrapper><AdvertisingServicesMarquee /></SectionWrapper>
        <SectionWrapper><ServicesGrid /></SectionWrapper>
        <SectionWrapper><ServicesMarquee /></SectionWrapper>
        <SectionWrapper><ResearchMethodology /></SectionWrapper>
        <SectionWrapper><SelectionProcess /></SectionWrapper>
        <SectionWrapper><EventGallery /></SectionWrapper>
        <SectionWrapper><TestimonialSection /></SectionWrapper>
        <SectionWrapper><HomeFaqSection /></SectionWrapper>
        <SectionWrapper><StatsSection /></SectionWrapper>
        <SectionWrapper><LatestNewsSection /></SectionWrapper>
        <SectionWrapper><UpcomingEventsSection /></SectionWrapper>

      </PageContainer>
    </main>
  );
};

export default HomePage;
