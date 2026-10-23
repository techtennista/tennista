import Link from "next/link";
import { footerNav } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { BrandLockup } from "@/components/layout/brand";
import { GiantWordmark } from "@/components/layout/giant-wordmark";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { Button } from "@/components/ui/button";
import { Facebook, Instagram, LinkedIn } from "@/components/ui/icons";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";
import { WaveDivider } from "@/components/ui/wave-divider";

const socials = [
  { label: "Facebook", href: siteConfig.social.facebook, Icon: Facebook },
  { label: "Instagram", href: siteConfig.social.instagram, Icon: Instagram },
  { label: "LinkedIn", href: siteConfig.social.linkedin, Icon: LinkedIn },
];

export function SiteFooter() {
  return (
    <footer className="relative">
      {/* Newsletter sits in from the edges, with white space around the lime panel. */}
      <section aria-labelledby="newsletter-heading" className="bg-white px-4 pt-8 sm:px-6 sm:pt-10 lg:px-8">
        <Reveal className="rounded-[1.75rem] bg-lime px-6 pt-12 pb-28 sm:px-10 sm:pt-14 lg:px-14 lg:pt-16 lg:pb-32">
          <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
              <div>
                <h2 id="newsletter-heading" className="headline text-display-lg text-blue">
                  <span className="block">Subscribe to</span>
                  <span className="block">our newsletter</span>
                </h2>
                <p className="mt-5 max-w-sm text-[0.9375rem] leading-normal font-medium text-blue-dark/80">
                  We&apos;d love to keep you posted on new programs, the kids we&apos;re working with, and how
                  you can be part of it.
                </p>
              </div>
              <NewsletterForm />
            </div>
        </Reveal>
      </section>

      {/* Link columns. The crest is full width and overlaps the lime panel. */}
      <div className="relative bg-blue text-white">
        <WaveDivider
          variant="hump"
          className="absolute inset-x-0 bottom-full z-10 h-16 text-blue sm:h-20"
        />
        <div className="w-full px-6 sm:px-8 lg:px-12">
          <RevealGroup className="grid gap-12 pt-6 pb-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)_minmax(0,0.7fr)] lg:gap-10">
            <RevealItem>
              <BrandLockup />
              <p className="mt-6 max-w-sm text-[0.875rem] leading-relaxed text-white/80">
                The {siteConfig.name} is a 501(c)(3) non-profit organization focused on empowering youth
                through sport-based development initiatives that blend tennis with education and life skills
                programs. As a registered non-profit (EIN: {siteConfig.ein}), all donations are tax-deductible
                under U.S. law. Thank you for supporting our mission to empower young people through tennis.
              </p>
              <hr className="mt-7 max-w-sm border-white/25" />
              <ul className="mt-6 flex items-center gap-4">
                {socials.map(({ label, href, Icon }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={`${siteConfig.shortName} on ${label}`}
                      className="grid size-9 place-items-center rounded-full text-white transition-all duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-0.5 hover:text-lime"
                    >
                      <Icon className="size-[1.375rem]" />
                    </a>
                  </li>
                ))}
              </ul>
            </RevealItem>

            <RevealItem>
              <h2 className="headline text-display-sm text-white">Quick Links</h2>
              <div className="mt-6 grid gap-x-10 gap-y-8 sm:grid-cols-2">
                {footerNav.map((group) => (
                  <nav key={group.label} aria-label={group.label}>
                    <h3 className="text-[0.9375rem] font-bold text-lime">{group.label}</h3>
                    <ul className="mt-3 space-y-2">
                      {group.links.map((link) => (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            className="inline-block text-[0.875rem] text-white/85 transition-all duration-200 hover:translate-x-1 hover:text-lime"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </nav>
                ))}
              </div>
            </RevealItem>

            <RevealItem>
              <h2 className="headline text-display-sm text-white">Contact Us</h2>
              <address className="mt-6 space-y-2 text-[0.875rem] text-white/85 not-italic">
                <a href={`mailto:${siteConfig.email}`} className="block transition-colors hover:text-lime">
                  {siteConfig.email}
                </a>
                <p>
                  {siteConfig.address.locality}, {siteConfig.address.region}, {siteConfig.address.postalCode}
                </p>
              </address>
              <Button href="/contact" className="mt-7">
                Contact Us
              </Button>
            </RevealItem>
          </RevealGroup>
        </div>

        {/* Closing wordmark ---------------------------------------------- */}
        <div className="pt-8">
          <GiantWordmark />
        </div>

        {/* Legal bar ----------------------------------------------------- */}
        <div className="w-full px-6 sm:px-8 lg:px-12">
          <div className="flex flex-col gap-2 border-t border-white/25 py-6 text-[0.8125rem] text-white/75 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Copyright © {new Date().getFullYear()} {siteConfig.name}
            </p>
            <p>All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
