import type { Metadata } from "next";
import { CareersForm } from "@/components/sections/careers-form";
import { CareersHero } from "@/components/sections/careers-hero";

export const metadata: Metadata = {
  title: "Partner with Us",
  description: "Partner with Tennista Foundation to bring tennis, education, and life skills to young people.",
  alternates: { canonical: "/get-involved/partner" },
};

export default function PartnerPage() {
  return (
    <>
      <CareersHero />
      <CareersForm type="partnership" />
    </>
  );
}
