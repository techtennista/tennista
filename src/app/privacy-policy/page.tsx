import type { Metadata } from "next";
import PrivacyPolicy from "@/components/sections/privacy-policy";

export const metadata: Metadata = {
  title: "Privacy Policy | Tennista Foundation",
  description:
    "Learn how Tennista Foundation collects, uses, protects, and manages personal information.",
  alternates: {
    canonical: "/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicy />;
}
