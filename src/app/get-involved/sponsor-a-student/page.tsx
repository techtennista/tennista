import type { Metadata } from "next";
import { CareersForm } from "@/components/sections/careers-form";
import { CareersHero } from "@/components/sections/careers-hero";

export const metadata: Metadata = {
  title: "Sponsor a Student",
  description: "Sponsor a student through Tennista Foundation.",
  alternates: { canonical: "/get-involved/sponsor-a-student" },
};

export default function SponsorPage() {
  return (
    <>
      <CareersHero />
      <CareersForm type="sponsorship" />
    </>
  );
}
