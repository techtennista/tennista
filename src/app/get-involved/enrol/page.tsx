import type { Metadata } from "next";
import { CareersForm } from "@/components/sections/careers-form";
import { CareersHero } from "@/components/sections/careers-hero";

export const metadata: Metadata = {
  title: "Enrol as a Student",
  description: "Enrol as a student with Tennista Foundation.",
  alternates: { canonical: "/get-involved/enrol" },
};

export default function EnrolPage() {
  return (
    <>
      <CareersHero />
      <CareersForm type="student_enrolment" />
    </>
  );
}
