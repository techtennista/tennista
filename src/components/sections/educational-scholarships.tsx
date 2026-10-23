import { SdgGoals } from "@/components/sections/sdg-goals";
import { Container } from "@/components/ui/container";

export function EducationalScholarships() {
  return (
    <section aria-labelledby="scholarships-heading" className="bg-white py-14 sm:py-16">
      <Container>
        <p className="eyebrow text-center text-ink-muted">Our programs</p>
        <h1 id="scholarships-heading" className="headline mt-4 text-center text-display-lg text-blue sm:text-display-xl">
          Educational
          <br />
          Scholarships
        </h1>

        <p className="mx-auto mt-8 max-w-3xl text-center text-[0.975rem] leading-relaxed text-ink-muted">
          We leverage the platform of Tennis to identify outstanding talent and invest in it by supporting
          students with academic scholarships and essential learning materials, including textbooks and
          notebooks, across our communities and the world at large.
        </p>

        <div className="mx-auto mt-10 max-w-4xl rounded-[1.75rem] bg-blue-tint px-6 py-10 sm:px-12 sm:py-12">
          <p className="text-center text-[1.05rem] leading-relaxed font-medium text-blue">
            Our contribution to the achievement of the UN Sustainable Development Goals by 2030 is by
            rewarding high-flying students for their excellence and equipping them with the resources to
            sustain it. Because talent deserves the tools to thrive.
          </p>
        </div>

        <div className="mt-8">
          <SdgGoals ids={[1, 4]} />
        </div>
      </Container>
    </section>
  );
}
