import Link from "next/link";
import { BlogSection } from "@/components/sections/blog-section";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { NewsReplyForm } from "@/components/sections/news-reply-form";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import type { ArticleDocument } from "@/lib/cms-content";

export const newsPosts = [
  {
    slug: "atilola-zara-others-shine-at-tennista-foundation-junior-tennis-tourney",
    title: "Atilola, Zara, others shine at Tennista Foundation Junior Tennis’ tourney",
    date: "April 21, 2026",
    hero: "/2025-tournament-1.jpg",
    cardImage: "/2025-tournament-1.jpg",
  },
  {
    slug: "tennista-offer-junior-tennis-tournament-winners-runner-ups-scholarship",
    title: "Tennista offer junior tennis tournament winners, runner-ups scholarship",
    date: "April 21, 2026",
    hero: "/2026-tournament-3.jpg",
    cardImage: "/2026-tournament-3.jpg",
  },
  {
    slug: "55-kids-serve-off-maiden-tennista-junior-tennis-open",
    title: "55 kids serve off maiden Tennista Junior Tennis Open",
    date: "April 21, 2026",
    hero: "/junior-tennis-open-cover.jpg",
    cardImage: "/junior-tennis-open-cover.jpg",
  },
] as const;

export type NewsPost = {
  slug: string;
  title: string;
  date: string;
  hero: string;
  cardImage: string;
  content?: ArticleDocument;
  assetUrls?: Record<string, string>;
};

function PersonIcon() {
  return (
    <span className="grid size-5 place-items-center rounded-full border border-current">
      <svg viewBox="0 0 24 24" className="size-3" fill="currentColor" aria-hidden>
        <circle cx="12" cy="8" r="3.2" />
        <path d="M5 19.2c.8-3.2 3.4-4.8 7-4.8s6.2 1.6 7 4.8" />
      </svg>
    </span>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden>
      <path d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12z" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="2.4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function ArticleNewsletter() {
  return (
    <aside className="rounded-[1.25rem] bg-blue-tint px-6 py-8 sm:px-8">
      <h2 className="headline text-[2rem] leading-[0.82] text-blue">
        Subscribe to
        <br />
        our newsletter
      </h2>
      <p className="mt-5 text-[0.925rem] leading-relaxed text-blue">
        We&apos;d love to keep you posted on new programs, the kids we&apos;re working with, and how you can be part of
        it.
      </p>
      <div className="mt-7">
        <NewsletterForm />
      </div>
    </aside>
  );
}

function PostNavigation({ post, posts }: { post: NewsPost; posts: NewsPost[] }) {
  const index = posts.findIndex((item) => item.slug === post.slug);
  const previous = index > 0 ? posts[index - 1] : undefined;
  const next = index < posts.length - 1 ? posts[index + 1] : undefined;

  return (
    <nav aria-label="Adjacent posts" className="grid grid-cols-2 overflow-hidden rounded-[1.1rem]">
      <div className="bg-blue-tint p-4">
        {previous ? (
          <Link href={`/media/tennis-news/${previous.slug}`} className="block">
            <img src={previous.cardImage} alt="" className="aspect-[4/3] w-full rounded-[0.85rem] object-cover" />
            <span className="mt-3 block headline text-[1rem] leading-[0.95] text-blue">{previous.title}</span>
            <span className="mt-5 inline-flex h-10 items-center rounded-full border-2 border-blue/20 px-5 text-sm font-bold text-blue">
              Previous Post
            </span>
          </Link>
        ) : (
          <span className="flex h-full min-h-[15rem] items-end">
            <span className="inline-flex h-10 items-center rounded-full border-2 border-blue/15 px-5 text-sm font-bold text-blue/30">
              Previous Post
            </span>
          </span>
        )}
      </div>
      <div className="bg-lime-tint p-4">
        {next ? (
          <Link href={`/media/tennis-news/${next.slug}`} className="block">
            <img src={next.cardImage} alt="" className="aspect-[4/3] w-full rounded-[0.85rem] object-cover" />
            <span className="mt-3 block headline text-[1rem] leading-[0.95] text-blue">{next.title}</span>
            <span className="mt-5 inline-flex h-10 items-center rounded-full bg-lime px-5 text-sm font-bold text-blue">
              Next Post
            </span>
          </Link>
        ) : (
          <span className="flex h-full min-h-[15rem] items-end justify-end">
            <span className="inline-flex h-10 items-center rounded-full bg-lime/60 px-5 text-sm font-bold text-blue/50">
              Next Post
            </span>
          </span>
        )}
      </div>
    </nav>
  );
}

function PrimaryArticle() {
  return (
    <>
      <p>
        Atilola Mofifun and Zara Adegoke have emerged as the winners of the U-16 and U-12 categories at the second
        edition of the Tennista Foundation Junior Tennis Tournament.
      </p>
      <p>
        The tournament, played on clay courts at the Lagos Country Club, brought together budding tennis players who
        showcased their talents during the three-day event.
      </p>

      <img src="/2026-tournament-3.jpg" alt="A junior tournament winner receiving a trophy and cheque" className="mt-8 aspect-[16/9] w-full rounded-[1rem] object-cover" />

      <div className="mt-5 grid grid-cols-2 gap-4">
        <img src="/2026-tournament-1.jpg" alt="A junior player returning a ball on a clay court" className="aspect-[4/3] w-full rounded-[0.9rem] object-cover" />
        <img src="/2025-tournament-3.jpg" alt="Junior tournament winners with their trophies" className="aspect-[4/3] w-full rounded-[0.9rem] object-cover" />
      </div>

      <p>
        Speaking after the event, Michael Nwoseh, President of Tennista Foundation, highlighted improvements in this
        year&apos;s tournament, noting increased participation and better infrastructure. He said over 60 players
        featured across male and female categories, with the introduction of the under-12 division providing
        opportunities for younger athletes.
      </p>
      <p className="text-sm">He Said</p>
      <blockquote>Parents and coaches brought their kids from different parts of the country.</blockquote>
      <p>
        He pointed to corporate sponsorship and enhanced court arrangements as signs of rising standards, expressing
        confidence that the competition would continue to expand.
      </p>
      <p className="text-sm">He Said</p>
      <blockquote>
        We&apos;re excited that we have the opportunity to host this second edition, and it&apos;s an all clay affair
        this time around, and the player competed at a very high level.
        <br />
        <br />
        For some of the young tennis champions, this is their first time playing on the clay, and we are happy that
        they were able to get their first exposure to play competitive matches through our foundation events.
        <br />
        <br />
        This is definitely going to continue to help them strengthen their game and their competing ability knowing
        how to play across different surfaces
      </blockquote>
      <p>
        Mofifun, who won the U-16 category, expressed delight at her victory, admitting she focused on enjoying her
        game rather than chasing points. She said winning the trophy, educational prizes, and other rewards made her
        proud, especially after missing out the previous year.
      </p>
      <p>
        The young champion appreciated the organisers for creating a platform that motivates children to compete and
        develop confidence, adding that the rewards, including a new racket, would further encourage her tennis
        journey.
      </p>
      <p>
        Meanwhile, the Director-General of the Lagos State Sports Commission, Lekan Fatodu, represented by Oriyomi
        Oluwasanmi, emphasised the importance of sports in youth development. The winners received prizes, including
        educational grants, brand new tennis rackets, and school bags.
      </p>
    </>
  );
}

function ShortArticle({ post }: { post: NewsPost }) {
  return (
    <>
      <p>{post.title}.</p>
      <img src={post.cardImage} alt="" className="mt-8 aspect-[16/9] w-full rounded-[1rem] object-cover" />
    </>
  );
}

function ManagedArticle({ post }: { post: NewsPost }) {
  if (!post.content) return <ShortArticle post={post} />;

  return post.content.blocks.map((block) => {
    if (block.type === "heading") return <h2 key={block.id} className="headline pt-4 text-2xl leading-tight text-blue">{block.text}</h2>;
    if (block.type === "quote") {
      return (
        <figure key={block.id}>
          <blockquote>{block.text}</blockquote>
          {block.attribution ? <figcaption className="mt-2 text-sm font-bold text-blue">— {block.attribution}</figcaption> : null}
        </figure>
      );
    }
    if (block.type === "image") {
      const imageUrl = post.assetUrls?.[block.assetId];
      return imageUrl ? (
        <figure key={block.id}>
          <img src={imageUrl} alt={block.caption ?? ""} className="mt-8 aspect-[16/9] w-full rounded-[1rem] object-cover" />
          {block.caption ? <figcaption className="mt-2 text-sm text-blue/55">{block.caption}</figcaption> : null}
        </figure>
      ) : null;
    }
    return <p key={block.id}>{block.text}</p>;
  });
}

export function NewsArticle({ post, posts = [...newsPosts] }: { post: NewsPost; posts?: NewsPost[] }) {
  return (
    <>
      <article className="bg-white pb-8">
        <div className="relative">
          <img src={post.hero} alt="" className="h-[20rem] w-full object-cover sm:h-[28rem] lg:h-[36rem]" />
          <svg aria-hidden viewBox="0 0 1440 100" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-16 w-full text-white sm:h-20">
            <path d="M0 55C220 105 400 92 610 58C850 18 1120 22 1440 66V100H0Z" fill="currentColor" />
          </svg>
        </div>

        <Container className="pt-6">
          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.55fr)_minmax(18rem,0.75fr)] lg:gap-12">
            <div>
              <h1 className="headline max-w-[48rem] text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.82] text-blue">{post.title}</h1>
              <div className="mt-7 flex items-center justify-between gap-5 border-t border-blue/35 pt-6 text-sm text-blue">
                <span className="inline-flex items-center gap-2"><PersonIcon />tennismaster</span>
                <time>{post.date}</time>
              </div>
              <div className="article-copy mt-8 space-y-5 text-[1rem] leading-relaxed text-gray [&_blockquote]:border-l-[3px] [&_blockquote]:border-gray [&_blockquote]:py-1 [&_blockquote]:pl-5 [&_blockquote]:text-[1.35rem] [&_blockquote]:leading-snug">
                {post.content ? <ManagedArticle post={post} /> : post.slug === newsPosts[0].slug ? <PrimaryArticle /> : <ShortArticle post={post} />}
              </div>
              <div className="mt-8 flex items-center justify-between gap-5 border-t border-blue/35 pt-6">
                <Button href="/media/tennis-news">See Story Mention</Button>
                <span className="inline-flex items-center gap-2 text-sm text-gray"><EyeIcon />0 Comments</span>
              </div>
            </div>

            <div className="space-y-8 lg:sticky lg:top-[6rem]">
              <ArticleNewsletter />
              <PostNavigation post={post} posts={posts} />
            </div>
          </div>

          <NewsReplyForm articleTitle={post.title} />
        </Container>
      </article>

      <BlogSection />
    </>
  );
}
