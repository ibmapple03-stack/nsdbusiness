/**
 * Team profiles. Only `published: true` profiles appear on the website.
 * Publish a real person only with management approval and their permission;
 * never add qualifications, achievements or photographs that were not supplied.
 * Photos live in public/team/ and are listed here only once approved.
 */
export type Profile = {
  slug: string;
  kind: "LEADERSHIP" | "STAFF" | "INSTRUCTOR";
  name: string;
  publicTitle: string;
  bio: string;
  /** Path under /public, e.g. "/team/name.jpg" */
  photo?: string;
  published: boolean;
  /** Not shown on the website. */
  note?: string;
};

export const PEOPLE: Profile[] = [
  {
    slug: "mohammed-abdullahi-nasidi",
    kind: "LEADERSHIP",
    name: "Dr. Mohammed Abdullahi Nasidi",
    publicTitle: "Founder and Managing Director/CEO",
    bio: "Dr. Mohammed Abdullahi Nasidi, also known by his traditional title, Baura Adamawa, is a Nigerian entrepreneur and community-development leader based in New York City. He founded NSD Business Academy Limited to expand access to practical business, vocational, and digital learning. He also leads Special Aid for Bright Future Initiatives, which focuses on skills acquisition and empowerment. His vision is to connect useful learning with enterprise development and economic opportunity.",
    photo: "/team/mohammed-abdullahi-nasidi.jpg",
    published: true,
    note: "Biography and photo approved for publication (18–19 Oct 2026).",
  },
  {
    slug: "muktar-buba",
    kind: "STAFF",
    name: "Muktar Buba",
    publicTitle: "Administration, Training and Operations Coordinator",
    bio: "Muktar Buba coordinates office administration, staff activities, training preparation, community engagement, and operational reporting for the Yola team.",
    published: false,
    note: "Proposed public title — subject to confirmation.",
  },
  {
    slug: "maryam-muhammad-gabdo",
    kind: "STAFF",
    name: "Maryam Muhammad Gabdo",
    publicTitle: "Secretary and Administrative Officer",
    bio: "",
    published: false,
    note: "Publish only with management approval and her permission.",
  },
  // Academy Manager: name, approved title, biography and photograph to be supplied.
];
