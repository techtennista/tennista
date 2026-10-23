/**
 * Navigation is data, not markup. The header mega-menus, the mobile drawer and
 * the footer link columns are all rendered from these structures, so a new page
 * only has to be added once.
 */

export type NavLink = {
  label: string;
  href: string;
  /** Optional one-liner, surfaced in the mega-menu on wide screens. */
  description?: string;
};

export type NavGroup = {
  /** Groups render as a tinted cluster of related links (e.g. "Tennis"). */
  label: string;
  links: NavLink[];
};

export type MenuSection = NavLink | NavGroup;

export type NavItem = {
  label: string;
  href: string;
  /** Present when the item opens a mega-menu. */
  menu?: {
    /** Display heading shown on the panel's left rail. */
    title: string;
    blurb?: string;
    sections: MenuSection[];
  };
};

export function isNavGroup(section: MenuSection): section is NavGroup {
  return "links" in section;
}

export const mainNav: NavItem[] = [
  {
    label: "About",
    href: "/about",
    menu: {
      title: "About Tennista",
      blurb: "Who we are, what drives us, and the impact we are accountable for.",
      sections: [
        { label: "About Us", href: "/about", description: "Our story and why we exist" },
        { label: "Our Team", href: "/our-team", description: "The people behind the foundation" },
        { label: "What Defines Us", href: "/what-defines-us", description: "Vision, mission and values" },
        { label: "FAQs", href: "/faqs", description: "Answers to the questions we get most" },
        { label: "Careers", href: "/careers", description: "Build your career with us" },
        { label: "Impact Report", href: "/impact-report", description: "The numbers behind the mission" },
      ],
    },
  },
  {
    label: "Programs",
    href: "/programs",
    menu: {
      title: "Our Programs",
      blurb: "On the court, in the classroom, and everywhere in between.",
      sections: [
        {
          label: "Tennis",
          links: [
            { label: "School Tennis Support Program", href: "/programs/school-tennis-support" },
            { label: "Junior Tennis Open", href: "/junior-tennis-open" },
            { label: "Our Tennis Training", href: "/programs/tennis-training" },
          ],
        },
        {
          label: "Educational Scholarships",
          href: "/programs#educational-scholarships",
          description: "Funding that keeps the classroom door open",
        },
        {
          label: "Life Skills Training",
          href: "/programs#life-skills-training",
          description: "Mentorship that builds confident leaders",
        },
      ],
    },
  },
  {
    label: "Junior Tennis Open",
    href: "/junior-tennis-open",
  },
  {
    label: "Media & Events",
    href: "/media",
    menu: {
      title: "Media & Events",
      blurb: "Stories, galleries and moments from the Tennista community.",
      sections: [
        { label: "Tennis News", href: "/media/tennis-news", description: "Latest from the blog" },
        { label: "Photo Gallery", href: "/media/photo-gallery", description: "Snapshots from the court" },
        { label: "Video Gallery", href: "/media/video-gallery", description: "Watch the work in motion" },
        { label: "Events", href: "/events", description: "What's coming up next" },
      ],
    },
  },
  {
    label: "Get Involved",
    href: "/get-involved",
  },
];

export const primaryCta: NavLink = { label: "Fund A Child", href: "/fund-a-child" };

export const footerNav: NavGroup[] = [
  {
    label: "About Tennista",
    links: [
      { label: "About", href: "/about" },
      { label: "Our Team", href: "/our-team" },
      { label: "What Defines Us", href: "/what-defines-us" },
      { label: "FAQs", href: "/faqs" },
      { label: "Careers", href: "/careers" },
      { label: "Impact Report", href: "/impact-report" },
      { label: "Find Tennis Courts", href: "/find-tennis-courts" },
    ],
  },
  {
    label: "Media & Events",
    links: [
      { label: "Events", href: "/events" },
      { label: "Tennis News", href: "/media/tennis-news" },
      { label: "Photo Gallery", href: "/media/photo-gallery" },
      { label: "Video Gallery", href: "/media/video-gallery" },
    ],
  },
  {
    label: "Get Involved",
    links: [
      { label: "Become a Volunteer", href: "/serve-with-us" },
      { label: "Partner with Us", href: "/get-involved/support" },
      { label: "Sponsor a Student", href: "/get-involved/sponsor" },
      { label: "Enrol as a Student", href: "/get-involved/enrol" },
    ],
  },
];
