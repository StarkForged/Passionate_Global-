/**
 * ALL WEBSITE COPY LIVES HERE.
 * Source of truth: docs/website-content.md (client's Website_Content.docx).
 * Edit text here, not inside components. Never invent stats, clients or testimonials.
 */

export const company = {
  name: 'Passionate Global',
  tagline: 'Your Trusted Global Partner',
  // NOTE: contact details taken from the old site (passionatestaffing.com) — confirm with client.
  address: 'B-207, Dev Aurum Commercial Complex, Near Deer Circle, Prahladnagar, Ahmedabad, Gujarat 380015, India',
  phones: [
    { label: 'UK', value: '+44 203 286 1122', href: 'tel:+442032861122' },
    { label: 'IN', value: '+91 79 4600 4690', href: 'tel:+917946004690' },
  ],
  email: 'info@passionatestaffing.com',
  website: { label: 'www.passionatestaffing.com', href: 'https://www.passionatestaffing.com/' },
  socials: {
    linkedin: 'https://www.linkedin.com/company/passionate-staffing-solutions-private-limited',
    instagram: 'https://www.instagram.com/passionate_staffing_family/',
    facebook: 'https://www.facebook.com/PassionateStaffingSolutions',
  },
};

export const nav = [
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Process', href: '#process' },
  { label: 'Industries', href: '#industries' },
  { label: 'Team', href: '#team' },
  { label: 'Life at PG', href: '#life' },
];

export const hero = {
  badge: 'Dedicated offshore teams for recruitment businesses',
  kicker: 'Your Business Deserves More Than an Outsourcing Provider.',
  title: ['It Deserves a', 'Growth Partner.'],
  body: 'At Passionate Global, we help organisations build dedicated offshore teams that seamlessly integrate with their operations. Through tailored outsourcing solutions, exceptional talent and a commitment to long-term partnerships, we empower businesses to streamline operations, improve efficiency and scale with confidence.',
  primary: "Let's talk",
  secondary: 'Explore Our Services',
};

export const trust = {
  title: 'Supporting Recruitment Businesses Across Multiple Industries Worldwide',
  items: ['Recruitment Support', 'Finance & Accounting', 'Compliance', 'Out-of-Hours Services', 'Business Support Services'],
};

export const about = {
  eyebrow: 'About Us',
  title: 'Passionate Global is built differently.',
  paragraphs: [
    'At Passionate Global, we believe exceptional outsourcing begins with strategic alignment. By understanding your goals, processes and ways of working, we build dedicated teams that integrate seamlessly into your organisation and deliver meaningful results from day one.',
    "We don't measure success by the number of tasks completed. We measure it by the relationships we build, the trust we earn and the value we deliver over time.",
  ],
  punch: ['Because when your business grows,', 'so does ours.'],
  // Derived from the copy: founder's 14+ yrs, 6 markets, 8 sectors
  stats: [
    { value: 14, suffix: '+', label: 'Years of leadership experience' },
    { value: 6, suffix: '', label: 'International markets supported' },
    { value: 8, suffix: '', label: 'Recruitment sectors served' },
  ],
};

export const mission = 'To empower businesses with exceptional offshore talent that drives operational excellence, sustainable growth and long-term success.';
export const vision = 'To become a globally trusted outsourcing partner recognised for quality, innovation and lasting business relationships.';
export const values = ['Partnership', 'Integrity', 'Accountability', 'Excellence', 'Innovation', 'Continuous Improvement'];

export const why = {
  eyebrow: 'Why Passionate Global',
  title: 'Why Businesses Choose Passionate Global',
  intro: "Outsourcing isn't just about reducing workload or controlling costs. It's about finding a trusted partner who understands your business, shares your commitment to quality and genuinely cares about the growth of your business.",
  closer: "That's exactly what we strive to be.",
  items: [
    { title: 'Personalised Solutions', body: 'Every client is unique. We tailor our people, processes and support to align with your business objectives, ensuring a solution that works specifically for you.' },
    { title: 'Ownership Mindset', body: 'Our teams take responsibility for their work, communicate proactively and consistently look for ways to improve efficiency and add value.' },
    { title: 'Dedicated Professionals', body: 'Your offshore team works exclusively with your business, integrating into your workflows, systems and culture to deliver a seamless experience.' },
    { title: 'Quality First', body: 'Every task is completed with precision, consistency and attention to detail, ensuring the highest standards across every aspect of our service.' },
    { title: 'Long-Term Partnerships', body: 'We believe the strongest business relationships are built over time. We focus on building trusted relationships that continue to grow alongside your business.' },
    { title: 'Scalable Support', body: 'As your business evolves, our solutions evolve with you, providing the flexibility to expand your team and capabilities whenever you need.' },
  ],
};

export const services = {
  eyebrow: 'Our Services',
  title: 'Comprehensive Solutions Designed Around Your Growth',
  intro: 'As your business grows, so do the demands on your people, processes and operations. Our outsourcing solutions provide the expertise, flexibility and reliability you need to scale efficiently while maintaining exceptional service standards.',
  items: [
    {
      id: 'recruitment',
      title: 'Recruitment Support',
      body: 'Supporting recruitment businesses with dedicated professionals who strengthen every stage of the recruitment lifecycle.',
      list: ['360 Recruitment Consultants', 'Candidate Sourcing & Screening', 'Booking Consultants', 'Compliance Support', 'Reference Chasing', 'CV Formatting'],
    },
    {
      id: 'finance',
      title: 'Finance & Accounting Support',
      body: 'Helping businesses maintain accurate financial operations through dependable back-office support.',
      list: ['Bookkeeping', 'Payroll Support', 'Bank Reconciliations', 'Timesheets Processing', 'Credit Control'],
    },
    {
      id: 'ooh',
      title: 'Out-of-Hours Support',
      lead: "Business doesn't stop at 5 pm and neither do we.",
      body: 'Our dedicated out-of-hours teams provide reliable support beyond standard working hours, helping your business maintain continuity, responsiveness and exceptional service across different time zones.',
      list: ['Out-of-Hours Recruitment Support', 'Overnight Administration', 'Booking Co-ordinators', 'Customer Service', 'Emergency Shift Support'],
    },
    {
      id: 'business',
      title: 'Business Support Services',
      body: 'Reliable administrative professionals who keep your business running smoothly behind the scenes.',
      list: ['Administrative Support', 'Data Entry', 'CRM Management', 'Email Management', 'Calendar Management', 'Virtual Assistance'],
    },
  ],
};

export const industries = {
  eyebrow: 'Industries We Cover',
  title: 'Supporting Businesses Across Diverse Industries',
  intro: 'Every industry operates differently, requiring specialised knowledge, adaptable processes and a flexible approach.',
  sub: 'Our teams proudly support organisations across various recruitment sectors:',
  items: ['Healthcare', 'Social Care', 'Education', 'Technology', 'Finance & Accounting', 'Engineering', 'Logistics', 'Professional Services'],
};

export const countries = {
  eyebrow: 'Countries We Support',
  title: 'Delivering Global Support with a Personal Approach',
  intro: 'We partner with businesses across international markets, providing dedicated outsourcing solutions that align with their operational requirements.',
  quote: "Wherever your business is based, we're ready to become an extension of your team.",
  hub: { name: 'Ahmedabad, India', label: 'Delivery Centre', lat: 23.03, lng: 72.58, tz: 'Asia/Kolkata' },
  items: [
    { name: 'United Kingdom', code: 'GB', lat: 52.6, lng: -1.6, tz: 'Europe/London', city: 'London' },
    { name: 'Ireland', code: 'IE', lat: 53.2, lng: -8.0, tz: 'Europe/Dublin', city: 'Dublin' },
    { name: 'Europe', code: 'EU', lat: 50.0, lng: 12.0, tz: 'Europe/Berlin', city: 'Berlin' },
    { name: 'Canada', code: 'CA', lat: 56.5, lng: -104, tz: 'America/Toronto', city: 'Toronto' },
    { name: 'United States', code: 'US', lat: 39.5, lng: -98.5, tz: 'America/New_York', city: 'New York' },
    { name: 'Australia', code: 'AU', lat: -25.5, lng: 134, tz: 'Australia/Sydney', city: 'Sydney' },
  ],
};

export const process = {
  eyebrow: 'Our Process',
  title: 'A Simple Process. A Lasting Partnership.',
  intro: 'Getting started with Passionate Global is straightforward. We understand your business, identify where we can add value and build a dedicated team that integrates seamlessly into your operations.',
  steps: [
    { title: 'Discovery', body: 'We begin by understanding your business, operational challenges, objectives and the support you require.' },
    { title: 'Solution Design', body: 'Based on your requirements, we create a tailored outsourcing solution, defining the roles, processes and team structure that best support your business.' },
    { title: 'Talent Selection', body: 'We carefully recruit and assign experienced professionals with the right skills, experience and cultural fit for your organisation.' },
    { title: 'Onboarding & Integration', body: 'Your dedicated team is trained on your systems, processes and expectations, ensuring a smooth transition into your business.' },
    { title: 'Ongoing Support', body: 'Our management team provides continuous oversight, regular performance reviews and proactive support to ensure consistent quality and continuous improvement.' },
    { title: 'Grow Together', body: 'As your business evolves, we help you scale your offshore team and expand support across additional functions whenever required.' },
  ],
  cta: "Let's Build Your Offshore Team",
};

export const security = {
  eyebrow: 'IT Infrastructure & Security',
  title: 'Secure Infrastructure. Reliable Operations. Complete Peace of Mind.',
  intro: "Your business relies on secure systems, uninterrupted connectivity and dependable processes. At Passionate Global, we've invested in a modern IT infrastructure that enables our teams to work efficiently while protecting your data and ensuring business continuity.",
  outro: "Whether we're managing recruitment operations, finance processes or administrative support, you can be confident that your information is handled with the highest level of professionalism and security.",
  items: [
    { title: 'Data Security', body: 'Protecting client information is at the heart of everything we do. We follow robust security practices to safeguard confidential data and maintain the integrity of your business operations.' },
    { title: 'Business Continuity', body: 'Our infrastructure is designed to minimise disruption. Backup power, redundant internet connections and disaster recovery procedures ensure our teams remain operational when you need us most.' },
    { title: 'Modern Technology', body: 'Our professionals are equipped with high-performance hardware, licensed software and secure cloud-based collaboration tools that enable seamless communication and efficient delivery.' },
    { title: 'Secure Connectivity', body: 'We utilise secure networks, controlled system access and industry-standard security measures to create a safe and dependable working environment.' },
    { title: 'Collaboration Without Boundaries', body: 'Our teams work effortlessly across international time zones using leading communication and project management platforms, allowing us to integrate smoothly with your existing workflows.' },
    { title: 'Continuous Improvement', body: 'Technology is constantly evolving, and so are we. We continually invest in our infrastructure to enhance security, improve efficiency and deliver an exceptional client experience.' },
  ],
};

export const team = {
  eyebrow: 'Meet Our Team',
  title: 'The people behind your offshore team',
  founder: {
    name: 'Hitesh Vaishnav',
    role: 'Founder & CEO',
    initials: 'HV',
    photo: '', // e.g. 'img/team/hitesh-vaishnav.jpg'
    tenure: '14+ years',
    bio: [
      'With over 14 years of experience supporting businesses across international markets, Hitesh Vaishnav founded Passionate Global with a vision to redefine outsourcing through trust, ownership, and long-term partnerships.',
      "Having helped organisations streamline operations, improve efficiency, and build high-performing teams, he believes outsourcing should feel like a seamless extension of a client's business, not just a cost-saving solution.",
      "Today, that philosophy continues to drive Passionate Global's commitment to delivering tailored solutions, dedicated teams, and lasting client success.",
    ],
    quote: "Great partnerships are never built on contracts. They're built on trust, accountability and exceeding expectations.",
  },
  members: [
    {
      name: 'Heena Vaishnav', role: 'Operations Manager', initials: 'HV', photo: '', tenure: '7+ years',
      bio: [
        'Heena Vaishnav is an experienced Operations Manager with over seven years in recruitment outsourcing. She began her career in the banking sector, where she built a strong foundation in customer service and relationship management before transitioning into recruitment.',
        'Having progressed from a top-performing recruiter to a successful team leader, Heena specialises in building, mentoring, and managing high-performing teams. Her hands-on approach, operational expertise, and commitment to developing people enable her teams to consistently deliver outstanding results and exceptional service to clients.',
      ],
    },
    {
      name: 'Dixita Rajput', role: 'Compliance Manager', initials: 'DR', photo: '', tenure: '6+ years',
      bio: [
        'Dixita Rajput has been an integral part of the organisation for over six years, progressing from a Junior Compliance Officer to Compliance Manager through her dedication, exceptional work ethic, and commitment to excellence.',
        'Known for her meticulous attention to detail, Dixita specialises in maintaining the highest compliance standards while developing efficient processes that enable her team to deliver accurate and seamless operations. Her structured approach and focus on continuous improvement ensure both operational efficiency and outstanding service quality.',
      ],
    },
    {
      // NOTE: docx mixes "her"/"he" — written as "his"; confirm with client.
      name: 'Anand Malhotra', role: 'Recruitment Manager', initials: 'AM', photo: '', tenure: 'Since 2023',
      bio: [
        'Anand started his career in the US IT sector as a recruiter. He joined us as a trainee recruiter in 2023 and has been an integral part of the team ever since.',
        'He is a self-motivated individual with a hunger for success.',
      ],
    },
  ],
};

export const life = {
  eyebrow: 'Life at Passionate Global',
  title: 'Where Great People Build Great Partnerships',
  paragraphs: [
    "At Passionate Global, we believe our people are the driving force behind our success. We've created a workplace where collaboration, learning and ownership come together to inspire both personal and professional growth.",
    'Our culture is built on respect, teamwork and a shared commitment to delivering exceptional results for our clients. We celebrate achievements, encourage innovation and foster an environment where every individual is empowered to make a meaningful impact.',
  ],
  moreTitle: 'More Than Just Work',
  more: 'Life at Passionate Global is about building connections, celebrating milestones and creating memorable experiences together. From team-building activities and employee recognition programmes to festive celebrations, training sessions and company events, we believe a positive workplace creates stronger teams and better outcomes for our clients.',
  galleryTitle: 'Moments That Define Our Culture',
  galleryIntro: 'Explore our gallery to see the people, celebrations and experiences that make Passionate Global a great place to work.',
  // Add photos: put files in public/img/gallery/ and list them in `photos`.
  gallery: [
    { title: 'Team Building Activities', photos: [] as string[] },
    { title: 'Employee Awards & Recognition', photos: [] as string[] },
    { title: 'Training & Development', photos: [] as string[] },
    { title: 'Festival Celebrations', photos: [] as string[] },
    { title: 'Company Events', photos: [] as string[] },
    { title: 'Office Life', photos: [] as string[] },
    { title: 'Community Initiatives', photos: [] as string[] },
  ],
};

export const testimonials = {
  eyebrow: 'Testimonials',
  title: 'Trusted by Businesses That Value Partnership',
  lead: 'The strongest measure of our success is the success of our clients.',
  body: "Every partnership we build is founded on trust, transparency and a shared commitment to achieving outstanding results. We take pride in becoming a reliable extension of our clients' businesses, helping them overcome operational challenges, improve efficiency and scale with confidence.",
  valuesTitle: 'What Our Clients Value',
  values: ['Personalised Service', 'Responsive Communication', 'Dedicated Professionals', 'Consistent Quality', 'Flexible Solutions', 'Long-Term Partnerships'],
  items: [
    { quote: "They're reliable, easy to communicate with, and have provided excellent support with compliance and recruitment. They've become a trusted extension of our business.", role: 'Director', org: 'UK Healthcare Recruitment Agency' },
    { quote: 'The support has been consistently reliable. The team is professional, responsive, and always willing to help. We truly appreciate the partnership.', role: 'Operations Manager', org: 'UK Healthcare Recruitment Agency' },
    { quote: "We've worked with a few outsourcing partners over the years, and this team has stood out. Knowing our compliance and admin are in safe hands gives us one less thing to worry about.", role: 'Founder', org: 'UK Recruitment Agency' },
  ],
};

export const contact = {
  eyebrow: 'Contact Us',
  title: "Let's Start a Conversation",
  lead: 'Every successful partnership begins with a conversation.',
  body: "Whether you're exploring outsourcing for the first time, looking to expand your existing offshore team or searching for a long-term strategic partner, we'd love to learn more about your business and discuss how Passionate Global can support your growth.",
  formTitle: 'Tell Us About Your Business',
  formIntro: 'Complete the enquiry form and one of our consultants will contact you to discuss your requirements, answer your questions and recommend a solution tailored to your business.',
  ctaTitle: 'Ready to Build Your Offshore Team?',
  ctaBody: "Let's create a solution that delivers greater efficiency, exceptional talent and long-term value for your business.",
  ctaButton: 'Book a Free Consultation',
};
