"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGetBlog, useArchiveBlog, useDeleteBlog } from "@/queries/blogs.queries";
import { getFullImageUrl, IMAGE_BASE_URL } from "@/lib/file-upload";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

/**
 * Restore full CDN URLs in stored HTML content (which has only keys in img src)
 */
function hydrateContentForDisplay(html: string): string {
  if (!html) return html;
  const base = IMAGE_BASE_URL.endsWith("/") ? IMAGE_BASE_URL.slice(0, -1) : IMAGE_BASE_URL;
  return html.replace(/src="(?!https?:\/\/)([^"]+)"/g, `src="${base}/$1"`);
}

export default function BlogViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: blog, isLoading } = useGetBlog(id);
  const archiveMutation = useArchiveBlog();
  const deleteMutation = useDeleteBlog();

  const handleArchive = async () => {
    if (!confirm("Archive this post?")) return;
    try {
      await archiveMutation.mutateAsync(id);
      toast.success("Post archived");
      router.push("/dashboard/blog");
    } catch {
      toast.error("Failed to archive");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Permanently delete this post? This cannot be undone.")) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Post deleted");
      router.push("/dashboard/blog");
    } catch {
      toast.error("Failed to delete");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-zinc-100 rounded w-3/4" />
        <div className="h-4 bg-zinc-100 rounded w-1/3" />
        <div className="h-64 bg-zinc-100 rounded" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-zinc-500">Post not found.</p>
        <Link href="/dashboard/blog">
          <Button variant="outline" size="sm">← Back to Blog</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-16">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-zinc-200 -mx-6 px-6 py-3 mb-8">
        <button
          type="button"
          onClick={() => router.push("/dashboard/blog")}
          className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to Blog
        </button>

        <div className="flex items-center gap-2">
          <Badge
            className={
              blog.status === "published"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-zinc-100 text-zinc-500 border-zinc-200"
            }
          >
            {blog.status === "published" ? "Published" : "Draft"}
          </Badge>
          <Link href={`/dashboard/blog/${id}/edit`}>
            <Button size="sm" className="bg-black text-white hover:bg-zinc-800">
              Edit Post
            </Button>
          </Link>
          <Button
            size="sm"
            variant="outline"
            onClick={handleArchive}
            disabled={archiveMutation.isPending}
          >
            Archive
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Cover Image */}
      {blog.coverImage && (
        <div className="mb-8 rounded-xl overflow-hidden border border-zinc-200 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getFullImageUrl(blog.coverImage ?? "")}
            alt={blog.title}
            className="w-full max-h-72 object-cover"
          />
        </div>
      )}

      {/* Post metadata */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 mb-6">
        {blog.author && (
          <span className="flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
            {blog.author}
          </span>
        )}
        {blog.publishedAt && (
          <span className="flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {new Date(blog.publishedAt).toLocaleDateString("en-US", {
              year: "numeric", month: "long", day: "numeric",
            })}
          </span>
        )}
        {blog.slug && (
          <span className="font-mono text-[10px] bg-zinc-100 px-2 py-0.5 rounded">
            /{blog.slug}
          </span>
        )}
        {blog.categories && blog.categories.length > 0 && (
          <span className="text-zinc-500">{blog.categories.join(", ")}</span>
        )}
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-zinc-900 leading-tight mb-4">{blog.title}</h1>

      {/* Excerpt */}
      {blog.excerpt && (
        <p className="text-base text-zinc-500 italic border-l-2 border-zinc-200 pl-4 mb-8">
          {blog.excerpt}
        </p>
      )}

      {/* Tags */}
      {blog.tags && blog.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-8">
          {blog.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-zinc-100 text-zinc-600 px-2.5 py-1 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Rich content */}
      {blog.content ? (
        <div
          className="prose prose-zinc max-w-none"
          dangerouslySetInnerHTML={{ __html: hydrateContentForDisplay(blog.content) }}
        />
      ) : (
        <div className="text-zinc-400 text-sm italic py-12 text-center border border-dashed border-zinc-200 rounded-xl">
          No content yet.
        </div>
      )}

      {/* SEO summary panel */}
      {blog.seo && (
        <div className="mt-12 border border-zinc-200 rounded-xl overflow-hidden">
          <div className="bg-zinc-50 px-5 py-3 border-b border-zinc-200">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">SEO Summary</p>
          </div>
          <div className="p-5 space-y-2 text-sm">
            {blog.seo.metaTitle && (
              <div className="flex gap-3">
                <span className="text-zinc-400 w-32 shrink-0">Meta Title</span>
                <span className="text-zinc-700">{blog.seo.metaTitle}</span>
              </div>
            )}
            {blog.seo.metaDescription && (
              <div className="flex gap-3">
                <span className="text-zinc-400 w-32 shrink-0">Meta Desc</span>
                <span className="text-zinc-700">{blog.seo.metaDescription}</span>
              </div>
            )}
            {blog.seo.focusKeyword && (
              <div className="flex gap-3">
                <span className="text-zinc-400 w-32 shrink-0">Focus KW</span>
                <span className="text-zinc-700">{blog.seo.focusKeyword}</span>
              </div>
            )}
            {blog.seo.keywords && blog.seo.keywords.length > 0 && (
              <div className="flex gap-3">
                <span className="text-zinc-400 w-32 shrink-0">Keywords</span>
                <span className="text-zinc-700">{blog.seo.keywords.join(", ")}</span>
              </div>
            )}
            {blog.seo.canonicalUrl && (
              <div className="flex gap-3">
                <span className="text-zinc-400 w-32 shrink-0">Canonical</span>
                <a href={blog.seo.canonicalUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline truncate">{blog.seo.canonicalUrl}</a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
