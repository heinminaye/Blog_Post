import { LoginCredentials, LoginResponse } from "@/types/user";
import { PostResponse, PaginatedPostResponse, ApiResponse } from '@/types/post';

const handleApiResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  const data: ApiResponse<T> = await response.json();
  return data;
};

// Auth
export const login = async (credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> => {
  const response = await fetch('/api/auth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: credentials.email.trim(),
      password: credentials.password.trim(),
    }),
    credentials:'include'
  });
  
  return handleApiResponse<LoginResponse>(response);
};

export const logout = async (): Promise<ApiResponse<null>> => {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });

  return handleApiResponse<null>(response);
};


// Post
export const fetchPosts = async (
  page = 1,
  limit = 10,
  search = '',
  tag: string | null = null
): Promise<ApiResponse<PaginatedPostResponse>> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  if (search) params.append('search', search);
  if (tag) params.append('tag', tag);

  const response = await fetch(`/api/posts?${params.toString()}`);
  return handleApiResponse<PaginatedPostResponse>(response);
};

export const fetchPost = async (id: string): Promise<ApiResponse<PostResponse>> => {
  const response = await fetch(`/api/posts/${id}`);
  return handleApiResponse<PostResponse>(response);
};

export const fetchPostBySlug = async (slug: string): Promise<ApiResponse<PostResponse>> => {
  const response = await fetch(`/api/posts/${slug}`);
  return handleApiResponse<PostResponse>(response);
};

export const createPost = async (postData: unknown): Promise<ApiResponse<PostResponse>> => {
  const response = await fetch('/api/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(postData)
  });
  return handleApiResponse<PostResponse>(response);
};

export const updatePost = async (id: string, postData: unknown): Promise<ApiResponse<PostResponse>> => {
  const response = await fetch(`/api/posts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(postData)
  });
  return handleApiResponse<PostResponse>(response);
};

export const deletePost = async (id: string): Promise<ApiResponse<void>> => {
  const response = await fetch(`/api/posts/${id}`, {
    method: 'DELETE'
  });
  return handleApiResponse<void>(response);
};