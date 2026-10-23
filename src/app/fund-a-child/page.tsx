import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Donation",
  description: "Support Tennista Foundation and help young people thrive through tennis, education, and life skills.",
  alternates: { canonical: "/fund-a-child" },
};

export default function DonationPage() {
  return (
    <section aria-labelledby="donation-heading" className="overflow-hidden bg-[#f3f7fb] pb-16 sm:pb-20">
      <div className="relative h-48 overflow-hidden sm:h-auto">
        <img
          src="/donation-banner.jpg"
          alt="Donation. A tennis racket, ball, and wrapped gift on a blue background."
          className="block h-full w-full object-cover object-[18%_center] sm:h-auto sm:object-contain sm:-mb-[5%]"
        />
      </div>
      <h1 id="donation-heading" className="headline px-4 pt-6 text-display-lg text-blue sm:sr-only">
        Donation
      </h1>
      <div
        id="zefy-donation-form-holder"
        className="relative z-10 mx-4 mt-5 h-[70rem] max-w-[52rem] overflow-hidden rounded-[1.5rem] bg-white shadow-[0_24px_50px_-28px_rgb(0_31_82_/_0.45)] sm:mx-auto sm:-mt-4 sm:h-[75rem] sm:rounded-[1.75rem] sm:bg-[#f3f7fb]"
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
