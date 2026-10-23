"use client";

import Link from "next/link";
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "news", label: "Tennis News" },
  { id: "photos", label: "Photo Gallery" },
  { id: "videos", label: "Video Gallery" },
  { id: "events", label: "Events" },
] as const;

type TabId = (typeof tabs)[number]["id"];
export type MediaStory = { title: string; image: string; href: string; date?: string };
export type PhotoFeedItem = MediaStory & { id: string };
export type PhotoFeed = {
  items: PhotoFeedItem[];
  nextOffset: number | null;
  total: number;
};

const shots = [
  {
    image: "/feed-your-eyes-1.png",
    alt: "Close-up of a young player on court",
    x: -43,
    y: 76,
    width: "clamp(9rem,15.5vw,14rem)",
  },
  {
    image: "/feed-your-eyes-2.png",
    alt: "A young player reaching forward with a tennis racket",
    x: -25,
    y: 16,
    width: "clamp(13rem,25.5vw,23rem)",
  },
  {
    image: "/feed-your-eyes-3.png",
    alt: "A coach standing with two junior tennis players",
    x: 0,
    y: -19,
    width: "clamp(11rem,21.3vw,19rem)",
  },
  {
    image: "/feed-your-eyes-4.png",
    alt: "A young player wearing a headscarf and holding a racket",
    x: 25,
    y: 16,
    width: "clamp(13rem,25.5vw,23rem)",
  },
  {
    image: "/feed-your-eyes-5.png",
    alt: "A junior player walking across a clay court",
    x: 43,
    y: 76,
    width: "clamp(9rem,15.5vw,14rem)",
  },
] as const;

const defaultNews: MediaStory[] = [
  {
    title: "Atilola, Zara, others shine at Tennista Foundation Junior Tennis' tourney",
    image: "/2025-tournament-1.jpg",
    href: "/media/tennis-news/atilola-zara-others-shine-at-tennista-foundation-junior-tennis-tourney",
  },
  {
    title: "Tennista offer junior tennis tournament winners, runner-ups scholarship",
    image: "/2026-tournament-3.jpg",
    href: "/media/tennis-news/tennista-offer-junior-tennis-tournament-winners-runner-ups-scholarship",
  },
  {
    title: "55 kids serve off maiden Tennista Junior Tennis Open",
    image: "/junior-tennis-open-cover.jpg",
    href: "/media/tennis-news/55-kids-serve-off-maiden-tennista-junior-tennis-open",
  },
  { title: "Tennista Foundation to exhibit at 2025 Olney Community Day", image: "/2025-tournament-2.jpg", href: "/media/tennis-news" },
  { title: "Tennista boosts tennis development at Igbobi College", image: "/2025-tournament-3.jpg", href: "/media/tennis-news" },
  { title: "Djokovic vs Brooksby: Match insights with Watson", image: "/2026-tournament-1.jpg", href: "/media/tennis-news" },
  { title: "Dreaming big: 8 unforgettable 2021 US Open breakthroughs", image: "/2027-tournament-1.jpg", href: "/media/tennis-news" },
  { title: "Emma Raducanu leads British invasion at the 2021 US Open", image: "/2027-tournament02.jpg", href: "/media/tennis-news" },
];

const photos = [
  "Forehand on a clay court",
  "Guest in the stands",
  "Spectator in a blue cap",
  "Supporters at a table",
  "Player behind the net",
  "Rally on court",
  "Player watching a point",
  "Close-up in the stands",
] as const;

const videos = ["Clinic session", "Match point", "Award moment", "Court warm-up", "Group drill", "Closing rally"] as const;

export function MediaHub({
  initialTab = "news",
  newsItems = defaultNews,
  eventItems = [],
  photoFeed,
  videoItems = [],
}: {
  initialTab?: TabId;
  newsItems?: MediaStory[];
  eventItems?: MediaStory[];
  photoFeed?: PhotoFeed;
  videoItems?: MediaStory[];
}) {
  const reduced = useReducedMotion();
  const stageRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ["start start", "end end"],
  });
  const folded = useTransform(scrollYProgress, [0, 0.72, 1], [0, 1, 1]);
  const followed = useSpring(folded, { stiffness: 55, damping: 22, mass: 0.8, restDelta: 0.0005 });
  const heldOpen = useMotionValue(1);
  const spread = reduced ? heldOpen : followed;
  const compactOpacity = useTransform(spread, [0, 0.16, 0.42], [1, 1, 0]);
  const compactScale = useTransform(spread, [0, 0.42], [1, 0.82]);
  const stageHeight = useTransform(spread, [0, 1], ["28rem", "34rem"]);

  const [tab, setTab] = useState<TabId>(initialTab);
  const [query, setQuery] = useState("");

  const term = query.trim().toLowerCase();
  const searchableItems =
    tab === "events"
      ? eventItems
      : tab === "videos"
        ? videoItems
        : newsItems;
  const stories = searchableItems.filter((item) => item.title.toLowerCase().includes(term));

  return (
    <>
      <section ref={stageRef} className={reduced ? "bg-white" : "relative bg-white md:h-[150vh]"}>
        <div
          className={cn(
            "overflow-x-hidden bg-white px-5 pt-8 pb-6 sm:px-8 lg:px-12",
            !reduced && "md:sticky md:top-[5.25rem]",
          )}
        >
          <div className="relative h-[10rem] w-full md:hidden">
            <div className="absolute top-1/2 left-1/2 h-[4.25rem] w-[6.5rem] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[0.8rem]">
              <img src="/feed-your-eyes-2.png" alt="A young player reaching forward with a tennis racket" className="absolute top-1/2 left-1/2 h-[165%] w-[165%] max-w-none -translate-x-1/2 -translate-y-1/2 object-cover" />
            </div>
          </div>

          <motion.div className="relative hidden w-full md:block" style={{ height: stageHeight }}>
            <motion.div
              aria-hidden
              className="absolute top-1/2 left-1/2 h-[4.25rem] w-[6.5rem] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[0.8rem]"
              style={{ opacity: compactOpacity, scale: compactScale }}
            >
              <img
                src="/feed-your-eyes-2.png"
                alt=""
                className="absolute top-1/2 left-1/2 h-[165%] w-[165%] max-w-none -translate-x-1/2 -translate-y-1/2 object-cover"
              />
            </motion.div>
            {shots.map((shot) => (
              <CollageShot key={shot.image} shot={shot} spread={spread} />
            ))}
          </motion.div>

          <h1 className="headline mt-2 text-center text-h2">
            <span className="text-blue">Feed your </span>
            <span className="text-blue-bright">eyes</span>
          </h1>

          <div className="mt-8 flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <label className="relative block w-[17.5rem] shrink-0">
              <span className="sr-only">Search</span>
              <svg viewBox="0 0 24 24" className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-black" fill="none" aria-hidden>
                <circle cx="11" cy="11" r="6.25" stroke="currentColor" strokeWidth="2.2" />
                <path d="M16 16.5L20 20.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search"
                className="h-12 w-full rounded-full border-[2.5px] border-black bg-white pr-5 pl-11 text-sm text-blue outline-none placeholder:text-black/50"
              />
            </label>
            <div className="flex flex-wrap gap-2 sm:justify-end" role="tablist" aria-label="Media">
              {tabs.map((item) => {
                const selected = tab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setTab(item.id)}
                    className={cn(
                      "rounded-full px-4 py-2 text-sm font-bold",
                      selected ? "bg-blue text-white" : "border-2 border-blue bg-white text-blue",
                    )}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 pt-4 pb-16 sm:px-8 lg:px-12">
        {tab === "photos" ? (
          <PhotoInfiniteGrid key={term} query={query.trim()} initialFeed={photoFeed} />
        ) : (
          <GalleryPane key={`${tab}:${term}`} tab={tab} stories={stories} />
        )}
      </section>
    </>
  );
}

function PhotoInfiniteGrid({
  query,
  initialFeed,
}: {
  query: string;
  initialFeed?: PhotoFeed;
}) {
  const blankQuery = query === "";
  const [items, setItems] = useState<PhotoFeedItem[]>(() => (blankQuery ? initialFeed?.items ?? [] : []));
  const [nextOffset, setNextOffset] = useState<number | null>(() =>
    blankQuery ? (initialFeed?.nextOffset ?? null) : null,
  );
  const [total, setTotal] = useState(() => (blankQuery ? initialFeed?.total ?? 0 : 0));
  const [loading, setLoading] = useState(!blankQuery);
  const [error, setError] = useState("");
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    if (blankQuery && initialFeed) {
      setItems(initialFeed.items);
      setNextOffset(initialFeed.nextOffset);
      setTotal(initialFeed.total);
      setLoading(false);
      setError("");
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    async function loadFirstPage() {
      setLoading(true);
      setError("");
      setItems([]);
      setNextOffset(null);
      try {
        const params = new URLSearchParams({ offset: "0", limit: "16" });
        if (query) params.set("q", query);
        const response = await fetch(`/api/photos?${params}`, { signal: controller.signal });
        if (!response.ok) throw new Error("Unable to load photos.");
        const page = (await response.json()) as PhotoFeed;
        if (cancelled) return;
        setItems(page.items);
        setNextOffset(page.nextOffset);
        setTotal(page.total);
      } catch (loadError) {
        if (cancelled || controller.signal.aborted) return;
        setError(loadError instanceof Error ? loadError.message : "Unable to load photos.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadFirstPage();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [blankQuery, initialFeed, query]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || nextOffset == null) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting) || loadingRef.current || nextOffset == null) {
          return;
        }
        loadingRef.current = true;
        setLoading(true);
        setError("");
        const params = new URLSearchParams({ offset: String(nextOffset), limit: "16" });
        if (query) params.set("q", query);
        fetch(`/api/photos?${params}`)
          .then(async (response) => {
            if (!response.ok) throw new Error("Unable to load more photos.");
            return (await response.json()) as PhotoFeed;
          })
          .then((page) => {
            setItems((current) => {
              const seen = new Set(current.map((item) => item.id));
              return [...current, ...page.items.filter((item) => !seen.has(item.id))];
            });
            setNextOffset(page.nextOffset);
            setTotal(page.total);
          })
          .catch((loadError) => {
            setError(loadError instanceof Error ? loadError.message : "Unable to load more photos.");
          })
          .finally(() => {
            loadingRef.current = false;
            setLoading(false);
          });
      },
      { rootMargin: "800px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [nextOffset, query]);

  if (!items.length && loading) return <GalleryLoader tab="photos" />;

  if (!items.length) {
    return (
      <p className="mx-auto w-full py-16 text-center text-blue">
        {error || (query ? "Nothing matches that search." : "Photos coming soon.")}
      </p>
    );
  }

  return (
    <div>
      <FadeGrid className="mx-auto grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map((photo) => (
          <GalleryPhoto key={photo.id} photo={photo} />
        ))}
      </FadeGrid>
      <div ref={sentinelRef} className="h-10 w-full" aria-hidden />
      <p className="mt-4 text-center text-sm text-blue/55" aria-live="polite">
        {loading
          ? "Loading more photos…"
          : nextOffset == null
            ? `${total} photos`
            : `Showing ${items.length} of ${total}`}
      </p>
      {error ? <p className="mt-2 text-center text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

function GalleryPhoto({ photo }: { photo: PhotoFeedItem }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <figure className="relative aspect-square overflow-hidden rounded-[1rem] bg-blue-tint">
      {!loaded && !failed ? (
        <div className="absolute inset-0 grid place-items-center" aria-hidden>
          <span className="size-8 animate-pulse rounded-full border-2 border-blue/20 border-t-blue" />
          <span className="sr-only">Loading photo</span>
        </div>
      ) : null}
      {failed ? (
        <div className="absolute inset-0 grid place-items-center px-3 text-center text-xs font-semibold text-blue/45">
          Photo unavailable
        </div>
      ) : (
        <img
          src={photo.image}
          alt={photo.title}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cn(
            "h-full w-full object-cover transition-opacity duration-300",
            loaded ? "opacity-100" : "opacity-0",
          )}
        />
      )}
    </figure>
  );
}

function GalleryPane({ tab, stories }: { tab: TabId; stories: readonly MediaStory[] }) {
  const reduced = useReducedMotion();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), reduced ? 0 : 700);
    return () => window.clearTimeout(timer);
  }, [reduced]);

  if (!ready) return <GalleryLoader tab={tab} />;

  if (tab === "news" && stories.length === 0) {
    return <p className="mx-auto w-full py-16 text-center text-blue">Nothing matches that search.</p>;
  }

  if (tab === "events") {
    if (stories.length === 0) {
      return <p className="mx-auto w-full py-16 text-center text-blue">Nothing matches that search.</p>;
    }
    return (
      <FadeGrid className="grid w-full">
        {stories.map((story) => (
          <article key={story.title} className="rounded-[1.25rem] bg-blue-tint p-4">
            <Link href={story.href} className="group block">
              <img src={story.image} alt="" className="aspect-[16/10] w-full rounded-[1rem] object-cover transition group-hover:scale-[1.01]" />
              <h2 className="mt-4 text-sm leading-snug font-bold tracking-wide text-blue uppercase">{story.title}</h2>
            </Link>
            <p className="mt-4 border-t border-blue/15 pt-3 text-sm text-ink-muted">{story.date ?? "Date to be announced"}</p>
          </article>
        ))}
      </FadeGrid>
    );
  }

  if (tab === "photos") {
    return (
      <FadeGrid className="mx-auto grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
        {photos.map((label) => (
          <MediaPlaceholder key={label} label={label} className="aspect-square w-full rounded-[1rem]" />
        ))}
      </FadeGrid>
    );
  }

  if (tab === "videos") {
    if (stories.length) {
      return (
        <FadeGrid className="mx-auto grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((video) => (
            <a key={video.href} href={video.href} target="_blank" rel="noreferrer noopener" className="group relative block">
              <img src={video.image} alt="" className="aspect-video w-full rounded-[1rem] bg-blue-tint object-cover" />
              <span className="absolute top-1/2 left-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-blue transition group-hover:scale-110">
                <svg viewBox="0 0 24 24" className="ml-0.5 size-5" fill="currentColor" aria-hidden><path d="M8 6.5v11l9-5.5-9-5.5z" /></svg>
                <span className="sr-only">Play {video.title}</span>
              </span>
              <h2 className="mt-3 font-bold text-blue">{video.title}</h2>
            </a>
          ))}
        </FadeGrid>
      );
    }
    return (
      <FadeGrid className="mx-auto grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((label) => (
          <div key={label} className="relative">
            <MediaPlaceholder label={label} className="aspect-video w-full rounded-[1rem]" />
            <span className="absolute top-1/2 left-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-blue">
              <svg viewBox="0 0 24 24" className="ml-0.5 size-5" fill="currentColor" aria-hidden>
                <path d="M8 6.5v11l9-5.5-9-5.5z" />
              </svg>
              <span className="sr-only">Play {label}</span>
            </span>
          </div>
        ))}
      </FadeGrid>
    );
  }

  return (
    <FadeGrid className="mx-auto grid w-full gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {stories.map((story) => (
        <article key={story.title} className="rounded-[1.25rem] bg-[#f7f6dc] p-3">
          <Link href={story.href} className="group block">
            <img src={story.image} alt="" className="aspect-[4/3] w-full rounded-[1rem] object-cover transition-transform duration-300 group-hover:scale-[1.01]" />
            <h2 className="mt-4 px-2 text-sm leading-snug font-bold tracking-wide text-blue uppercase">{story.title}</h2>
          </Link>
          <div className="mx-2 mt-4 flex items-center justify-between border-t border-blue/15 pt-3 text-sm text-ink-muted">
            <span>tennismaster</span>
            <span>0 Comments</span>
          </div>
        </article>
      ))}
    </FadeGrid>
  );
}

function FadeGrid({ className, children }: { className: string; children: ReactNode }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: ease.out }}
    >
      {children}
    </motion.div>
  );
}

function GalleryLoader({ tab }: { tab: TabId }) {
  const photo = tab === "photos";
  const count = photo ? 8 : tab === "videos" ? 6 : 6;
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className={cn(
        "mx-auto grid w-full gap-4",
        photo ? "grid-cols-2 sm:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3",
      )}
    >
      <span className="sr-only">Loading {tab}</span>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="rounded-[1.25rem] bg-[#f7f6dc] p-3">
          <div className={cn("animate-pulse rounded-[1rem] bg-blue/10", photo ? "aspect-square" : "aspect-[4/3]")} />
          {photo ? null : (
            <>
              <div className="mt-4 h-3 w-4/5 animate-pulse rounded-full bg-blue/10" />
              <div className="mt-2 h-3 w-3/5 animate-pulse rounded-full bg-blue/10" />
            </>
          )}
        </div>
      ))}
    </div>
  );
}

function CollageShot({
  shot,
  spread,
}: {
  shot: (typeof shots)[number];
  spread: MotionValue<number>;
}) {
  const x = useTransform(spread, (value) => `${value * shot.x}vw`);
  const y = useTransform(spread, (value) => value * shot.y);
  const opacity = useTransform(spread, [0.12, 0.5], [0, 1]);
  const scale = useTransform(spread, [0, 1], [0.72, 1]);

  return (
    <motion.div
      className="absolute top-1/2 left-1/2 hidden md:block"
      style={{
        x,
        y,
        opacity,
        scale,
        width: shot.width,
        translateX: "-50%",
        translateY: "-50%",
        willChange: "transform, opacity",
      }}
    >
      <img src={shot.image} alt={shot.alt} className="block h-auto w-full" />
    </motion.div>
  );
}
