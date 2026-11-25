import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NewsArticle } from "@/components/sections/news-article";
import { JsonLd } from "@/components/seo/json-ld";
import { getPublishedNewsPosts } from "@/lib/public-news";
import { breadcrumbSchema, newsArticleSchema } from "@/lib/seo";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const posts = await getPublishedNewsPosts();
  const post = posts.find((item) => item.slug === slug);

  if (!post) return {};

  return {
    title: post.title,
    description: post.title,
    alternates: { canonical: `/media/tennis-news/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      url: `/media/tennis-news/${post.slug}`,
      images: [{ url: post.hero, alt: post.heroAlt ?? post.title }],
      ...(post.publishedAt ? { publishedTime: post.publishedAt } : {}),
    },
  };
}

export default async function NewsPostPage({ params }: Props) {
  const { slug } = await params;
  const posts = await getPublishedNewsPosts();
  const post = posts.find((item) => item.slug === slug);

  if (!post) notFound();

  return (
    <>
      <JsonLd
        schema={[
          newsArticleSchema(post),
          breadcrumbSchema([
            { name: "Home", href: "/" },
            { name: "Media and Events", href: "/media" },
            { name: "Tennis News", href: "/media/tennis-news" },
            { name: post.title, href: `/media/tennis-news/${post.slug}` },
          ]),
        ]}
      />
      <NewsArticle post={post} posts={posts} />
    </>
  );
}
