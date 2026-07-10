"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  useCreateBlog,
  useUpdateBlog,
  useGetBlog,
  CreateBlogPayload,
  BlogSeo,
} from "@/queries/blogs.queries";
import { RichTextEditor } from "@/components/custom/rich-text-editor";
import { ImageUpload } from "@/components/custom/image-upload";
import { getFullImageUrl, getImageKey, IMAGE_BASE_URL } from "@/lib/file-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";

/**
 * Before saving to DB — strip the public CDN base URL from all <img src>
 * so only the key (filename) is stored, not the full URL.
 */
function normalizeContentForStorage(html: string): string {
  if (!html) return html;
  const base = IMAGE_BASE_URL.endsWith("/") ? IMAGE_BASE_URL.slice(0, -1) : IMAGE_BASE_URL;
  // Replace src="https://pub-....r2.dev/key" → src="key"
  return html.replace(new RegExp(`src="${base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/([^"]+)"`, "g"), 'src="$1"');
}

/**
 * Before loading into Tiptap — restore full public CDN URLs on all <img src>
 * that contain only a key (not a full http URL).
 */
function hydrateContentForEditor(html: string): string {
  if (!html) return html;
  const base = IMAGE_BASE_URL.endsWith("/") ? IMAGE_BASE_URL.slice(0, -1) : IMAGE_BASE_URL;
  // Only prefix src values that are NOT already a full URL
  return html.replace(/src="(?!https?:\/\/)([^"]+)"/g, `src="${base}/$1"`);
}

interface BlogEditorProps {
  blogId?: string; // if provided → edit mode
}

type SectionKey = "content" | "cover" | "meta" | "seo";

function Section({
  title,
  id,
  open,
  toggle,
  children,
  badge,
}: {
  title: string;
  id: SectionKey;
  open: boolean;
  toggle: (id: SectionKey) => void;
  children: React.ReactNode;
  badge?: string;
}) {
  return (
    <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white">
      <button
        type="button"
        onClick={() => toggle(id)}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-zinc-50 hover:bg-zinc-100 text-sm font-semibold text-zinc-700 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <span>{title}</span>
          {badge && (
            <span className="text-[10px] font-medium bg-zinc-200 text-zinc-600 px-1.5 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <svg
          className={`h-4 w-4 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && <div className="p-5 space-y-4">{children}</div>}
    </div>
  );
}

function SeoScoreBar({ score }: { score: number }) {
  const color =
    score >= 70 ? "bg-emerald-500" : score >= 40 ? "bg-amber-400" : "bg-red-400";
  const label =
    score >= 70 ? "Good" : score >= 40 ? "Needs Improvement" : "Poor";
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-zinc-600">SEO Score</span>
        <span
          className={`font-semibold ${score >= 70
            ? "text-emerald-600"
            : score >= 40
              ? "text-amber-600"
              : "text-red-500"
            }`}
        >
          {score}/100 · {label}
        </span>
      </div>
      <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

function CharCounter({
  value,
  max,
  label,
}: {
  value: string;
  max: number;
  label: string;
}) {
  const len = value.length;
  const pct = (len / max) * 100;
  const over = len > max;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>{label}</span>
        <span className={over ? "text-red-500 font-semibold" : ""}>
          {len}/{max}
        </span>
      </div>
      <div className="w-full bg-zinc-100 rounded-full h-1 overflow-hidden">
        <div
          className={`h-1 rounded-full transition-all ${over ? "bg-red-400" : pct > 80 ? "bg-amber-400" : "bg-emerald-500"
            }`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function computeSeoScore(
  seo: BlogSeo,
  title: string,
  content: string,
  coverImage?: string
): number {
  let score = 0;
  if (title && title.length >= 10) score += 10;
  if (seo.metaTitle && seo.metaTitle.length >= 30 && seo.metaTitle.length <= 60) score += 20;
  if (seo.metaDescription && seo.metaDescription.length >= 50 && seo.metaDescription.length <= 160) score += 20;
  if (seo.keywords && seo.keywords.length > 0) score += 10;
  if (seo.focusKeyword) {
    score += 10;
    if (title.toLowerCase().includes(seo.focusKeyword.toLowerCase())) score += 10;
    if (content.toLowerCase().includes(seo.focusKeyword.toLowerCase())) score += 5;
  }
  if (coverImage) score += 5;
  if (seo.ogTitle) score += 5;
  if (seo.ogDescription) score += 5;
  return Math.min(score, 100);
}

export default function BlogEditor({ blogId }: BlogEditorProps) {
  const router = useRouter();
  const isEditing = !!blogId;
  const { data: existing, isLoading: isLoadingExisting } = useGetBlog(blogId ?? "");
  const createMutation = useCreateBlog();
  const updateMutation = useUpdateBlog();

  const [sections, setSections] = useState<Record<SectionKey, boolean>>({
    content: true,
    cover: true,
    meta: false,
    seo: false,
  });

  const toggleSection = (id: SectionKey) =>
    setSections((s) => ({ ...s, [id]: !s[id] }));

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [tags, setTags] = useState("");
  const [categories, setCategories] = useState("");
  const [author, setAuthor] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [seo, setSeo] = useState<BlogSeo>({});
  const [keywordsInput, setKeywordsInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  // Gates Tiptap mount — editor must only render AFTER all state is pre-filled
  // because useEditor reads content only once on initial mount
  const [dataReady, setDataReady] = useState(!isEditing); // true immediately for new posts

  // Populate on edit
  useEffect(() => {
    if (existing && isEditing) {
      setTitle(existing.title ?? "");
      setSlug(existing.slug ?? "");
      setSlugManual(true);
      setExcerpt(existing.excerpt ?? "");
      // Restore full URLs in img src so Tiptap can render them
      setContent(hydrateContentForEditor(existing.content ?? ""));
      // Store only the key — getFullImageUrl() called at display time
      setCoverImage(getImageKey(existing.coverImage ?? ""));
      setTags(existing.tags?.join(", ") ?? "");
      setCategories(existing.categories?.join(", ") ?? "");
      setAuthor(existing.author ?? "");
      setStatus(existing.status ?? "draft");
      setSeo(existing.seo ?? {});
      setKeywordsInput(existing.seo?.keywords?.join(", ") ?? "");
      // Mark data as ready so the editor mounts with pre-filled content
      setDataReady(true);
    }
  }, [existing, isEditing]);

  // Auto-slug from title
  useEffect(() => {
    if (!slugManual && title) {
      setSlug(generateSlug(title));
    }
  }, [title, slugManual]);

  const seoScore = computeSeoScore(seo, title, content, coverImage);

  const handleSeoChange = useCallback(
    (field: keyof BlogSeo, value: string) => {
      setSeo((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const buildPayload = (overrideStatus?: "draft" | "published"): CreateBlogPayload => ({
    title,
    slug: slug || generateSlug(title),
    excerpt,
    // Strip base URL → only keys stored in DB
    content: normalizeContentForStorage(content),
    // Store only the key, not the full URL
    coverImage,
    tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
    categories: categories.split(",").map((c) => c.trim()).filter(Boolean),
    author,
    status: overrideStatus ?? status,
    seo: {
      ...seo,
      keywords: keywordsInput.split(",").map((k) => k.trim()).filter(Boolean),
    },
  });

  const handleSave = async (saveStatus?: "draft" | "published") => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    setIsSaving(true);
    try {
      const payload = buildPayload(saveStatus);
      if (isEditing && blogId) {
        await updateMutation.mutateAsync({ id: blogId, payload });
        toast.success("Post updated");
      } else {
        const result = await createMutation.mutateAsync(payload);
        toast.success("Post created");
        router.push(`/dashboard/blog/${result._id}/edit`);
      }
    } catch {
      toast.error("Failed to save post");
    } finally {
      setIsSaving(false);
    }
  };

  if (isEditing && isLoadingExisting) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-400 text-sm">
        Loading post...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5 pb-16">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-4 sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-zinc-200 -mx-6 px-6 py-3">
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
              status === "published"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-zinc-100 text-zinc-500 border-zinc-200"
            }
          >
            {status === "published" ? "Published" : "Draft"}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSave("draft")}
            disabled={isSaving}
          >
            Save Draft
          </Button>
          <Button
            size="sm"
            onClick={() => handleSave("published")}
            disabled={isSaving}
            className="bg-black text-white hover:bg-zinc-800"
          >
            {isSaving ? "Saving…" : status === "published" ? "Update" : "Publish"}
          </Button>
        </div>
      </div>

      {/* Title */}
      <div className="space-y-1">
        <textarea
          id="blog-title"
          rows={2}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post title…"
          className="w-full text-3xl font-bold text-zinc-900 placeholder:text-zinc-300 border-none outline-none resize-none bg-transparent leading-tight"
        />
        {/* Slug row */}
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <span>Slug:</span>
          <input
            id="blog-slug"
            value={slug}
            onChange={(e) => {
              setSlugManual(true);
              setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
            }}
            className="flex-1 text-xs text-zinc-600 bg-zinc-50 border border-zinc-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-zinc-400 font-mono"
            placeholder="auto-generated-slug"
          />
          {slugManual && (
            <button
              type="button"
              className="text-zinc-400 hover:text-zinc-700 underline text-[10px]"
              onClick={() => {
                setSlugManual(false);
                setSlug(generateSlug(title));
              }}
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Content — WYSIWYG */}
      <Section title="Content" id="content" open={sections.content} toggle={toggleSection}>
        <div className="space-y-1.5">
          <Label className="text-xs text-zinc-500">
            Images inserted here are uploaded directly to R2 — use the 🖼️ toolbar button
          </Label>
          {dataReady ? (
            <RichTextEditor
              content={content}
              onChange={setContent}
              placeholder="Write your blog content here… Use the toolbar to insert images anywhere in the text."
            />
          ) : (
            <div className="border border-zinc-200 rounded-xl h-64 flex items-center justify-center bg-zinc-50 text-sm text-zinc-400 animate-pulse">
              Loading content…
            </div>
          )}
        </div>
      </Section>


      {/* Cover Image */}
      <Section
        title="Cover / Featured Image"
        id="cover"
        open={sections.cover}
        toggle={toggleSection}
        badge={coverImage ? "1 image" : undefined}
      >
        <p className="text-xs text-zinc-500">
          This is the featured image shown on listing pages and social shares. You can also insert additional images directly inside the content above.
        </p>
        <ImageUpload
          maxFiles={1}
          initialImages={coverImage ? [{ url: getFullImageUrl(coverImage), alt: "Cover" }] : []}
          onImagesChange={(imgs) => {
            // Store only the key — URL is built on the fly via getFullImageUrl()
            setCoverImage(imgs[0]?.key ?? "");
          }}
        />
      </Section>

      {/* Post Meta */}
      <Section title="Post Details" id="meta" open={sections.meta} toggle={toggleSection}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="blog-excerpt">Excerpt</Label>
            <Textarea
              id="blog-excerpt"
              rows={3}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Short description shown in listing cards…"
            />
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="blog-author">Author</Label>
              <Input
                id="blog-author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Author name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="blog-status">Status</Label>
              <select
                id="blog-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as "draft" | "published")}
                className="w-full border border-zinc-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 bg-white"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="blog-tags">Tags</Label>
            <Input
              id="blog-tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="health, wellness, tips (comma-separated)"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="blog-categories">Categories</Label>
            <Input
              id="blog-categories"
              value={categories}
              onChange={(e) => setCategories(e.target.value)}
              placeholder="Medical, Lifestyle (comma-separated)"
            />
          </div>
        </div>
      </Section>

      {/* SEO Section */}
      <Section
        title="SEO & Social"
        id="seo"
        open={sections.seo}
        toggle={toggleSection}
        badge={`Score: ${seoScore}/100`}
      >
        <SeoScoreBar score={seoScore} />

        <div className="grid grid-cols-1 gap-4 pt-2">
          {/* Focus Keyword */}
          <div className="space-y-1.5">
            <Label htmlFor="seo-focus-keyword">Focus Keyword</Label>
            <Input
              id="seo-focus-keyword"
              value={seo.focusKeyword ?? ""}
              onChange={(e) => handleSeoChange("focusKeyword", e.target.value)}
              placeholder="Primary keyword this post targets"
            />
            {seo.focusKeyword && (
              <div className="flex gap-4 text-xs text-zinc-500 pt-1">
                <span className={title.toLowerCase().includes((seo.focusKeyword ?? "").toLowerCase()) ? "text-emerald-600" : "text-red-500"}>
                  {title.toLowerCase().includes((seo.focusKeyword ?? "").toLowerCase()) ? "✓" : "✗"} In title
                </span>
                <span className={content.toLowerCase().includes((seo.focusKeyword ?? "").toLowerCase()) ? "text-emerald-600" : "text-amber-500"}>
                  {content.toLowerCase().includes((seo.focusKeyword ?? "").toLowerCase()) ? "✓" : "✗"} In content
                </span>
              </div>
            )}
          </div>

          {/* Meta Title */}
          <div className="space-y-1.5">
            <Label htmlFor="seo-meta-title">Meta Title</Label>
            <Input
              id="seo-meta-title"
              value={seo.metaTitle ?? ""}
              onChange={(e) => handleSeoChange("metaTitle", e.target.value)}
              placeholder="SEO page title (50–60 characters ideal)"
            />
            <CharCounter value={seo.metaTitle ?? ""} max={60} label="Meta Title" />
          </div>

          {/* Meta Description */}
          <div className="space-y-1.5">
            <Label htmlFor="seo-meta-desc">Meta Description</Label>
            <Textarea
              id="seo-meta-desc"
              rows={3}
              value={seo.metaDescription ?? ""}
              onChange={(e) => handleSeoChange("metaDescription", e.target.value)}
              placeholder="Brief description for search engines (120–160 characters ideal)"
            />
            <CharCounter value={seo.metaDescription ?? ""} max={160} label="Meta Description" />
          </div>

          {/* Keywords */}
          <div className="space-y-1.5">
            <Label htmlFor="seo-keywords">Keywords</Label>
            <Input
              id="seo-keywords"
              value={keywordsInput}
              onChange={(e) => setKeywordsInput(e.target.value)}
              placeholder="keyword one, keyword two (comma-separated)"
            />
          </div>

          {/* Canonical */}
          <div className="space-y-1.5">
            <Label htmlFor="seo-canonical">Canonical URL</Label>
            <Input
              id="seo-canonical"
              value={seo.canonicalUrl ?? ""}
              onChange={(e) => handleSeoChange("canonicalUrl", e.target.value)}
              placeholder="https://yoursite.com/blog/post-slug"
            />
          </div>

          <div className="border-t border-zinc-100 pt-4">
            <p className="text-xs font-semibold text-zinc-500 mb-3 uppercase tracking-wide">
              Open Graph (Social Preview)
            </p>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="seo-og-title">OG Title</Label>
                <Input
                  id="seo-og-title"
                  value={seo.ogTitle ?? ""}
                  onChange={(e) => handleSeoChange("ogTitle", e.target.value)}
                  placeholder="Social share title (defaults to meta title)"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="seo-og-desc">OG Description</Label>
                <Textarea
                  id="seo-og-desc"
                  rows={2}
                  value={seo.ogDescription ?? ""}
                  onChange={(e) => handleSeoChange("ogDescription", e.target.value)}
                  placeholder="Social share description"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="seo-og-image">OG Image URL</Label>
                <Input
                  id="seo-og-image"
                  value={seo.ogImage ?? ""}
                  onChange={(e) => handleSeoChange("ogImage", e.target.value)}
                  placeholder="https://… (use cover image URL or upload separately)"
                />
              </div>
            </div>
          </div>

          {/* Google SERP Preview */}
          {(seo.metaTitle || title) && (
            <div className="border border-zinc-200 rounded-lg p-4 bg-zinc-50">
              <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide mb-2">
                Google SERP Preview
              </p>
              <p className="text-sm font-medium text-blue-700 hover:underline cursor-default truncate">
                {seo.metaTitle || title}
              </p>
              <p className="text-xs text-green-700 mt-0.5 truncate">
                {seo.canonicalUrl || `https://yoursite.com/blog/${slug}`}
              </p>
              <p className="text-xs text-zinc-600 mt-1 line-clamp-2">
                {seo.metaDescription || excerpt || "No description provided."}
              </p>
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}
