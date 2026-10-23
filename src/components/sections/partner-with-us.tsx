import { InquiryForm } from "@/components/sections/inquiry-form";
import { Container } from "@/components/ui/container";

export function PartnerWithUs() {
  return (
    <section aria-labelledby="partner-heading" className="bg-white pt-14 pb-24 sm:pt-20 sm:pb-28">
      <Container>
        <h1
          id="partner-heading"
          className="headline text-center text-[clamp(3rem,6.5vw,5.75rem)] leading-[0.82] text-blue-bright"
        >
          Partner with us
        </h1>

        <div className="relative mt-10 sm:mt-14">
          <div className="rounded-[1.75rem] bg-blue-tint px-6 pt-10 pb-28 sm:px-10 sm:pt-14 sm:pb-32 lg:px-14">
            <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-12">
              <div>
                <p className="text-sm text-gray">An African proverb says</p>
                <p className="mt-4 font-display text-[clamp(1.85rem,3vw,2.75rem)] leading-[0.95] font-extrabold tracking-[-0.01em] text-blue">
                  “If you want to go fast, go alone, If you want to go far, go together.”
                </p>
                <p className="mt-6 max-w-[28rem] text-[1.02rem] leading-relaxed text-gray">
                  At Tennista foundation, we share this philosophy of going farther, together with the support of
                  others.
                </p>
                <p className="mt-5 max-w-[32rem] text-[1.02rem] leading-relaxed text-gray">
                  We are open to partnerships and sponsorship opportunities from individuals or organization who see
                  value in what we do and are willing to support us. Our desire is to create a mutually beneficial
                  relationship with all our partners, sponsors or donors.
                </p>
              </div>
              <img
                src="/partner-with-us.jpg"
                alt="A young player leaning into a forehand as the ball comes off the racket"
                className="aspect-[831/602] w-full rounded-[1.25rem] object-cover"
              />
            </div>
          </div>

          <a
            href="mailto:partnerships@tennistafoundation.org"
            className="absolute bottom-0 left-1/2 w-[min(100%-1.5rem,52rem)] -translate-x-1/2 translate-y-1/2 rounded-[1.15rem] bg-blue px-6 py-7 text-center text-white sm:w-[min(100%-5rem,58rem)] sm:px-10 sm:py-8"
          >
            <span className="block text-[1.02rem] leading-relaxed">
              To partner with us please send an email to us at
            </span>
            <span className="mt-2 block headline text-[clamp(1.15rem,2vw,1.7rem)] leading-none text-white">
              partnerships@tennistafoundation.org
            </span>
          </a>
        </div>
      </Container>
      <div className="mt-24">
        <InquiryForm
          type="partnership"
          heading="Partner with Tennista"
          intro="Share your organisation and how you'd like to work with us. This goes straight to the admin Forms inbox."
        />
      </div>
    </section>
  );
}
