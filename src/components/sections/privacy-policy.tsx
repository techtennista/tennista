import type { ReactNode } from "react";
import { Container } from "@/components/ui/container";

type PolicySection = {
  id: string;
  title: string;
  content: ReactNode;
};

const sections: PolicySection[] = [
  {
    id: "information-we-collect",
    title: "1. Information We Collect",
    content: (
      <>
        <p>
          We may collect the following types of personal information from
          students, volunteers, donors, and other individuals who engage with
          Tennista Foundation:
        </p>

        <ul>
          <li>
            <strong>Personal Identification Information:</strong> Name, email
            address, phone number, and postal address.
          </li>
          <li>
            <strong>Demographic Information:</strong> Age, gender, education
            level, and other relevant demographic information.
          </li>
          <li>
            <strong>Donation Information:</strong> Donation amounts, payment
            details (processed securely through third-party payment providers),
            and donation history.
          </li>
          <li>
            <strong>Volunteer Information:</strong> Interests, skills,
            availability, and preferences.
          </li>
          <li>
            <strong>Student Information:</strong> Enrollment details, academic
            interests, participation history, and other information relevant to
            Tennista Foundation programs.
          </li>
          <li>
            <strong>Website Usage Information:</strong> Information relating to
            interactions with our website, including cookies, IP address,
            browser type, and pages visited.
          </li>
          <li>
            <strong>Photographs and Videos:</strong> Images, photographs, and
            video recordings captured during Tennista Foundation events,
            competitions, training sessions, community outreach activities, and
            other Foundation-related programs.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "how-we-use-information",
    title: "2. How We Use Your Information",
    content: (
      <>
        <p>The information collected is used for the following purposes:</p>

        <ul>
          <li>
            <strong>Program Management:</strong> To enroll and manage student
            participation in our programs.
          </li>
          <li>
            <strong>Volunteer Coordination:</strong> To recruit, manage, and
            communicate with volunteers.
          </li>
          <li>
            <strong>Donation Processing:</strong> To process donations, issue
            receipts, and keep donors informed about the impact of their
            contributions.
          </li>
          <li>
            <strong>Communication:</strong> To send updates about our
            activities, events, programs, and opportunities for engagement.
          </li>
          <li>
            <strong>Website Improvement:</strong> To analyze website usage and
            improve the functionality and user experience of our website.
          </li>
          <li>
            <strong>Organizational Promotion and Awareness:</strong> To share
            information about Tennista Foundation's activities, achievements,
            programs, and impact with the public, donors, sponsors, and
            partners.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "photography-video-images",
    title: "3. Photography, Video and Use of Images",
    content: (
      <>
        <p>
          Tennista Foundation may take photographs and record videos during
          publicly organized events, tennis competitions, tournaments, training
          sessions, community activities, and other Foundation- sponsored or
          affiliated programs.
        </p>

        <p>
          By participating in or attending these public events, individuals
          acknowledge that photographs and video recordings may be taken and
          that Tennista Foundation may use such images and recordings for
          legitimate nonprofit and organizational purposes, including:
        </p>

        <ul>
          <li>
            Promoting the Foundation's programs, initiatives, and activities.
          </li>
          <li>
            Sharing highlights and achievements from competitions, tournaments,
            and events.
          </li>
          <li>
            Publishing event updates, news, and success stories on the
            Foundation's official website and social media platforms.
          </li>
          <li>
            Creating organizational reports, newsletters, presentations, and
            other nonprofit communications.
          </li>
          <li>
            Raising public awareness about the Foundation's mission and
            community impact.
          </li>
        </ul>

        <p>
          <strong>Non-Commercial Use:</strong> Photographs and videos obtained
          during Foundation events will be used exclusively for nonprofit,
          educational, informational, publicity, and organizational promotional
          purposes. Tennista Foundation will not sell these photographs or
          videos, license them for commercial sale, or use them for unrelated
          commercial advertising.
        </p>

        <p>
          <strong>Privacy and Respect:</strong> Tennista Foundation will make
          reasonable efforts to ensure that photographs and videos are used
          respectfully and appropriately and do not compromise the dignity,
          safety, or privacy of individuals featured.
        </p>

        <p>
          <strong>Children and Minors:</strong> Where photographs or videos
          feature children under the age of 18, the Foundation will take
          appropriate steps to obtain parental or legal guardian consent where
          required by applicable law or where the circumstances of the
          photography or intended use warrant such consent. The Foundation will
          exercise particular care when publishing identifiable images of
          children.
        </p>

        <p>
          <strong>Requests and Opt-Out:</strong> Individuals who do not wish to
          have their identifiable photographs or videos used in the Foundation's
          promotional materials may notify Tennista Foundation in writing at{" "}
          <a href="mailto:info@tennistafoundation.org">
            info@tennistafoundation.org
          </a>
          . The Foundation will make reasonable efforts to accommodate such
          requests and, where practicable, remove or refrain from using the
          relevant images in future publications. Requests will be handled
          subject to applicable legal obligations and practical limitations,
          including materials already printed or distributed.
        </p>
      </>
    ),
  },
  {
    id: "sharing-information",
    title: "4. How We Share Your Information",
    content: (
      <>
        <p>
          Tennista Foundation will not sell, rent, or trade your personal
          information to third parties.
        </p>

        <p>
          We may share relevant information with trusted third-party service
          providers for the following purposes:
        </p>

        <ul>
          <li>Processing donations and financial transactions.</li>
          <li>Managing email communications and event registrations.</li>
          <li>
            Providing technical support and maintaining website operations.
          </li>
          <li>
            Supporting the administration and delivery of Foundation programs.
          </li>
        </ul>

        <p>
          These third-party service providers are expected to handle personal
          information responsibly and in accordance with applicable privacy and
          data protection requirements.
        </p>
      </>
    ),
  },
  {
    id: "data-security",
    title: "5. Data Security",
    content: (
      <>
        <p>
          We take the security of personal information seriously. We implement
          appropriate technical and organizational measures to protect
          information from unauthorized access, alteration, loss, or disclosure.
        </p>

        <p>
          However, no online transmission or electronic storage system is
          completely secure, and we cannot guarantee the absolute security of
          information transmitted or stored electronically.
        </p>
      </>
    ),
  },
  {
    id: "your-rights",
    title: "6. Your Rights",
    content: (
      <>
        <p>Subject to applicable laws, you have the right to:</p>

        <ul>
          <li>Access and request a copy of your personal information.</li>
          <li>Request corrections to inaccurate or incomplete information.</li>
          <li>
            Request the deletion of your personal information, subject to legal
            and operational requirements.
          </li>
          <li>
            Opt out of receiving future communications from Tennista Foundation.
          </li>
          <li>
            Request that the Foundation refrain from using identifiable
            photographs or videos of you in future promotional publications.
          </li>
        </ul>

        <p>
          To exercise any of these rights, please contact us at{" "}
          <a href="mailto:info@tennistafoundation.org">
            info@tennistafoundation.org
          </a>
          .
        </p>
      </>
    ),
  },
  {
    id: "childrens-privacy",
    title: "7. Children's Privacy",
    content: (
      <>
        <p>
          Tennista Foundation takes special care to protect the privacy and
          safety of children participating in its programs.
        </p>

        <p>
          We do not knowingly collect personal information from children under
          the age of 13 without obtaining appropriate parental or legal guardian
          consent.
        </p>

        <p>
          Where we collect information about children for program registration,
          participation, or administration, we take reasonable steps to ensure
          that such information is handled responsibly and appropriately.
        </p>

        <p>
          For photographs and videos involving minors, please refer to Section 3
          of this Privacy Policy.
        </p>

        <p>
          If we become aware that we have collected personal information from a
          child under 13 without the required consent, we will take appropriate
          steps to address the situation, including deleting the information
          where necessary.
        </p>
      </>
    ),
  },
  {
    id: "cookies-tracking",
    title: "8. Cookies and Tracking Technologies",
    content: (
      <>
        <p>
          Our website may use cookies and other tracking technologies to enhance
          user experience, monitor website traffic, and understand how visitors
          interact with our content.
        </p>

        <p>
          You may adjust your browser settings to refuse cookies. However, doing
          so may affect certain website functionalities.
        </p>
      </>
    ),
  },
  {
    id: "policy-changes",
    title: "9. Changes to This Policy",
    content: (
      <>
        <p>
          Tennista Foundation reserves the right to update or revise this
          Privacy Policy from time to time to reflect changes in our operations,
          programs, technology, or applicable legal requirements.
        </p>

        <p>
          We encourage visitors and participants to review this policy
          periodically. Any significant changes will be reflected in the updated
          policy published on our website, together with the revised effective
          date.
        </p>
      </>
    ),
  },
  {
    id: "contact-us",
    title: "10. Contact Us",
    content: (
      <>
        <p>
          If you have questions, concerns, or requests relating to this Privacy
          Policy or the use of your personal information, photographs, or
          videos, please contact us:
        </p>

        <address className="not-italic">
          <strong className="block text-blue">Tennista Foundation Inc.</strong>
          <span className="block">Olney, Maryland, USA</span>
          <span className="mt-3 block">
            Website:{" "}
            <a
              href="https://tennistafoundation.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              tennistafoundation.org
            </a>
          </span>
          <span className="block">
            Email:{" "}
            <a href="mailto:info@tennistafoundation.org">
              info@tennistafoundation.org
            </a>
          </span>
        </address>
      </>
    ),
  },
];

const tableOfContents = sections.map(({ id, title }) => ({ id, title }));

export default function PrivacyPolicy() {
  return (
    <main id="top" className="bg-white">
      <section className="bg-blue-tint py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-blue">
              Tennista Foundation
            </p>

            <h1 className="headline text-display-xl text-blue">
              Privacy Policy
            </h1>

            <p className="mt-5 text-base leading-7 text-ink/75 sm:text-lg">
              Your privacy matters to us. Learn how we collect, use, and
              safeguard your personal information.
            </p>
          </div>
        </Container>
      </section>

      <section className="pt-14 sm:pt-20">
        <Container width="narrow">
          <div className="space-y-5 text-base leading-8 text-ink/80">
            <p>
              At Tennista Foundation, we are committed to protecting the privacy
              and security of all individuals who engage with us, including
              students, parents and guardians, volunteers, donors, partners, and
              other participants in our programs.
            </p>

            <p>
              This Privacy Policy outlines how we collect, use, store, and
              safeguard personal information provided to us through our website
              and other interactions with the Foundation. By using our website,
              registering for our programs, or participating in our activities,
              you acknowledge the practices described in this policy.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-12 sm:py-16">
        <Container width="narrow">
          <div className="rounded-3xl bg-lime-tint p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue">
              On this page
            </p>

            <h2 className="headline mt-2 text-2xl text-blue sm:text-3xl">
              Table of Contents
            </h2>

            <nav aria-label="Privacy policy sections" className="mt-6">
              <ol className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {tableOfContents.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="group flex items-start gap-3 text-sm leading-6 text-ink/80 transition-colors hover:text-blue"
                    >
                      <span className="font-semibold text-blue">
                        {item.title.split(".")[0]}.
                      </span>
                      <span className="underline decoration-blue/20 underline-offset-4 transition-colors group-hover:decoration-blue">
                        {item.title.substring(item.title.indexOf(".") + 2)}
                      </span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        </Container>
      </section>

      <section className="pb-20 sm:pb-28">
        <Container width="narrow">
          <div className="divide-y divide-ink/10">
            {sections.map((section) => (
              <article
                key={section.id}
                id={section.id}
                className="scroll-mt-28 py-9 first:pt-0 sm:py-11"
              >
                <h2 className="headline text-2xl leading-tight text-blue sm:text-3xl">
                  {section.title}
                </h2>

                <div className="policy-content mt-6 space-y-5 text-[15px] leading-8 text-ink/80 sm:text-base">
                  {section.content}
                </div>
              </article>
            ))}
          </div>

          <div className="mt-10 border-t border-ink/10 pt-8">
            <a
              href="#top"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue transition-opacity hover:opacity-70"
            >
              Back to top
              <span aria-hidden="true">↑</span>
            </a>
          </div>
        </Container>
      </section>
    </main>
  );
}
