import { cn } from "@/lib/utils";

/**
 * The organic edge that separates every band of the site. The divider paints
 * itself in `currentColor`, so you colour it with a text utility and place it
 * at the seam between two sections.
 *
 *   <WaveDivider variant="swoop" className="text-blue" />
 */
export type WaveVariant =
  | "wave"
  | "hump"
  | "swoop"
  | "crest"
  | "valley"
  | "footer"
  | "hairline";

const paths: Record<WaveVariant, string> = {
  // Gentle double curve — the workhorse separator.
  wave: "M0,74 C240,16 420,104 720,86 C1020,68 1230,8 1440,40 L1440,140 L0,140 Z",
  // Single crest: low at both edges, high through the middle.
  hump: "M0,108 C220,112 460,72 720,68 C980,64 1220,88 1440,104 L1440,140 L0,140 Z",
  // Deeper single sweep rising from the left.
  swoop:
    "M0,112 C300,16 700,2 1080,44 C1240,62 1350,86 1440,104 L1440,140 L0,140 Z",
  // Shallow lift, used right above the oversized wordmark.
  crest:
    "M0,118 C280,70 760,52 1120,74 C1260,82 1360,98 1440,112 L1440,140 L0,140 Z",
  // Inverse of the crest: deep at the edges, thin through the middle,
  // so a blue band bows outward along its bottom edge.
  valley:
    "M0,72 C260,104 560,134 720,136 C880,134 1180,104 1440,64 L1440,140 L0,140 Z",
  // Wide, shallow downward curve matching the footer design.
  footer:
    "M0,88 C260,118 520,140 720,132 C930,124 1160,78 1440,96 L1440,140 L0,140 Z",
  // Thin drawn line rather than a filled shape.
  hairline: "M0,116 C300,62 780,44 1140,68 C1270,77 1365,94 1440,108",
};

type WaveDividerProps = {
  variant?: WaveVariant;
  /** `bottom` (default) fills downward; `top` flips so the fill rises upward. */
  edge?: "top" | "bottom";
  /** Tailwind height utility override, e.g. "h-16 md:h-28". */
  className?: string;
};

export function WaveDivider({
  variant = "wave",
  edge = "bottom",
  className,
}: WaveDividerProps) {
  const isLine = variant === "hairline";

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none relative w-full select-none",
        "h-[clamp(2rem,5vw,5.5rem)]",
        edge === "top" && "rotate-180",
        className,
      )}
    >
      <svg
        viewBox="0 0 1440 140"
        preserveAspectRatio="none"
        className="block h-full w-full"
        focusable="false"
        aria-hidden
      >
        <path
          d={paths[variant]}
          fill={isLine ? "none" : "currentColor"}
          stroke={isLine ? "currentColor" : "none"}
          strokeWidth={isLine ? 3 : undefined}
          vectorEffect={isLine ? "non-scaling-stroke" : undefined}
        />
      </svg>
    </div>
  );
}
