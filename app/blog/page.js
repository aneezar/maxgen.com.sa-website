import Link from "next/link";
import { ChevronRight, Calendar, User, Tag } from "lucide-react";
import { getPosts } from "@/lib/db";
import { SITE_URL } from "@/lib/constants";
import { imgixUrl } from "@/lib/imgix";

export const revalidate = 3600;

export const metadata = {
  title: "Blog & Insights | Maxgen",
  description: "Industry insights, project case studies, success stories, and company news from Maxgen — electrical accessories and ELV systems specialists.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Blog & Insights | Maxgen",
    description: "Industry insights, project case studies, success stories, and company news from Maxgen.",
    url: `${SITE_URL}/blog`,
  },
};

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

function PostCard({ post }) {
  const label = TYPE_LABELS[post.type] || post.type;
  const color = TYPE_COLORS[post.type] || TYPE_COLORS.blog;
  const coverImg = post.cover_image ? imgixUrl(post.cover_image, { w: 800, h: 450, q: 80, fit: "crop" }) : null;

  return (
    <Link href={`/blog/${post.slug}`} className="group border border-slate-200 bg-white hover:border-amber-400 hover:shadow-md transition-all flex flex-col">
      <div className="w-full h-48 bg-slate-100 overflow-hidden">
        {coverImg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverImg} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-mono text-[10px] text-slate-400 uppercase">No image</span>
          </div>
        )}
      </div>
      <div className="px-5 py-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className={`font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 ${color}`}>{label}</span>
          {post.published_at && (
            <span className="font-mono text-[10px] text-slate-400 flex items-center gap-1">
              <Calendar size={10} />
              {new Date(post.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          )}
        </div>
        <h2 className="text-slate-900 font-semibold text-[15px] leading-snug mb-2 group-hover:text-amber-700 transition-colors">{post.title}</h2>
        {post.excerpt && <p className="text-slate-500 text-sm leading-relaxed flex-1 line-clamp-3">{post.excerpt}</p>}
        <div className="mt-4 flex items-center justify-between">
          {post.author && (
            <span className="font-mono text-[10px] text-slate-400 flex items-center gap-1">
              <User size={10} /> {post.author}
            </span>
          )}
          <span className="font-mono text-xs text-amber-600 flex items-center gap-1 group-hover:gap-2 transition-all ml-auto">
            Read more <ChevronRight size={12} />
          </span>
        </div>
        {Array.isArray(post.tags) && post.tags.length > 0 && (
          <div className="flex gap-1.5 flex-wrap mt-3 pt-3 border-t border-slate-100">
            {post.tags.slice(0, 3).map((t) => (
              <span key={t} className="font-mono text-[9px] text-slate-400 flex items-center gap-0.5"><Tag size={8} />#{t}</span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

export default async function BlogPage({ searchParams: searchParamsPromise }) {
  const searchParams = await searchParamsPromise;
  const typeFilter = searchParams?.type || "all";

  const allPosts = await getPosts();
  const posts = typeFilter === "all" ? allPosts : allPosts.filter((p) => p.type === typeFilter);

  const typeCounts = Object.keys(TYPE_LABELS).reduce((acc, t) => {
    acc[t] = allPosts.filter((p) => p.type === t).length;
    return acc;
  }, {});

  return (
    <section className="max-w-7xl mx-auto px-5 py-14">
      <div className="mb-10">
        <p className="font-mono text-amber-600 text-xs uppercase tracking-[0.2em] mb-3">Insights</p>
        <h1 className="text-4xl font-bold text-slate-900 font-display mb-4">Blog &amp; Updates</h1>
        <p className="text-slate-500 text-[15px] max-w-2xl">
          Project case studies, technical insights, company news, and success stories from the Maxgen team.
        </p>
      </div>

      {/* Type filter */}
      <div className="flex gap-2 flex-wrap mb-8">
        {[{ id: "all", label: `All (${allPosts.length})` }, ...Object.entries(TYPE_LABELS).map(([id, label]) => ({ id, label: `${label} (${typeCounts[id]})` }))].map((f) => (
          <Link key={f.id} href={f.id === "all" ? "/blog" : `/blog?type=${f.id}`}
            className={`px-3 py-1.5 font-mono text-xs uppercase tracking-wider border transition-colors ${typeFilter === f.id ? "bg-amber-500 text-slate-950 border-amber-500" : "border-slate-300 text-slate-500 hover:border-slate-700"}`}>
            {f.label}
          </Link>
        ))}
      </div>

      {posts.length === 0 ? (
        <div className="border border-slate-200 bg-slate-50 py-24 text-center">
          <p className="font-mono text-slate-400 text-sm uppercase tracking-wider">No posts published yet.</p>
          <p className="text-slate-400 text-xs mt-2">Check back soon — new content is on the way.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((p) => <PostCard key={p.id} post={p} />)}
        </div>
      )}
    </section>
  );
}
