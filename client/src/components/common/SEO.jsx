import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import config from '../../config/env';

const SITE_URL = config?.siteUrl || 'https://www.primetimemedia.in';
const SITE_NAME = 'Prime Time Research Media';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`;
const TWITTER_HANDLE = '@Prime_Time_Medi';

/**
 * Central SEO/meta component. Renders standard meta tags, Open Graph,
 * Twitter Card tags, and any number of JSON-LD structured data blocks.
 *
 * `schema` accepts either a single schema object or an array of them
 * (e.g. [ServiceSchema, BreadcrumbSchema]) — pages that need more than
 * one structured data type don't need a second SEO component instance.
 */
export default function SEO({
  title,
  description,
  name = SITE_NAME,
  type = 'website',
  image = DEFAULT_IMAGE,
  keywords,
  schema,
  noindex = false,
}) {
  const location = useLocation();
  const fullTitle = title === name ? title : `${title} | ${name}`;

  // Strip trailing slash (except root) so "/foo" and "/foo/" don't produce
  // two different canonical URLs for the same page.
  const path = location.pathname.replace(/\/+$/, '');
  const currentUrl = `${SITE_URL}${path || ''}`;

  const schemaList = Array.isArray(schema) ? schema : schema ? [schema] : [];
  const keywordContent = Array.isArray(keywords) ? keywords.join(', ') : keywords;

  return (
    <Helmet>
      <html lang="en-IN" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywordContent && <meta name="keywords" content={keywordContent} />}
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />
      <link rel="canonical" href={currentUrl} />

      {/* Open Graph — Facebook, LinkedIn, WhatsApp previews, etc. */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content={name} />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter / X */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={TWITTER_HANDLE} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:url" content={currentUrl} />

      {/* Structured data — one <script> per schema object */}
      {schemaList.map((schemaItem, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schemaItem)}
        </script>
      ))}
    </Helmet>
  );
}