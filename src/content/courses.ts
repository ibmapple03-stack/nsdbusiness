import type { Cohort, DeliveryFormat, Pillar } from "./types";

/**
 * Courses. Only entries with `published: true` appear on the website. The
 * others are draft outlines for the Academy Manager to complete; publish one
 * only when management has approved its details, fee, certificate wording
 * and refund terms.
 */
export type Course = {
  published?: boolean;
  /** Approved, scheduled runs. Leave empty until dates are confirmed. */
  cohorts?: Cohort[];
  slug: string;
  title: string;
  pillar: Pillar;
  summary: string;
  targetAudience: string;
  outcomes: string[];
  prerequisites: string[];
  curriculum: { title: string; topics: string[] }[];
  durationLabel: string;
  durationWeeks: number;
  deliveryFormats: DeliveryFormat[];
  assessment: string;
  completionRequirements: string;
  description?: string;
  certificateType?: string;
  refundTerms?: string;
};

const DRAFT_NOTE = "Draft outline — to be completed and confirmed by the Academy Manager.";

export const COURSES: Course[] = [
  {
    // Supplied by management (19 Oct 2026) as the first proposed course. Dates and venue still to be confirmed.
    published: true,
    cohorts: [],
    slug: "entrepreneurship-small-business",
    title: "Practical Entrepreneurship and Small Business Management",
    pillar: "BUSINESS_ENTREPRENEURSHIP",
    summary: "A four-week, in-person course in Yola on starting and running a small business, from testing an idea to presenting your own business plan.",
    description:
      "Four weeks of practical learning in Yola: 24 instructor-led hours, in two three-hour sessions each week, plus practical assignments. The teaching venue will be confirmed with the course dates.\n\nThe fee covers tuition, digital handouts, assessment and an academy completion certificate. Any additional charges will be made clear before you enrol.\n\nProposed fee: ₦30,000 per participant, payable in full or in two instalments of ₦15,000 — the first after admission and the second before Week 3. The fee, dates and venue will be confirmed before enrolment opens.",
    targetAudience: "Aspiring entrepreneurs, small-business owners and self-employed people.",
    outcomes: [
      "Test a business idea against what customers need",
      "Cost and price your product or service and manage cash flow",
      "Keep simple business records",
      "Market and sell, online and in person, and look after customers",
      "Plan how the business will run day to day",
      "Present a practical business plan",
    ],
    prerequisites: [
      "Aged 18 or over",
      "Basic reading and numeracy",
      "Interest in starting or growing a business",
      "Willingness to complete practical work",
      "No degree or academic certificates required",
    ],
    curriculum: [
      { title: "Week 1 — Ideas and customers", topics: ["Business ideas", "Customer needs", "Market validation"] },
      { title: "Week 2 — Money and records", topics: ["Costing", "Pricing", "Cash flow", "Simple business records"] },
      { title: "Week 3 — Marketing and sales", topics: ["Marketing", "Digital promotion", "Sales", "Customer service"] },
      { title: "Week 4 — Operations and your plan", topics: ["Business operations", "Final business-plan presentation"] },
    ],
    durationLabel: "4 weeks · 24 instructor-led hours",
    durationWeeks: 4,
    deliveryFormats: ["CLASSROOM"],
    assessment: "- Practical assignments: 60%\n- Final business plan and presentation: 40%",
    completionRequirements: "To complete the course you need at least 80% attendance, all required assignments submitted, and an overall assessment score of at least 50%.",
    certificateType:
      "An NSD Business Academy Limited certificate of completion, stating the course title, the 24 instructor-led hours and practical assessments, and your course dates. Each certificate carries a certificate number, issue date and authorised signatures.",
    refundTerms:
      "- Cancel before the first session: full refund of course fees.\n- Withdraw after the course starts: refund of unused tuition in proportion, less any separately disclosed materials already supplied. We give you the calculation in writing.\n- If the academy cancels, or materially changes the start date: a full refund or a transfer, your choice.",
  },
  {
    slug: "business-management",
    title: "Business Management",
    pillar: "BUSINESS_ENTREPRENEURSHIP",
    summary: "Core management skills for supervisors, owners and team leads: people, operations, money and decisions.",
    targetAudience: "Supervisors, small-business owners and staff moving into management roles.",
    outcomes: [
      "Plan and delegate work across a small team",
      "Read a simple income statement and cash-flow summary",
      "Set targets and track performance",
      "Handle common workplace problems fairly and consistently",
    ],
    prerequisites: ["Some work or business experience is helpful"],
    curriculum: [
      { title: "The manager's role", topics: ["Planning", "Organising", "Delegating"] },
      { title: "Leading people", topics: ["Communication", "Motivation", "Handling conflict"] },
      { title: "Operations and quality", topics: ["Processes", "Customer service standards"] },
      { title: "Money and decisions", topics: ["Budgets", "Reading financial summaries", "Making decisions with data"] },
    ],
    durationLabel: "To be confirmed",
    durationWeeks: 8,
    deliveryFormats: ["CLASSROOM"],
    assessment: DRAFT_NOTE,
    completionRequirements: DRAFT_NOTE,
  },
  {
    slug: "digital-marketing",
    title: "Digital Marketing",
    pillar: "DIGITAL_SKILLS",
    summary: "Reach and serve customers online using social media, WhatsApp Business, simple content and basic analytics.",
    targetAudience: "Business owners, marketing assistants and job seekers who want practical online marketing skills.",
    outcomes: [
      "Set up and manage business profiles on the main social platforms",
      "Plan a month of useful posts for a real business",
      "Use WhatsApp Business catalogues and quick replies",
      "Read basic reach and engagement figures and adjust your plan",
    ],
    prerequisites: ["Access to a smartphone", "Basic phone and internet use"],
    curriculum: [
      { title: "Marketing basics", topics: ["Customers and messages", "Brand consistency"] },
      { title: "Social media for business", topics: ["Profiles", "Content planning", "Photography with a phone"] },
      { title: "Messaging and sales", topics: ["WhatsApp Business", "Responding to enquiries"] },
      { title: "Measuring results", topics: ["Platform insights", "Simple reporting"] },
    ],
    durationLabel: "To be confirmed",
    durationWeeks: 6,
    deliveryFormats: ["CLASSROOM", "BLENDED"],
    assessment: DRAFT_NOTE,
    completionRequirements: DRAFT_NOTE,
  },
  {
    slug: "accounting-bookkeeping",
    title: "Accounting and Bookkeeping",
    pillar: "PROFESSIONAL_DEVELOPMENT",
    summary: "Keep accurate books for a small business: records, reconciliations and simple financial statements.",
    targetAudience: "Bookkeepers, small-business owners, and administrative staff who handle money.",
    outcomes: [
      "Record transactions using double-entry principles",
      "Reconcile cash and bank records",
      "Prepare a simple income statement and balance sheet",
      "Use a spreadsheet to keep books",
    ],
    prerequisites: ["Comfortable with arithmetic"],
    curriculum: [
      { title: "Bookkeeping foundations", topics: ["Source documents", "Double entry", "Ledgers"] },
      { title: "Cash and bank", topics: ["Cash books", "Bank reconciliation"] },
      { title: "Financial statements", topics: ["Trial balance", "Income statement", "Balance sheet"] },
      { title: "Spreadsheet bookkeeping", topics: ["Templates", "Formulas", "Checks"] },
    ],
    durationLabel: "To be confirmed",
    durationWeeks: 8,
    deliveryFormats: ["CLASSROOM"],
    assessment: DRAFT_NOTE,
    completionRequirements: DRAFT_NOTE,
  },
  {
    slug: "computer-digital-skills",
    title: "Computer and Digital Skills",
    pillar: "DIGITAL_SKILLS",
    summary: "Confident everyday computer use: files, documents, spreadsheets, email, online safety and productivity.",
    targetAudience: "Beginners and improvers who need computer skills for work, study or business.",
    outcomes: [
      "Manage files and folders on a computer",
      "Create and format documents and simple spreadsheets",
      "Use email professionally",
      "Recognise and avoid common online scams",
    ],
    prerequisites: ["None"],
    curriculum: [
      { title: "Using a computer", topics: ["Keyboard and mouse", "Files and folders"] },
      { title: "Documents", topics: ["Word processing", "Letters and CVs"] },
      { title: "Spreadsheets", topics: ["Tables", "Simple formulas"] },
      { title: "Online", topics: ["Email", "Online safety", "Cloud storage"] },
    ],
    durationLabel: "To be confirmed",
    durationWeeks: 6,
    deliveryFormats: ["CLASSROOM"],
    assessment: DRAFT_NOTE,
    completionRequirements: DRAFT_NOTE,
  },
  {
    slug: "catering-food-enterprise",
    title: "Catering and Food Enterprise",
    pillar: "VOCATIONAL_SKILLS",
    summary: "Food preparation, hygiene and the business side of catering — costing, orders and serving customers.",
    targetAudience: "Aspiring caterers, food vendors and people running small food businesses.",
    outcomes: [
      "Apply food hygiene and safe-handling practices",
      "Plan and cost menus for events and daily sales",
      "Manage orders, suppliers and stock",
      "Present and package food for sale",
    ],
    prerequisites: ["None"],
    curriculum: [
      { title: "Food safety", topics: ["Hygiene", "Storage", "Handling"] },
      { title: "Menu planning and costing", topics: ["Portioning", "Recipe costing"] },
      { title: "Running a food business", topics: ["Orders", "Suppliers", "Pricing"] },
      { title: "Presentation and packaging", topics: ["Plating", "Packaging for sale"] },
    ],
    durationLabel: "To be confirmed",
    durationWeeks: 8,
    deliveryFormats: ["CLASSROOM"],
    assessment: DRAFT_NOTE,
    completionRequirements: DRAFT_NOTE,
  },
  {
    slug: "fashion-tailoring",
    title: "Fashion and Tailoring",
    pillar: "VOCATIONAL_SKILLS",
    summary: "Measuring, pattern drafting, cutting and sewing, with the skills to run a tailoring business.",
    targetAudience: "Beginners and tailors who want to improve their craft or start a fashion business.",
    outcomes: [
      "Take accurate body measurements",
      "Draft basic patterns and cut fabric efficiently",
      "Construct and finish garments to a good standard",
      "Price work and manage customer orders",
    ],
    prerequisites: ["None"],
    curriculum: [
      { title: "Tools and measurements", topics: ["Equipment", "Measuring"] },
      { title: "Pattern drafting and cutting", topics: ["Basic blocks", "Layout and cutting"] },
      { title: "Garment construction", topics: ["Seams", "Finishing", "Fitting"] },
      { title: "The tailoring business", topics: ["Pricing", "Orders", "Customer care"] },
    ],
    durationLabel: "To be confirmed",
    durationWeeks: 12,
    deliveryFormats: ["CLASSROOM"],
    assessment: DRAFT_NOTE,
    completionRequirements: DRAFT_NOTE,
  },
  {
    slug: "cleaning-janitorial-enterprise",
    title: "Cleaning and Janitorial Enterprise",
    pillar: "VOCATIONAL_SKILLS",
    summary: "Professional cleaning methods, safety and how to win and manage cleaning contracts.",
    targetAudience: "Cleaning staff, supervisors and people starting a cleaning business.",
    outcomes: [
      "Use correct methods and chemicals for different surfaces",
      "Work safely and follow health and safety procedures",
      "Prepare a cleaning schedule and quality checklist",
      "Price and quote for a cleaning contract",
    ],
    prerequisites: ["None"],
    curriculum: [
      { title: "Cleaning methods", topics: ["Surfaces", "Equipment", "Chemicals"] },
      { title: "Health and safety", topics: ["Protective equipment", "Safe handling"] },
      { title: "Quality and supervision", topics: ["Schedules", "Checklists"] },
      { title: "The cleaning business", topics: ["Quoting", "Contracts", "Staffing"] },
    ],
    durationLabel: "To be confirmed",
    durationWeeks: 4,
    deliveryFormats: ["CLASSROOM"],
    assessment: DRAFT_NOTE,
    completionRequirements: DRAFT_NOTE,
  },
  {
    slug: "security-business-management",
    title: "Security Business Management",
    pillar: "BUSINESS_SUPPORT",
    summary: "Managing a private guarding business: operations, staff, client service and compliance awareness.",
    targetAudience: "Owners, managers and supervisors of private guarding businesses.",
    outcomes: [
      "Plan guard deployment and shift rosters",
      "Recruit, brief and supervise security staff",
      "Prepare incident reports and client updates",
      "Understand the licensing and compliance questions to raise with the relevant authorities",
    ],
    prerequisites: ["Experience in or with the security sector is helpful"],
    curriculum: [
      { title: "Operations", topics: ["Site assessment", "Deployment", "Rosters"] },
      { title: "People", topics: ["Recruitment", "Briefing", "Supervision"] },
      { title: "Clients and reporting", topics: ["Contracts", "Incident reports"] },
      { title: "Compliance awareness", topics: ["Licensing questions", "Record keeping"] },
    ],
    durationLabel: "To be confirmed",
    durationWeeks: 4,
    deliveryFormats: ["CLASSROOM"],
    assessment: DRAFT_NOTE,
    completionRequirements: DRAFT_NOTE,
  },
  {
    slug: "logistics-supply-chain",
    title: "Logistics and Supply Chain Fundamentals",
    pillar: "PROFESSIONAL_DEVELOPMENT",
    summary: "How goods move from supplier to customer: purchasing, storage, transport and inventory control.",
    targetAudience: "Store keepers, dispatch and procurement staff, traders and small distributors.",
    outcomes: [
      "Describe how a simple supply chain works end to end",
      "Keep accurate inventory records and do stock counts",
      "Plan deliveries and compare transport options",
      "Follow basic purchasing controls",
    ],
    prerequisites: ["Basic arithmetic"],
    curriculum: [
      { title: "Supply chain basics", topics: ["Flows of goods, money and information"] },
      { title: "Purchasing", topics: ["Quotes", "Orders", "Controls"] },
      { title: "Warehousing and inventory", topics: ["Storage", "Stock counts", "Reorder levels"] },
      { title: "Transport and delivery", topics: ["Route planning", "Costs", "Proof of delivery"] },
    ],
    durationLabel: "To be confirmed",
    durationWeeks: 6,
    deliveryFormats: ["CLASSROOM"],
    assessment: DRAFT_NOTE,
    completionRequirements: DRAFT_NOTE,
  },
];
