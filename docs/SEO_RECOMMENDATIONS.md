# SEO recommendations (future work: needs client-approved content)

The launch site is one long page plus Privacy and Cookie policies. It can rank for the brand ("Passionate Global",
and "Passionate Staffing Solutions" via `alternateName` + the old-domain redirects) but one page can only compete for
a handful of generic phrases. These are **recommendations only**: every page below needs real, client-approved copy
(no invented case studies, client names or numbers).

## 1. One page per service (highest value)

| URL | Primary search phrases (UK) | Content needed from the client |
|---|---|---|
| `/services/recruitment-support` | offshore recruitment support, recruitment process outsourcing for agencies, offshore recruitment resourcer | roles offered (360 consultants, sourcing, booking, compliance, referencing, CV formatting), how a team is set up, a typical week |
| `/services/recruitment-compliance` | recruitment compliance outsourcing, candidate compliance checks UK, healthcare compliance outsourcing | the compliance checks handled (right to work, DBS, references, training records), CQC / NHS framework familiarity if true |
| `/services/finance-accounting` | offshore bookkeeping for recruitment agencies, outsourced payroll for recruitment, timesheet processing outsourcing | the finance tasks, the software used (e.g. Xero, Sage, QuickBooks) if true |
| `/services/out-of-hours` | out of hours recruitment support, 24/7 booking desk outsourcing, overnight shift booking healthcare | the actual hours covered, response times, escalation process |
| `/services/business-support` | virtual assistant for recruitment agency, offshore admin support, CRM data entry outsourcing | tasks, CRMs supported (e.g. Bullhorn, Vincere, Mercury) if true |

## 2. One page per industry

`/industries/healthcare-recruitment`, `/industries/social-care-recruitment`, `/industries/education-recruitment`,
`/industries/technology-recruitment`, … Phrases: "offshore support for healthcare recruitment agencies",
"social care recruitment outsourcing", "education recruitment back office". Each needs 300+ words of specific
detail (shift patterns, compliance requirements of that sector, roles supported).

## 3. Market pages (only if the client actively sells there)

`/uk`, `/ireland`, `/australia`, `/canada`, `/usa`: "offshore recruitment team UK", "recruitment outsourcing
Australia". Time-zone coverage and local compliance knowledge are the differentiators. Add `hreflang` only if the
content genuinely differs per market.

## 4. Supporting content

- **Careers page** (`/careers`): the old site had one and it attracts local Ahmedabad searches ("recruitment jobs
  Ahmedabad", "UK process jobs Ahmedabad"). Use `JobPosting` structured data for real openings only.
- **Insights / guides** (2 per month is enough): "How to set up an offshore recruitment team", "Offshore vs
  in-house resourcer: costs and trade-offs", "What a UK healthcare agency compliance check involves". Written or
  reviewed by the team, with a named author.
- **Case studies**: only with the client's written permission; anonymised is fine ("UK healthcare recruitment
  agency, 6-person team").
- **Testimonials**: when real, consider `Review` markup only for third-party reviews (Google does not show
  self-serving review stars for an organisation's own site).

## 5. Off-site

- Google Business Profile (Ahmedabad office), identical name / address / phone everywhere (see LAUNCH_TODO).
- LinkedIn company page: website link → https://www.passionateglobal.co.in, regular posts linking to new pages.
- Listings: Clutch, GoodFirms, UK recruitment supplier directories (e.g. APSCo / REC supplier listings if eligible).
- Ask existing clients for a link or a Google review.

## 6. Technical follow-ups

- When service pages exist: add them to `sitemap.xml` (scripts/prerender.mjs), to `PAGE_PATHS`, and link them from
  the Services cards and the footer.
- Add `BreadcrumbList` and `Service` JSON-LD on those pages.
- Track rankings and queries in Google Search Console (Performance report) monthly.
