"use client";

import { useState } from "react";
import Link from "next/link";
import { useGetBlogs, useArchiveBlog, useDeleteBlog, Blog } from "@/queries/blogs.queries";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import toast from "react-hot-toast";

function StatusBadge({ status }: { status: Blog["status"] }) {
  if (status === "published")
    return (
      <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200">
        Published
      </Badge>
    );
  return <Badge variant="secondary">Draft</Badge>;
}

export default function BlogListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { data, isLoading } = useGetBlogs(page, 10, statusFilter || undefined);
  const archiveMutation = useArchiveBlog();
  const deleteMutation = useDeleteBlog();

  const posts = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const filtered = search
    ? posts.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()))
    : posts;

  const handleArchive = async (id: string) => {
    try {
      await archiveMutation.mutateAsync(id);
      toast.success("Post archived");
    } catch {
      toast.error("Failed to archive");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently delete this post?")) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Post deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div>
      <PageHeader
        title="Blog"
        description={`${total} total posts`}
        action={
          <Link href="/dashboard/blog/new">
            <Button>+ New Post</Button>
          </Link>
        }
      />

      <div className="mb-5 flex items-center gap-3">
        <Input
          placeholder="Search posts…"
          className="max-w-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="border border-zinc-200 rounded-md px-3 py-2 text-sm text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-300 bg-white"
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      <div className="border border-zinc-200 bg-white rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-50/50">
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-zinc-400 py-12">
                  Loading…
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-zinc-400 py-12">
                  No posts found.{" "}
                  <Link href="/dashboard/blog/new" className="text-zinc-700 underline">
                    Create your first post →
                  </Link>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((post) => (
                <TableRow key={post._id} className="hover:bg-zinc-50/50">
                  <TableCell className="font-medium text-black max-w-xs">
                    <Link
                      href={`/dashboard/blog/${post._id}`}
                      className="hover:underline hover:text-indigo-700 transition-colors line-clamp-1"
                    >
                      {post.title}
                    </Link>
                    {post.slug && (
                      <p className="text-[11px] text-zinc-400 font-mono mt-0.5">/{post.slug}</p>
                    )}
                  </TableCell>
                  <TableCell className="text-zinc-500 text-sm">
                    {post.author || "—"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={post.status} />
                  </TableCell>
                  <TableCell className="text-zinc-400 text-sm">
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })
                      : post.createdAt
                      ? new Date(post.createdAt).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/dashboard/blog/${post._id}/edit`}>
                        <Button size="sm" variant="outline">Edit</Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleArchive(post._id)}
                        disabled={archiveMutation.isPending}
                      >
                        Archive
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                        onClick={() => handleDelete(post._id)}
                        disabled={deleteMutation.isPending}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-zinc-500">
            Page {page} of {totalPages} &middot; {total} total
          </p>
          <div className="flex gap-2">
            <Button
              size="sm" variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Prev
            </Button>
            <Button
              size="sm" variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
