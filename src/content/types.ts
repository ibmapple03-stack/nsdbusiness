/** Shared types for the website's content files. */

/** Subject areas follow the academy's service pillars. */
export type Pillar = "BUSINESS_ENTREPRENEURSHIP" | "DIGITAL_SKILLS" | "PROFESSIONAL_DEVELOPMENT" | "VOCATIONAL_SKILLS" | "BUSINESS_SUPPORT";

export type DeliveryFormat = "CLASSROOM" | "ONLINE" | "BLENDED" | "OUTREACH";

/** PLANNED = dates confirmed, applications not yet open. */
export type CohortStatus = "PLANNED" | "OPEN" | "RUNNING" | "COMPLETED";

/** One scheduled run of a course. Add only dates, fees and venues management has approved. */
export type Cohort = {
  code: string;
  /** "YYYY-MM-DD" */
  startDate: string;
  endDate: string;
  applicationDeadline?: string;
  timetableSummary?: string;
  deliveryFormat: DeliveryFormat;
  venue?: string;
  capacity: number;
  /** Naira, whole amount, e.g. 30000 */
  feeNaira?: number;
  paymentOptions?: string;
  instalmentsAllowed?: boolean;
  status: CohortStatus;
};
