import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState, PageHeader } from "@/components/ui/misc";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatDateTimeWAT } from "@/lib/time";
import { getPublishedEvents, getPublishedNews } from "@/server/public-data";

export const metadata: Metadata = {
  title: "News and events",
  description: "Announcements, events and updates from NSD Business Academy.",
  alternates: { canonical: "/news" },
};

const KIND_LABEL = { ANNOUNCEMENT: "Announcement", UPDATE: "Update", GUIDE: "Guide" } as const;

export default async function NewsPage() {
  const [news, events] = await Promise.all([getPublishedNews(), getPublishedEvents()]);

  return (
    <>
      <PageHeader title="News and events" intro="Announcements from the academy, upcoming events and practical guides." />
      <div className="container-page grid gap-12 py-12 lg:grid-cols-[1.5fr_1fr] lg:py-16">
        <section aria-labelledby="news-heading">
          <h2 id="news-heading" className="text-[1.5rem] font-bold tracking-[-0.02em]">
            News
          </h2>
          {news.length ? (
            <ul className="mt-6 divide-y divide-line border-y border-line">
              {news.map((n) => (
                <li key={n.slug} className="py-6">
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
                    <Badge tone="muted">{KIND_LABEL[n.kind]}</Badge>
                    {n.publishedAt && <time dateTime={n.publishedAt.toISOString()}>{formatDate(n.publishedAt)}</time>}
                  </div>
                  <h3 className="mt-2 text-xl font-semibold">
                    <Link href={`/news/${n.slug}`} className="hover:underline hover:decoration-gold-500 hover:underline-offset-4">
                      {n.title}
                    </Link>
                  </h3>
                  {n.summary && <p className="mt-1 text-muted">{n.summary}</p>}
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-6">
              <EmptyState title="No announcements yet">
                <p>News from the academy will appear here.</p>
              </EmptyState>
            </div>
          )}
        </section>

        <section aria-labelledby="events-heading">
          <h2 id="events-heading" className="text-[1.5rem] font-bold tracking-[-0.02em]">
            Events
          </h2>
          {events.length ? (
            <ul className="mt-6 space-y-4">
              {events.map((e) => (
                <li key={e.slug} className="rounded-[var(--radius-lg)] border border-line p-5">
                  <p className="text-sm font-medium text-emerald-700">{formatDateTimeWAT(e.startsAt)}</p>
                  <h3 className="mt-1 text-lg font-semibold">{e.title}</h3>
                  {e.location && <p className="text-[0.9375rem] text-muted">{e.location}</p>}
                  {e.description && <p className="mt-2 text-[0.9375rem]">{e.description}</p>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-6 text-muted">No events are scheduled at the moment.</p>
          )}
        </section>
      </div>
    </>
  );
}
