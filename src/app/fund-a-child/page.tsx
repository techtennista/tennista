import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Donation",
  description: "Support Tennista Foundation and help young people thrive through tennis, education, and life skills.",
  alternates: { canonical: "/fund-a-child" },
};

export default function DonationPage() {
  return (
    <section aria-labelledby="donation-heading" className="overflow-hidden bg-[#f3f7fb] pb-16 sm:pb-20">
      <h1 id="donation-heading" className="sr-only">
        Donation
      </h1>
      <div className="overflow-hidden">
        <img
          src="/donation-banner.jpg"
          alt="Donation. A tennis racket, ball, and wrapped gift on a blue background."
          className="block h-auto w-full -mb-[5%]"
        />
      </div>
      <div
        id="zefy-donation-form-holder"
        className="relative z-10 mx-auto -mt-3 h-[75rem] w-full max-w-[52rem] overflow-hidden rounded-[1.75rem] bg-[#f3f7fb] px-4 shadow-[0_24px_50px_-28px_rgb(0_31_82_/_0.45)] sm:-mt-4 sm:px-0"
        aria-label="Donation form"
      >
        <iframe
          id="zefy-donation-form"
          title="Donation form powered by Zeffy"
          src="https://www.zeffy.com/embed/donation-form/7b2b027f-f1bc-4745-9f84-e9f4a17c2509"
          allow="payment"
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    </section>
  );
}
