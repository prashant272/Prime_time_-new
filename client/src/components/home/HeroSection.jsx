import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, ExternalLink } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Grid, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/grid';
import 'swiper/css/pagination';

// ---------------------------------------------------------------------------
// Data (move to /src/data or fetch from API once backend is wired up)
// ---------------------------------------------------------------------------

const HERO_IMAGES = [
  { src: '/home/hero/hero1.webp', alt: 'Award ceremony stage with spotlight' },
  { src: '/home/hero/hero2.jpeg', alt: 'Audience applauding at awards night' },
];

const SLIDE_INTERVAL_MS = 3000;

const UPCOMING_EVENTS = [
  {
    slug: 'https://www.primetimemedia.in/awards/global-education-awards/global-education-awards-2026-delhi-edition',
    title: 'Global Education Awards 2026',
    date: '4 December 2026',
    venue: 'New Delhi, India',
    image: './home/hero/globaleducationdelhi.jpeg',
  },
  {
    slug: 'https://www.primetimemedia.in/awards/global-education-awards/global-education-awards-2026-dubai-edition',
    title: 'Global Education Awards 2026',
    date: '19 October 2026',
    venue: 'Dubai,UAE',
    image: './home/hero/globaleducatiodubai.jpeg',
  },
  {
    slug: 'https://www.primetimemedia.in/awards/global-healthcare-awards/global-healthcare-awards-2026-delhi-edition',
    title: 'Global Healthcare Awards 2026',
    date: '4 October 2026',
    venue: 'Delhi,India',
    image: './home/hero/globalhealthcaredelhi.jpeg',
  },
  {
    slug: 'https://www.primetimemedia.in/awards/global-healthcare-awards/global-healthcare-awards-2026-washington-dc-edition',
    title: 'Global Healthcare Awards 2026',
    date: '12 October 2026',
    venue: 'Washington DC,USA',
    image: './home/hero/globalhealthcarewashington.jpeg',
  }


];

// ---------------------------------------------------------------------------
// Subcomponents
// ---------------------------------------------------------------------------

/** Background image crossfade slider with pause-on-hover + manual dot controls. */
const HeroSlider = ({ images, current, onSelect, paused, onPauseChange }) => (
  <div
    className="absolute inset-0"
    onMouseEnter={() => onPauseChange(true)}
    onMouseLeave={() => onPauseChange(false)}
  >
    {images.map((image, index) => (
      <div
        key={image.src}
        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        aria-hidden={index !== current}
      >
        <img
          src={image.src}
          alt={image.alt}
          className="h-full w-full object-cover"
          loading={index === 0 ? 'eager' : 'lazy'}
          fetchPriority={index === 0 ? 'high' : 'auto'}
        />
      </div>
    ))}

    {/* Slide indicators — only shown when there's something to switch between */}
    {images.length > 1 && (
      <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {images.map((image, index) => (
          <button
            key={image.src}
            type="button"
            onClick={() => onSelect(index)}
            aria-label={`Show slide ${index + 1}`}
            aria-current={index === current}
            className={`h-1.5 rounded-full transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400 ${index === current ? 'w-6 bg-sky-400' : 'w-1.5 bg-white/50 hover:bg-white/80'
              }`}
          />
        ))}
      </div>
    )}
  </div>
);

/** Single upcoming-event card used in the right-hand rail. */
const EventCard = ({ event }) => {
  let linkPath = `/events/${event.slug}`;
  if (event.slug.startsWith('http')) {
    try {
      linkPath = new URL(event.slug).pathname;
    } catch (e) {
      linkPath = event.slug;
    }
  } else if (event.slug.startsWith('/')) {
    linkPath = event.slug;
  }

  return (
    <Link
      to={linkPath}
      className="group flex items-center gap-3 rounded-xl border border-white/10 bg-black/60 p-3 shadow-lg backdrop-blur-md transition-colors hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400 sm:gap-4 h-full"
    >
      <div className="w-1/2 shrink-0 overflow-hidden rounded-lg flex items-center justify-center">
        <img
          src={event.image}
          alt={event.title}
          loading="lazy"
          className="w-full h-auto object-contain opacity-90 transition-transform duration-500 group-hover:scale-110 group-hover:opacity-100"
        />
      </div>
      <div className="flex min-w-0 w-1/2 flex-col justify-center gap-1.5">
        <h4 className="line-clamp-2 text-sm font-bold leading-snug text-white drop-shadow-md transition-colors group-hover:text-sky-400 md:text-base">
          {event.title}
        </h4>
        <div className="flex flex-col gap-1 text-xs font-medium text-white/70 md:text-sm">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="shrink-0 text-sky-400" />
            <span className="truncate">{event.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={14} className="shrink-0 text-sky-400" />
            <span className="truncate">{event.venue}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

/** Tabbed video panel: an in-page "Event Highlights" embed + external "Live Events" link. */
const VideoPanel = ({ activeTab, onTabChange }) => (
  <div className="flex w-full shrink-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-black shadow-2xl lg:w-[34%] xl:w-[30%]">
    <div
      role="tablist"
      aria-label="Video content"
      className="flex border-b border-white/10 bg-slate-900"
    >
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === 'featured'}
        onClick={() => onTabChange('featured')}
        className={`flex flex-1 items-center justify-center gap-2 border-t-2 px-4 py-3 text-xs font-bold transition-colors sm:flex-none md:px-6 md:text-sm ${activeTab === 'featured'
          ? 'border-red-500 bg-red-600 text-white'
          : 'border-transparent bg-black/20 text-white/60 hover:bg-white/5 hover:text-white'
          }`}
      >
        {activeTab === 'featured' && (
          <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
        )}
        Event Highlights
      </button>
      <a
        href="https://www.youtube.com/@primetimermedia"
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-1 items-center justify-center gap-1.5 border-t-2 border-transparent bg-black/20 px-4 py-3 text-xs font-bold text-white/60 transition-colors hover:bg-white/5 hover:text-white sm:flex-none md:px-6 md:text-sm"
      >
        Live Events
        <ExternalLink size={12} className="shrink-0" />
      </a>
    </div>

    <div className="relative aspect-video w-full bg-black">
      <iframe
        className="absolute inset-0 h-full w-full"
        src="https://www.youtube.com/embed/xJ05rWqlS8w?autoplay=1&mute=1&loop=1&playlist=xJ05rWqlS8w&controls=1&rel=0&modestbranding=1&playsinline=1&start=5"
        title="Featured event highlights"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        loading="lazy"
      />
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState('featured');
  const [sliderPaused, setSliderPaused] = useState(false);
  const prefersReducedMotion = useRef(
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    if (sliderPaused || prefersReducedMotion.current || HERO_IMAGES.length < 2) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_IMAGES.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [sliderPaused]);

  const handleSelectSlide = useCallback((index) => setCurrentSlide(index), []);

  return (
    <section className="relative flex min-h-[100dvh] w-full flex-col justify-end overflow-hidden bg-black pb-6 sm:pb-8 md:pb-0">
      <HeroSlider
        images={HERO_IMAGES}
        current={currentSlide}
        onSelect={handleSelectSlide}
        paused={sliderPaused}
        onPauseChange={setSliderPaused}
      />

      {/* Scrim for text legibility over the photo */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[65%] bg-gradient-to-t from-black/90 via-black/60 to-transparent" />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-7xl flex-col px-4 pb-6 sm:px-6 md:pb-10 lg:px-8 2xl:max-w-[1600px]">
        {/* Headline */}
        <div className="flex flex-1 flex-col items-center justify-center pt-24 text-center sm:pt-28 lg:pt-0">
          <h1 className="text-3xl font-black leading-tight drop-shadow-[0_8px_8px_rgba(0,0,0,0.9)] sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
            <span className="text-white">Celebrating Excellence &</span>{' '}
            <br className="hidden lg:block" />
            <span className="text-sky-400">Global Achievements!</span>
          </h1>
        </div>

        {/* Video + upcoming events */}
        <div className="flex w-full flex-col gap-6 md:gap-8 lg:flex-row lg:items-end lg:gap-10">
          <VideoPanel activeTab={activeTab} onTabChange={setActiveTab} />

          <div className="flex w-full min-w-0 flex-1 flex-col gap-3 sm:gap-4">
            <h3 className="flex items-center gap-2 text-lg font-bold text-white sm:text-xl">
              <span className="inline-block h-5 w-1 bg-sky-500" />
              Upcoming Events
            </h3>

            <div className="w-full">
              {UPCOMING_EVENTS.length > 0 && (
                <Swiper
                  slidesPerView={1}
                  spaceBetween={12}
                  grid={{ rows: 2, fill: 'row' }}
                  watchOverflow={true}
                  pagination={{ clickable: true, dynamicBullets: true }}
                  autoplay={{ delay: 3000, disableOnInteraction: false }}
                  breakpoints={{
                    640: { slidesPerView: 2, grid: { rows: 1, fill: 'row' }, spaceBetween: 16 },
                    1024: { slidesPerView: 2, grid: { rows: 2, fill: 'row' }, spaceBetween: 16 },
                  }}
                  modules={[Grid, Pagination, Autoplay]}
                  className="hero-events-swiper w-full min-h-[320px] sm:min-h-[160px] lg:h-[280px] pb-10"
                >
                  {UPCOMING_EVENTS.map((event) => (
                    <SwiperSlide key={event.slug} className="h-full">
                      <EventCard event={event} />
                    </SwiperSlide>
                  ))}
                </Swiper>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;