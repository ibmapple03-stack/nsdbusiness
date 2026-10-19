/**
 * Editable page text. Purpose, mission and vision are taken from the brand
 * guideline and still need management sign-off, so everything is a DRAFT.
 */
export const CONTENT_BLOCKS = [
  {
    key: "home.intro",
    location: "Home — introduction under the headline",
    title: "Practical skills for enterprise and opportunity",
    body: "NSD Business Academy offers practical business, vocational, entrepreneurial and digital skills training in Yola, Adamawa State. Our courses are built around the work learners do — starting and running a business, improving a trade, or preparing for employment.",
  },
  {
    key: "home.audience",
    location: "Home — who the academy is for",
    title: "Who we train",
    body: "- People starting or running a small business\n- Young people preparing for work\n- Tradespeople who want to grow their skills and income\n- Organisations that need practical training for their staff",
  },
  {
    key: "about.purpose",
    location: "About — purpose",
    title: "Our purpose",
    body: "To empower individuals with practical knowledge and skills that drive entrepreneurship, employability and sustainable business growth.",
  },
  {
    key: "about.mission",
    location: "About — mission",
    title: "Our mission",
    body: "To deliver high-quality, practical training and support that enables individuals to learn, build businesses and create a better future.",
  },
  {
    key: "about.vision",
    location: "About — vision",
    title: "Our vision",
    body: "To be Africa's leading business academy, raising a new generation of skilled professionals and successful entrepreneurs.",
  },
  {
    key: "about.values",
    location: "About — values",
    title: "Our values",
    body: "- Professional: we prepare well, keep our commitments and treat learners with respect.\n- Empowering: we teach skills learners can use straight away.\n- Trustworthy: we are honest about what our courses offer and what they cost.\n- Innovative: we keep courses current with how work and business are changing.\n- Approachable: we make it easy to ask questions and get help.",
  },
  {
    key: "admissions.steps",
    location: "Admissions — how to apply",
    title: "How to apply",
    body: "- Choose a course and check the cohort dates.\n- Create an account and confirm your email address and phone number.\n- Complete the application form and upload any documents requested.\n- We review your application and tell you our decision.\n- If you are offered a place, accept the enrolment terms and pay the fee or first approved instalment.\n- Your place is confirmed once we have verified your payment and confirmed your enrolment.",
  },
  {
    key: "admissions.requirements",
    location: "Admissions — requirements",
    title: "What you need",
    body: "For our introductory course you need:\n- A completed application form\n- Your full name and a telephone number we can reach you on\n- An email address, if you have one\n- To be aged 18 or over\n\nWe check your identity when you are admitted, but we do not keep copies of identity documents unless we need to. A passport-style photograph is requested only where it is needed for your student record or ID card. Academic certificates are not required for this course.\n\nBefore your place is confirmed, you accept the enrolment and refund terms and pay the fee once you have been admitted.",
  },
  {
    key: "admissions.fees",
    location: "Admissions — fees",
    title: "Fees and payment",
    body: "Fees are shown in naira for each cohort. Where instalments are offered, the plan is shown on the cohort and in your invoice. Paying a fee does not by itself guarantee a place: your place is confirmed when your application has been accepted and your payment verified.",
  },
  {
    key: "admissions.support",
    location: "Admissions — help",
    title: "Help with your application",
    body: "If you have questions about which course suits you, or need help completing the application, contact the academy office.",
  },
  {
    key: "corporate.intro",
    location: "Corporate training — introduction",
    title: "Training for your organisation",
    body: "We can adapt our courses for your staff, members or beneficiaries, or design a short programme around a specific need. Tell us what you need and we will reply with a proposal.",
  },
  {
    key: "partnerships.intro",
    location: "Partnerships — introduction",
    title: "Partner with the academy",
    body: "We welcome conversations with organisations interested in sponsoring learners, co-delivering training or supporting enterprise development in Adamawa State.",
  },
];

export const FOUNDER_BIO =
  "Dr. Mohammed Abdullahi Nasidi, also known by his traditional title, Baura Adamawa, is a Nigerian entrepreneur and community-development leader based in New York City. He founded NSD Business Academy Limited to expand access to practical business, vocational, and digital learning. He also leads Special Aid for Bright Future Initiatives, which focuses on skills acquisition and empowerment. His vision is to connect useful learning with enterprise development and economic opportunity.";

/** Supplied by management (19 Oct 2026). Public title still subject to confirmation, so the profile stays unpublished. */
export const MUKTAR_BIO =
  "Muktar Buba coordinates office administration, staff activities, training preparation, community engagement, and operational reporting for the Yola team.";

/** First announcement, dated the day of incorporation. Facts as supplied by management. */
export const INCORPORATION_NEWS = {
  slug: "academy-incorporated",
  kind: "ANNOUNCEMENT" as const,
  title: "NSD Business Academy Limited is incorporated",
  summary: "The academy was incorporated with the Corporate Affairs Commission on 30 September 2026.",
  body: "NSD Business Academy Limited was incorporated in Nigeria with the Corporate Affairs Commission on 30 September 2026 (RC 9902304).\n\nThe academy is based in Yola, Adamawa State, and will offer practical business, vocational and digital skills training. Its first proposed course, Practical Entrepreneurship and Small Business Management, is being prepared. Dates and fees will be published once they are confirmed.\n\nTo register your interest, contact the academy office.",
  publishedAt: new Date("2026-09-30T09:00:00Z"),
};
