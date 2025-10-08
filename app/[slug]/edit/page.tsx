"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { PostResponse } from "@/types/post";
import PostEditor from "@/components/admin/PostEditor";
import { fetchPostBySlug } from "@/lib/api/api";
import LoadingDots from "@/components/ui/LoadingDots";

export default function EditPostPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [post, setPost] = useState<PostResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const fetchPost = async () => {
      try {
        const res = await fetchPostBySlug(slug as string);
        if (!res.success) {
          throw new Error("Post not found");
        }
        setPost(res.data);
      } catch (error: unknown) {
         if (error instanceof Error) {
            toast.error(error.message);
          } else {
            toast.error("Failed to load post");
          }
          router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center overflow-x-hidden">
        <LoadingDots />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Post not found
      </div>
    );
  }

  return <PostEditor initialPost={post} />;
}
