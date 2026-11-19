// DRAFT: needs client/legal review (see LAUNCH_TODO.md, "Legal pages").
// Privacy Policy and Cookie Policy copy. Written for UK GDPR / Data Protection Act 2018, PECR and India's
// Digital Personal Data Protection Act 2023 (DPDP). Plain British English. Facts come from content.ts and the
// site's actual set-up (Vercel hosting + Web Analytics, Resend email, Cloudflare Turnstile, Hostinger email).
import { company } from './content';

export const LEGAL_UPDATED = '19 November 2026';

/** One block of a legal page: a heading, paragraphs and optional bullet points. Text may contain the
 *  tokens {email} and {privacy}/{cookies}, which the page turns into links. */
export type LegalSection = { title: string; body: string[]; list?: string[]; after?: string[] };
export type LegalDoc = { eyebrow: string; title: string; intro: string; sections: LegalSection[] };

const who = `${company.name} (formerly known as ${company.formerName}), ${company.address}`;

export const privacy: LegalDoc = {
  eyebrow: 'Legal',
  title: 'Privacy Policy',
  intro: 'This policy explains what personal data we collect through this website, why we collect it, who we share it with and the rights you have. We keep it short because we collect very little.',
  sections: [
    {
      title: '1. Who we are',
      body: [
        `This website is run by ${who}. We are the controller (under UK GDPR) and the Data Fiduciary (under India’s DPDP Act) for the personal data described here.`,
        'Questions about this policy or your data: email {email}. Our grievance contact is Hitesh Vaishnav, Founder & CEO.',
      ],
    },
    {
      title: '2. What we collect',
      body: ['When you send an enquiry through the contact form we receive:'],
      list: [
        'your name, company and work email address (required);',
        'your phone number (optional);',
        'the services you are interested in, where you are based, the team size you have in mind and your message.',
      ],
      after: [
        'When you browse the site, our hosting provider processes technical data that every website receives (IP address, browser type, the page requested and the time) to deliver the page and keep the service secure. Our analytics are cookieless and aggregated: they count visits without identifying you (see the {cookies}).',
        'To stop spam, the form uses Cloudflare Turnstile, which checks signals from your browser and device to tell people from bots. A hidden field and a limit on the number of enquiries per hour also filter automated submissions.',
      ],
    },
    {
      title: '3. Why we use it and our lawful basis',
      body: [],
      list: [
        'To reply to your enquiry and discuss our services with you, and to send you a confirmation that we received it. UK GDPR: taking steps at your request before entering into a contract, and our legitimate interest in responding to business enquiries. DPDP Act: the consent you give by submitting the form, for this purpose only.',
        'To keep the website and form secure and free of spam. UK GDPR: our legitimate interest in protecting our systems. DPDP Act: a legitimate use for security purposes.',
      ],
      after: ['We do not use your data for automated decision-making, we do not sell it, and we will not add you to a mailing list without asking.'],
    },
    {
      title: '4. Who we share it with',
      body: ['We use a small number of service providers (processors) who handle data only on our instructions:'],
      list: [
        'Vercel Inc. (USA): website hosting, the contact-form function and cookieless analytics.',
        'Resend (USA): delivery of the enquiry email to our team and of your confirmation email.',
        'Cloudflare, Inc. (global network): Turnstile spam protection on the form.',
        'Hostinger: our company email, where your enquiry is received and answered.',
      ],
      after: ['Your enquiry is read by our team in Ahmedabad, India. We may also disclose data where the law requires it.'],
    },
    {
      title: '5. International transfers',
      body: [
        'Our team works from India and some of our providers are based in the USA or operate worldwide, so your data may be processed outside the UK and the European Economic Area. Where this happens we rely on appropriate safeguards, such as the UK International Data Transfer Agreement or Addendum, the European Commission’s Standard Contractual Clauses, or a provider’s certification under the UK Extension to the EU–US Data Privacy Framework.',
      ],
    },
    {
      title: '6. How long we keep it',
      body: [
        'We keep enquiries for up to 24 months after our last contact with you, then delete them, unless the enquiry leads to a working relationship, in which case it becomes part of our client records. Technical logs held by our hosting provider are kept for a short period in line with its own retention settings.',
      ],
    },
    {
      title: '7. Your rights',
      body: ['Under UK GDPR you can ask us to:'],
      list: [
        'give you a copy of your data (access) or transfer it (portability);',
        'correct it, or delete it;',
        'restrict how we use it, or object to our use of it;',
        'withdraw consent at any time, where we rely on consent.',
      ],
      after: [
        'Under India’s DPDP Act you have the right to information about the data we process, to correction and erasure, to grievance redressal and to nominate another person to exercise your rights.',
        'To use any of these rights, email {email}. We will reply within one month. If you are unhappy with our response you can complain to the UK Information Commissioner’s Office (ico.org.uk) or, under the DPDP Act, to the Data Protection Board of India after using our grievance process.',
      ],
    },
    {
      title: '8. Security',
      body: ['The site is served only over HTTPS with modern security headers. Form submissions are validated and sent directly to our team by email; we do not keep a separate database of enquiries on the website. Access to our email systems is restricted to the people who need it.'],
    },
    {
      title: '9. Children',
      body: ['This website is for businesses and is not aimed at children. We do not knowingly collect data from anyone under 18.'],
    },
    {
      title: '10. Changes to this policy',
      body: ['If we change this policy we will update this page and the date below.'],
    },
  ],
};

export const cookies: LegalDoc = {
  eyebrow: 'Legal',
  title: 'Cookie Policy',
  intro: 'Cookies are small files a website stores on your device. This page explains what this website stores and why. The short version: no advertising or tracking cookies, and no cookie banner, because there is nothing to consent to.',
  sections: [
    {
      title: '1. Analytics without cookies',
      body: [
        'We use Vercel Web Analytics to count page visits. It does not use cookies or similar storage and does not identify you: visits are counted using a short-lived value derived from the request, which is discarded within 24 hours, and the results we see are aggregated.',
      ],
    },
    {
      title: '2. Strictly necessary technology',
      body: [
        'The contact form uses Cloudflare Turnstile to protect us from spam. It may process information about your browser and device solely to tell people from bots, and is not used for advertising. Because it is strictly necessary to provide the form securely, it does not require consent under the Privacy and Electronic Communications Regulations (PECR).',
      ],
    },
    {
      title: '3. Links to other websites',
      body: [
        'Our LinkedIn and Instagram links take you to those platforms, which set their own cookies under their own policies once you are there. We do not embed their trackers on this site.',
      ],
    },
    {
      title: '4. Managing cookies',
      body: [
        'You can block or delete cookies in your browser settings at any time. The site will continue to work.',
        'If we ever add tools that use cookies for analytics or marketing, we will ask for your consent first and update this page. See our {privacy} for how we handle personal data, or email {email} with any questions.',
      ],
    },
  ],
};
