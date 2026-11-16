import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

type BrandProps = {
  className?: string;
  /** Rendered pixel height of the logo lockup. */
  height?: number;
  priority?: boolean;
};

/** Full-colour logo lockup, used in the header. */
export function Brand({
  className,
  height = 52,
  priority = false,
}: BrandProps) {
  return (
    <Link
      href="/"
      aria-label={`${siteConfig.name} — home`}
      className={cn(
        "inline-flex shrink-0 items-center transition-transform duration-300 ease-[var(--ease-out-expo)] hover:scale-[1.03]",
        className,
      )}
    >
      <Image
        src="/tennista-logo.png"
        alt={siteConfig.name}
        width={640}
        height={420}
        priority={priority}
        style={{ height, width: "auto" }}
        className="h-auto w-auto"
      />
    </Link>
  );
}

/** Wordmark for the dark footer. */
export function BrandLockup({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label={`${siteConfig.name} — home`}
      className={cn("inline-block", className)}
    >
      <Image
        src="/tennista-footer-logo.png"
        alt={siteConfig.name}
        width={156}
        height={38}
        className="h-10 w-auto"
      />
      <Image
        src="/foundation-logo.png"
        alt="Foundation"
        width={156}
        height={20}
        className="mt-1 h-auto w-full"
      />
    </Link>
  );
}
