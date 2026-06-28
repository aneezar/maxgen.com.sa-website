import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Calendar, User, Tag, ArrowLeft } from "lucide-react";
import { getPostBySlug, getPosts } from "@/lib/db";
import { SITE_URL } from "@/lib/constants";
import { imgixUrl } from "@/lib/imgix";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params: paramsPromise }) {
  const { slug } = await paramsPromise;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  const ogImage = post.cover_image && !post.cover_image.startsWith("data:")
    ? imgixUrl(post.cover_image, { w: 1200, h: 630, q: 85, fit: "crop" })
    : null;
  return {
    title: post.title,
    description: post.excerpt || `Read ${post.title} on the Maxgen blog.`,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `${SITE_URL}/blog/${post.slug}`,
      type: "article",
      publishedTime: post.published_at,
      authors: [post.author],
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: post.title }] : [],
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.excerpt },
  };
}

const TYPE_LABELS = {
  blog: "Blog",
  news: "News",
  "case-study": "Case Study",
  "success-story": "Success Story",
};

const TYPE_COLORS = {
  blog: "bg-slate-100 text-slate-600",
  news: "bg-blue-100 text-blue-700",
  "case-study": "bg-amber-100 text-amber-800",
  "success-story": "bg-emerald-100 text-emerald-700",
};

function renderBody(body) {
  if (!body) return null;
  const paras = body.split(/\n{2,}/);
  return paras.map((para, i) => {
    const trimmed = para.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith("## ")) {
      return <h2 key={i} className="text-2xl font-bold text-slate-900 font-display mt-8 mb-3">{trimmed.slice(3)}</h2>;
    }
    if (trimmed.startsWith("### ")) {
      return <h3 key={i} className="text-lg font-semibold text-slate-900 mt-6 mb-2">{trimmed.slice(4)}</h3>;
    }
    if (trimmed.startsWith("- ")) {
      const items = trimmed.split("\n").filter((l) => l.startsWith("- ")).map((l) => l.slice(2));
      return <ul key={i} className="list-disc pl-5 space-y-1 my-3 text-slate-600 text-[15px] leading-relaxed">{items.map((it, j) => <li key={j}>{it}</li>)}</ul>;
    }
    return <p key={i} className="text-slate-600 text-[15px] leading-relaxed my-3">{trimmed}</p>;
  });
}

export default async function BlogPostPage({ params: paramsPromise }) {
  const { slug } = await paramsPromise;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const relatedPosts = (await getPosts({ type: post.type, limit: 4 }))
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3);

  const coverImg = post.cover_image ? imgixUrl(post.cover_image, { w: 1600, h: 800, q: 85, fit: "crop" }) : null;
  const typeLabel = TYPE_LABELS[post.type] || post.type;
  const typeColor = TYPE_COLORS[post.type] || TYPE_COLORS.blog;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    author: { "@type": "Organization", name: post.author || "Maxgen" },
    publisher: { "@type": "Organization", name: "Maxgen", logo: { "@type": "ImageObject", url: `${SITE_URL}/logo-icon.png` } },
    datePublished: post.published_at,
    dateModified: post.updated_at,
    url: `${SITE_URL}/blog/${post.slug}`,
    ...(coverImg && { image: coverImg }),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: `${SITE_URL}/blog/${post.slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <article className="max-w-3xl mx-auto px-5 py-14">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500 uppercase tracking-wider mb-8 flex-wrap">
          <Link href="/" className="hover:text-amber-600">Home</Link>
          <ChevronRight size={11} />
          <Link href="/blog" className="hover:text-amber-600">Blog</Link>
          <ChevronRight size={11} />
          <span className="text-slate-700">{typeLabel}</span>
        </nav>

        {/* Type + date */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <span className={`font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 ${typeColor}`}>{typeLabel}</span>
          {post.published_at && (
            <span className="font-mono text-[11px] text-slate-400 flex items-center gap-1.5">
              <Calendar size={11} />
              {new Date(post.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </span>
          )}
          {post.author && (
            <span className="font-mono text-[11px] text-slate-400 flex items-center gap-1.5">
              <User size={11} /> {post.author}
            </span>
          )}
        </div>

        <h1 className="text-4xl font-bold text-slate-900 leading-tight font-display mb-5">{post.title}</h1>

        {post.excerpt && (
          <p className="text-slate-500 text-lg leading-relaxed mb-8 border-l-4 border-amber-400 pl-5">{post.excerpt}</p>
        )}

        {/* Cover image */}
        {coverImg && (
          <div className="w-full h-72 sm:h-96 mb-10 overflow-hidden border border-slate-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverImg} alt={post.title} className="w-full h-full object-cover" loading="eager" />
          </div>
        )}

        {/* Body */}
        <div className="prose-like">
          {renderBody(post.body)}
        </div>

        {/* Tags */}
        {Array.isArray(post.tags) && post.tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mt-10 pt-6 border-t border-slate-200">
            <Tag size={14} className="text-slate-400" />
            {post.tags.map((t) => (
              <span key={t} className="font-mono text-[11px] bg-slate-100 text-slate-600 px-2.5 py-1 border border-slate-200">#{t}</span>
            ))}
          </div>
        )}

        {/* Back link */}
        <Link href="/blog" className="inline-flex items-center gap-2 font-mono text-sm text-amber-600 hover:text-amber-500 mt-10">
          <ArrowLeft size={14} /> Back to Blog
        </Link>
      </article>

      {/* Related posts */}
      {relatedPosts.length > 0 && (
        <div className="border-t border-slate-200 bg-slate-50">
          <div className="max-w-7xl mx-auto px-5 py-14">
            <h2 className="text-xl font-bold text-slate-900 font-display mb-6">More {typeLabel}s</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedPosts.map((p) => (
                <Link key={p.id} href={`/blog/${p.slug}`} className="border border-slate-200 bg-white hover:border-amber-400 hover:shadow-sm transition-all px-5 py-5">
                  <p className="text-slate-900 font-semibold text-sm leading-snug mb-2">{p.title}</p>
                  {p.excerpt && <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">{p.excerpt}</p>}
                  {p.published_at && (
                    <p className="font-mono text-[10px] text-slate-400 mt-3">
                      {new Date(p.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
