"use client";

import Link from "next/link";
import { FileText, Briefcase, Users, MessageSquare, BarChart2, TrendingUp, ExternalLink } from "lucide-react";

function StatCard({ icon: Icon, label, value, sub, href, color = "bg-white" }) {
  const inner = (
    <div className={`${color} border border-slate-200 hover:border-amber-400 transition-colors p-5 flex flex-col gap-2`}>
      <div className="flex items-center justify-between">
        <div className="p-2 bg-slate-100 border border-slate-200">
          <Icon size={16} className="text-slate-600" />
        </div>
        {href && <ExternalLink size={12} className="text-slate-400" />}
      </div>
      <div>
        <p className="text-3xl font-bold text-slate-900 font-mono">{value}</p>
        <p className="font-mono text-[10px] uppercase text-slate-500 tracking-wider mt-0.5">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
  return href ? <Link href={href} className="block">{inner}</Link> : inner;
}

function PostTypeStat({ type, count, color, label }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-2">
        <span className={`font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 ${color}`}>{label}</span>
      </div>
      <span className="font-mono text-sm font-semibold text-slate-800">{count}</span>
    </div>
  );
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

export default function MarketingTab({ posts = [], jobs = [], leads = [], quotes = [], messages = [] }) {
  const publishedPosts = posts.filter((p) => p.status === "published");
  const draftPosts = posts.filter((p) => p.status === "draft");
  const activeJobs = jobs.filter((j) => j.status === "active");

  // Quote funnel
  const quoteStatuses = ["pending", "reviewed", "quoted", "accepted", "rejected"];
  const quoteCounts = quoteStatuses.reduce((acc, s) => {
    acc[s] = quotes.filter((q) => q.status === s).length;
    return acc;
  }, {});
  const acceptanceRate = quotes.length > 0
    ? Math.round((quoteCounts.accepted / quotes.length) * 100)
    : 0;

  // Post counts by type
  const postTypeBreakdown = Object.keys(TYPE_LABELS).map((type) => ({
    type,
    count: publishedPosts.filter((p) => p.type === type).length,
  }));

  // Leads by week (last 4 weeks)
  const now = new Date();
  const weekLeads = [0, 1, 2, 3].map((w) => {
    const start = new Date(now);
    start.setDate(start.getDate() - (w + 1) * 7);
    const end = new Date(now);
    end.setDate(end.getDate() - w * 7);
    return {
      label: w === 0 ? "This week" : `${w}w ago`,
      count: leads.filter((l) => {
        const d = new Date(l.created_at);
        return d >= start && d < end;
      }).length,
    };
  });

  return (
    <div className="space-y-8">
      {/* Overview KPIs */}
      <div>
        <h3 className="font-semibold text-slate-900 mb-4">Overview</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard icon={FileText} label="Published Posts" value={publishedPosts.length} sub={`${draftPosts.length} drafts`} />
          <StatCard icon={Briefcase} label="Active Jobs" value={activeJobs.length} sub={`${jobs.length} total listings`} />
          <StatCard icon={Users} label="Total Leads" value={leads.length} sub={`captured email / phone`} />
          <StatCard icon={MessageSquare} label="Messages" value={messages.length} sub="contact form submissions" />
        </div>
      </div>

      {/* Content breakdown + Quote funnel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Content breakdown */}
        <div className="border border-slate-200 bg-slate-50">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
            <BarChart2 size={14} className="text-slate-500" />
            <span className="font-mono text-[11px] uppercase text-slate-600 tracking-wider">Content by Type</span>
          </div>
          <div className="divide-y divide-slate-100">
            {postTypeBreakdown.map((t) => (
              <PostTypeStat key={t.type} type={t.type} count={t.count} label={TYPE_LABELS[t.type]} color={TYPE_COLORS[t.type]} />
            ))}
            {postTypeBreakdown.every((t) => t.count === 0) && (
              <p className="text-slate-400 font-mono text-xs text-center py-6">No published posts yet.</p>
            )}
          </div>
        </div>

        {/* Quote funnel */}
        <div className="border border-slate-200 bg-slate-50">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
            <TrendingUp size={14} className="text-slate-500" />
            <span className="font-mono text-[11px] uppercase text-slate-600 tracking-wider">Quote Funnel</span>
          </div>
          <div className="divide-y divide-slate-100">
            {quoteStatuses.map((s) => (
              <div key={s} className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${s === "pending" ? "bg-amber-400" : s === "reviewed" ? "bg-blue-400" : s === "quoted" ? "bg-purple-400" : s === "accepted" ? "bg-emerald-500" : "bg-red-400"}`} />
                  <span className="font-mono text-xs capitalize text-slate-600">{s}</span>
                </div>
                <span className="font-mono text-sm font-semibold text-slate-800">{quoteCounts[s]}</span>
              </div>
            ))}
            <div className="px-3 py-2 flex items-center justify-between border-t-2 border-slate-200">
              <span className="font-mono text-[11px] uppercase text-slate-500">Acceptance Rate</span>
              <span className={`font-mono text-sm font-bold ${acceptanceRate >= 20 ? "text-emerald-600" : acceptanceRate > 0 ? "text-amber-600" : "text-slate-400"}`}>
                {acceptanceRate}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Lead activity (last 4 weeks) */}
      <div className="border border-slate-200 bg-slate-50">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
          <Users size={14} className="text-slate-500" />
          <span className="font-mono text-[11px] uppercase text-slate-600 tracking-wider">Lead Capture — Last 4 Weeks</span>
        </div>
        {leads.some((l) => l.created_at) ? (
          <div className="px-4 py-4 grid grid-cols-4 gap-3">
            {weekLeads.map((w) => {
              const pct = leads.length > 0 ? Math.round((w.count / Math.max(...weekLeads.map((x) => x.count), 1)) * 100) : 0;
              return (
                <div key={w.label} className="text-center">
                  <div className="flex items-end justify-center h-16 mb-2">
                    <div style={{ height: `${Math.max(pct, 4)}%` }} className="w-8 bg-amber-400 transition-all" />
                  </div>
                  <p className="font-mono text-xs font-bold text-slate-800">{w.count}</p>
                  <p className="font-mono text-[9px] text-slate-400">{w.label}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-slate-400 font-mono text-xs text-center py-8">Lead timestamps not available.</p>
        )}
      </div>

      {/* Quick links */}
      <div className="border border-slate-200 bg-slate-50 px-4 py-4">
        <p className="font-mono text-[10px] uppercase text-slate-500 mb-3 tracking-wider">Quick Links</p>
        <div className="flex flex-wrap gap-3">
          {[{ href: "/blog", label: "View Blog" }, { href: "/career", label: "View Careers" }, { href: "/customers", label: "View Customers" }, { href: "/partners", label: "View Partners" }].map((l) => (
            <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 border border-slate-300 text-slate-600 font-mono text-xs px-3 py-1.5 hover:border-amber-500 hover:text-amber-600 transition-colors">
              {l.label} <ExternalLink size={10} />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
