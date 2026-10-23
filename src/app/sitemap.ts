import type { MetadataRoute } from "next";
import { footerNav, mainNav, isNavGroup, primaryCta } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { getPublishedNewsPosts } from "@/lib/public-news";

export const dynamic = "force-dynamic";

/**
 * Derived from the navigation config, so a new page in the menu is a new entry
 * in the sitemap automatically.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = new Set<string>(["/", primaryCta.href, "/contact"]);

  for (const item of mainNav) {
    routes.add(item.href);
    for (const section of item.menu?.sections ?? []) {
      if (isNavGroup(section)) {
        section.links.forEach((link) => routes.add(link.href));
      } else {
        routes.add(section.href);
      }
    }
  }

  for (const group of footerNav) {
    group.links.forEach((link) => routes.add(link.href));
  }
  const posts = await getPublishedNewsPosts();
  posts.forEach((post) => routes.add(`/media/tennis-news/${post.slug}`));

  const lastModified = new Date();
  const uniqueRoutes = [...new Set([...routes].map((route) => route.split("#")[0] ?? route))];

  return uniqueRoutes.map((route) => ({
    url: `${siteConfig.url}${route === "/" ? "" : route}`,
    lastModified,
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : route === primaryCta.href ? 0.9 : 0.7,
  }));
}
