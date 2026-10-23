import type { Metadata } from "next";
import { CareersForm } from "@/components/sections/careers-form";
import { CareersHero } from "@/components/sections/careers-hero";

export const metadata: Metadata = {
  title: "Become a Volunteer",
  description: "Volunteer with Tennista Foundation and help young people through tennis.",
  alternates: { canonical: "/get-involved/volunteer" },
};

export default function VolunteerPage() {
  return (
    <>
      <CareersHero />
      <CareersForm type="volunteer" />
    </>
  );
}
