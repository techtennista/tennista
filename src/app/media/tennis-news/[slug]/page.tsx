import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NewsArticle } from "@/components/sections/news-article";
import { getPublishedNewsPosts } from "@/lib/public-news";

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
  };
}

export default async function NewsPostPage({ params }: Props) {
  const { slug } = await params;
  const posts = await getPublishedNewsPosts();
  const post = posts.find((item) => item.slug === slug);

  if (!post) notFound();

  return <NewsArticle post={post} posts={posts} />;
}
