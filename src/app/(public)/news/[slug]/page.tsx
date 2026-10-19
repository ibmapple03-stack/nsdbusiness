import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/ui/misc";
import { RichText } from "@/components/ui/rich-text";
import { formatDate } from "@/lib/time";
import { getPublishedNews } from "@/server/public-data";

async function findPost(slug: string) {
  return (await getPublishedNews()).find((n) => n.slug === slug) ?? null;
}

// Blocks on purpose: unknown or unpublished slugs must return a real HTTP 404.
export const instant = false;

export async function generateStaticParams() {
  const news = await getPublishedNews();
  return news.length ? news.map((n) => ({ slug: n.slug })) : [{ slug: "__none" }];
}

export async function generateMetadata(props: PageProps<"/news/[slug]">): Promise<Metadata> {
  const post = await findPost((await props.params).slug);
  if (!post) return { title: "Not found", robots: { index: false } };
  return { title: post.title, description: post.summary || undefined, alternates: { canonical: `/news/${post.slug}` } };
}

export default async function NewsPostPage(props: PageProps<"/news/[slug]">) {
  const post = await findPost((await props.params).slug);
  if (!post) notFound();
  return (
    <article className="container-page py-10 lg:py-14">
      <Breadcrumb items={[{ href: "/news", label: "News and events" }, { label: post.title }]} />
      <h1 className="mt-6 max-w-3xl text-[clamp(2rem,4.5vw,2.75rem)] font-bold tracking-[-0.03em]">{post.title}</h1>
      {post.publishedAt && (
        <p className="mt-3 text-muted">
          <time dateTime={post.publishedAt.toISOString()}>{formatDate(post.publishedAt)}</time>
        </p>
      )}
      <RichText text={post.body} className="prose-academy mt-8 text-[1.0625rem]" />
    </article>
  );
}
