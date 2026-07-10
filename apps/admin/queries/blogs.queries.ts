import api from "@/lib/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface BlogSeo {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  focusKeyword?: string;
}

export interface Blog {
  _id: string;
  title: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  coverImage?: string;
  tags?: string[];
  categories?: string[];
  author?: string;
  status: "draft" | "published";
  publishedAt?: string;
  isArchived?: boolean;
  seo?: BlogSeo;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedBlogResponse {
  data: Blog[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CreateBlogPayload {
  title: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  coverImage?: string;
  tags?: string[];
  categories?: string[];
  author?: string;
  status?: "draft" | "published";
  publishedAt?: string;
  isArchived?: boolean;
  seo?: BlogSeo;
}

const BLOGS_KEY = "blogs";

const fetchBlogs = async (
  page: number,
  limit = 10,
  status?: string
): Promise<PaginatedBlogResponse> => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) params.set("status", status);
  const { data } = await api.get(`/blogs?${params.toString()}`);
  return data;
};

const fetchBlog = async (id: string): Promise<Blog> => {
  const { data } = await api.get(`/blogs/${id}`);
  return data;
};

const createBlog = async (payload: CreateBlogPayload) => {
  const { data } = await api.post("/blogs", payload);
  return data;
};

const updateBlog = async ({
  id,
  payload,
}: {
  id: string;
  payload: Partial<CreateBlogPayload>;
}) => {
  const { data } = await api.put(`/blogs/${id}`, payload);
  return data;
};

const archiveBlog = async (id: string) => {
  const { data } = await api.patch(`/blogs/${id}/archive`);
  return data;
};

const deleteBlog = async (id: string) => {
  const { data } = await api.delete(`/blogs/${id}`);
  return data;
};

export const useGetBlogs = (page: number, limit = 10, status?: string) =>
  useQuery({
    queryKey: [BLOGS_KEY, page, limit, status],
    queryFn: () => fetchBlogs(page, limit, status),
  });

export const useGetBlog = (id: string) =>
  useQuery({
    queryKey: [BLOGS_KEY, id],
    queryFn: () => fetchBlog(id),
    enabled: !!id,
  });

export const useCreateBlog = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createBlog,
    onSuccess: () => qc.invalidateQueries({ queryKey: [BLOGS_KEY] }),
  });
};

export const useUpdateBlog = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateBlog,
    onSuccess: () => qc.invalidateQueries({ queryKey: [BLOGS_KEY] }),
  });
};

export const useArchiveBlog = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: archiveBlog,
    onSuccess: () => qc.invalidateQueries({ queryKey: [BLOGS_KEY] }),
  });
};

export const useDeleteBlog = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteBlog,
    onSuccess: () => qc.invalidateQueries({ queryKey: [BLOGS_KEY] }),
  });
};
