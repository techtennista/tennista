/**
 * Single source of truth for site-wide identity, used by metadata, JSON-LD,
 * the footer and the contact blocks.
 */
export const siteConfig = {
  name: "Tennista Foundation",
  shortName: "Tennista",
  // Must match the host the site is served on; non-www 308s to www.
  url: (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://www.tennistafoundation.org").replace(/\/$/, ""),
  tagline: "Every serve starts a story",
  description:
    "Tennista Foundation is a 501(c)(3) non-profit using tennis, education and life skills to unlock the potential of young people and turn it into confidence, direction and possibility.",
  ein: "99-2301282",
  email: "info@tennistafoundation.org",
  address: {
    locality: "Olney",
    region: "Maryland",
    postalCode: "20832",
    country: "US",
  },
  social: {
    facebook: "https://www.facebook.com/tennistafoundation",
    instagram: "https://www.instagram.com/tennistafoundation",
    linkedin: "https://www.linkedin.com/company/tennistafoundation",
  },
  locale: "en_US",
  twitterHandle: "@tennistafdn",
} as const;

export type SiteConfig = typeof siteConfig;
