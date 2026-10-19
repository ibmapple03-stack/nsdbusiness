/** Fixed institutional facts. Change only with documentary evidence. */
export const SITE = {
  name: "NSD Business Academy",
  legalName: "NSD Business Academy Limited",
  tagline: "Practical skills for enterprise and opportunity",
  location: "Yola, Adamawa State, Nigeria",
  cac: {
    registrar: "Corporate Affairs Commission",
    rcNumber: "9902304",
    incorporated: "30 September 2026",
  },
  /** Plain statement used wherever status is described. Do not add accreditation claims. */
  statusStatement:
    "NSD Business Academy Limited is a private company incorporated in Nigeria with the Corporate Affairs Commission (RC 9902304) on 30 September 2026.",
  accreditationStatement:
    "Unless a course page states otherwise, certificates issued by the academy confirm completion of an academy course. They are not accredited national qualifications.",
} as const;

export const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const PILLAR_LABELS = {
  BUSINESS_ENTREPRENEURSHIP: "Business & entrepreneurship",
  DIGITAL_SKILLS: "Digital skills",
  PROFESSIONAL_DEVELOPMENT: "Professional development",
  VOCATIONAL_SKILLS: "Vocational skills",
  BUSINESS_SUPPORT: "Business support",
} as const;

export const PILLAR_COLOR_VAR = {
  BUSINESS_ENTREPRENEURSHIP: "var(--color-pillar-business)",
  DIGITAL_SKILLS: "var(--color-pillar-digital)",
  PROFESSIONAL_DEVELOPMENT: "var(--color-pillar-professional)",
  VOCATIONAL_SKILLS: "var(--color-pillar-vocational)",
  BUSINESS_SUPPORT: "var(--color-pillar-support)",
} as const;

export const FORMAT_LABELS = {
  CLASSROOM: "Classroom",
  ONLINE: "Online",
  BLENDED: "Blended",
  OUTREACH: "Community outreach",
} as const;

export const FORMAT_DESCRIPTIONS = {
  CLASSROOM: "Taught in person, with hands-on practice and direct support from the instructor.",
  ONLINE: "Live or self-paced sessions you join from a phone or computer.",
  BLENDED: "A mix of in-person classes and online learning between sessions.",
  OUTREACH: "Training delivered in communities, markets or workplaces.",
} as const;
