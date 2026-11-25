import { WaveDivider } from "@/components/ui/wave-divider";
import Image from "next/image";

export function FaqHero() {
  return (
    <section
      aria-labelledby="faq-heading"
      className="relative overflow-hidden bg-blue"
    >
      <Image
        src="/faq-banner.jpg"
        alt="A boy in a blue cap looking down, with another child beside him"
        width={2160}
        height={614}
        sizes="100vw"
        className="block h-auto w-full"
      />
      {/* <h1 id="faq-heading" className="headline absolute inset-0 grid place-items-center text-display-xl text-white sm:text-display-2xl">
        FAQ
      </h1> */}
      <WaveDivider
        variant="hump"
        className="absolute inset-x-0 bottom-0 text-white"
      />
    </section>
  );
}
