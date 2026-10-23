const FORM_LABELS: Record<string, string> = {
  contact: "Contact form",
  newsletter: "Newsletter signup",
  volunteer: "Volunteer application",
  tournament_registration: "Junior tournament registration",
  event_registration: "Event registration",
  partnership: "Partnership inquiry",
  sponsorship: "Sponsorship inquiry",
  student_enrolment: "Student enrolment",
  comment: "News comment",
};

const PATH_LABELS: Record<string, string> = {
  "/contact": "Contact page",
  "/careers": "Careers page",
  "/get-involved/volunteer": "Become a Volunteer",
  "/get-involved/partner": "Partner with Us",
  "/get-involved/support": "Get Involved → Support",
  "/get-involved/sponsor": "Become a Sponsor",
  "/get-involved/sponsor-a-student": "Sponsor a Student",
  "/get-involved/enrol": "Enrol as a Student",
  "/junior-tennis-tournament": "Junior Tennis Tournament",
  "/newsletter": "Site footer newsletter",
};

export function formTypeLabel(type: string) {
  return FORM_LABELS[type] ?? type.replaceAll("_", " ");
}

export function sourcePathLabel(path: string | null | undefined) {
  if (!path) return null;
  const clean = path.split("?")[0] ?? path;
  if (PATH_LABELS[clean]) return PATH_LABELS[clean];
  if (clean.startsWith("/media/tennis-news/")) return "News article comment";
  return clean;
}

export const FORM_TYPE_FILTERS = [
  { value: "contact", label: "Contact form" },
  { value: "newsletter", label: "Newsletter signup" },
  { value: "volunteer", label: "Volunteer application" },
  { value: "tournament_registration", label: "Junior tournament registration" },
  { value: "event_registration", label: "Event registration" },
  { value: "partnership", label: "Partnership inquiry" },
  { value: "sponsorship", label: "Sponsorship inquiry" },
  { value: "student_enrolment", label: "Student enrolment" },
  { value: "comment", label: "News comment" },
] as const;

export type FormType = (typeof FORM_TYPE_FILTERS)[number]["value"];

export function isFormType(value: string): value is FormType {
  return FORM_TYPE_FILTERS.some((item) => item.value === value);
}

export function formTypeHref(type: string) {
  return `/admin/forms/${type}`;
}
