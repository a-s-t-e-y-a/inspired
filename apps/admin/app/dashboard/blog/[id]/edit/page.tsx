"use client";

import BlogEditor from "../../blog-editor";
import { use } from "react";

export default function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <div className="p-6">
      <BlogEditor blogId={id} />
    </div>
  );
}
