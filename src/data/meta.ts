/**
 * Per-page <head> (title, description, canonical, Open Graph, robots) and the JSON-LD graph, generated from
 * content.ts at build time by scripts/prerender.mjs. Adding a phone number to `company.phones` updates the JSON-LD.
 */
import { company, countries, hero, team } from './content';
import type { PageId } from '@/lib/page';

export const SITE = 'https://www.passionateglobal.co.in';

type Head = { title: string; description: string; path: string; robots?: string };

export const pages: Record<PageId, Head> = {
  home: {
    title: 'Passionate Global | Offshore Teams for Recruitment Businesses',
    // ≤ 155 characters, from the hero copy
    description: `${hero.kicker} ${company.name} builds ${hero.badge.charAt(0).toLowerCase()}${hero.badge.slice(1)}.`,
    path: '/',
  },
  privacy: {
    title: 'Privacy Policy | Passionate Global',
    description: 'How Passionate Global (formerly Passionate Staffing Solutions) collects, uses and protects personal data, and your rights under UK GDPR and India’s DPDP Act.',
    path: '/privacy-policy',
  },
  cookies: {
    title: 'Cookie Policy | Passionate Global',
    description: 'Passionate Global’s website uses no advertising or tracking cookies. Read what is stored on your device and why.',
    path: '/cookie-policy',
  },
  notfound: {
    title: 'Page not found | Passionate Global',
    description: 'The page you were looking for could not be found.',
    path: '/404',
    robots: 'noindex, follow',
  },
};

const attr = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** JSON-LD: Organization + ProfessionalService + WebSite (home page). */
export function jsonLd() {
  const org = `${SITE}/#organization`;
  const phones = company.phones.map((p) => p.value);
  const address = {
    '@type': 'PostalAddress',
    streetAddress: company.postal.street,
    addressLocality: company.postal.locality,
    addressRegion: company.postal.region,
    postalCode: company.postal.postcode,
    addressCountry: company.postal.country,
  };
  const areaServed = countries.items.map((c) => c.code); // GB, IE, EU, CA, US, AU
  const sameAs = Object.values(company.socials).filter(Boolean);
  const logo = { '@type': 'ImageObject', url: `${SITE}/icon-512.png`, width: 512, height: 512 };
  const graph = [
    {
      '@type': 'Organization',
      '@id': org,
      name: company.name,
      alternateName: company.formerName,
      url: `${SITE}/`,
      logo,
      image: `${SITE}/og-image.png`,
      description: hero.badge + '.',
      email: company.email,
      telephone: phones[0],
      foundingDate: company.founded,
      founder: { '@type': 'Person', name: team.founder.name, jobTitle: team.founder.role },
      address,
      areaServed,
      sameAs,
      contactPoint: company.phones.map((p) => ({
        '@type': 'ContactPoint',
        telephone: p.value,
        email: company.email,
        contactType: 'sales',
        areaServed: p.label === 'IN' ? ['IN', ...areaServed] : p.label,
        availableLanguage: ['en'],
      })),
    },
    {
      '@type': 'ProfessionalService',
      '@id': `${SITE}/#business`,
      name: company.name,
      alternateName: company.formerName,
      url: `${SITE}/`,
      logo,
      image: `${SITE}/og-image.png`,
      description: `${hero.badge}: recruitment support, finance and accounting, out-of-hours and business support services.`,
      email: company.email,
      telephone: phones[0],
      address,
      areaServed,
      parentOrganization: { '@id': org },
      founder: { '@type': 'Person', name: team.founder.name },
      foundingDate: company.founded,
      sameAs,
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE}/#website`,
      url: `${SITE}/`,
      name: company.name,
      alternateName: company.formerName,
      inLanguage: 'en-GB',
      publisher: { '@id': org },
    },
  ];
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
}

/** The page-specific <head> tags, injected at <!--app-head--> in index.html. */
export function headFor(page: PageId): string {
  const h = pages[page];
  const url = SITE + (h.path === '/' ? '/' : h.path);
  const tags = [
    `<title>${attr(h.title)}</title>`,
    `<meta name="description" content="${attr(h.description)}" />`,
    h.robots ? `<meta name="robots" content="${h.robots}" />` : `<link rel="canonical" href="${url}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:title" content="${attr(h.title)}" />`,
    `<meta property="og:description" content="${attr(h.description)}" />`,
    `<meta name="twitter:title" content="${attr(h.title)}" />`,
    `<meta name="twitter:description" content="${attr(h.description)}" />`,
  ];
  if (page === 'home') tags.push(`<script type="application/ld+json">${jsonLd()}</script>`);
  return tags.join('\n    ');
}
