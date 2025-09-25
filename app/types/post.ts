import { Document } from 'mongoose';
import mongoose from 'mongoose';

export const contentBlockTypes = [
  'paragraph', 'image', 'video', 'heading',
  'quote', 'code', 'divider', 'embed'
] as const;

export const embedTypes = ['youtube', 'tiktok' , 'unknown'] as const;

export type ContentBlockType = typeof contentBlockTypes[number];
export type EmbedType = typeof embedTypes[number];

export interface ContentBlockInput{
  type: ContentBlockType;
  content?: string;
  url?: string;
  altText?: string;
  caption?: string;
  width?: number;
  height?: number;
  language?: string;
  author?: string;
  embedType?: EmbedType;
  publicId?: string;
}

export interface IContentBlock extends ContentBlockInput, Document {}

export interface IPost extends Document {
  title: string;
  slug: string;
  content: IContentBlock[];
  excerpt?: string;
  coverImage?: string;
  author: mongoose.Types.ObjectId;
  published: boolean;
  publishedAt?: Date;
  tags?: string[];
  readingTime: number;
  createdAt: Date;
  updatedAt: Date;
}

export type PostCreateInput = {
  title: string;
  slug: string;
  content: Array<{
    type: ContentBlockType;
    content?: string;
    url?: string;
    altText?: string;
    caption?: string;
    width?: number;
    height?: number;
    language?: string;
    embedType?: EmbedType;
  }>;
  excerpt?: string;
  coverImage?: string;
  tags?: string[];
  published?: boolean;
};

export type PostResponse = {
  _id: string;
  title: string;
  slug: string;
  content: Array<{
    type: ContentBlockType;
    content?: string;
    url?: string;
    altText?: string;
    caption?: string;
    width?: number;
    height?: number;
    language?: string;
    embedType?: EmbedType;
  }>;
  excerpt?: string;
  coverImage?: string;
  author: {
    _id: string;
    name?: string;
    email?: string;
  };
  published: boolean;
  publishedAt?: Date;
  tags?: string[];
  readingTime: number;
  createdAt: Date;
  updatedAt: Date;
};


export type PaginatedPostResponse = {
  data: PostResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type ApiError = {
  error: string;
  details?: any;
  statusCode?: number;
};

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string
  statusCode: number;
};

export type PostApiResponse = PostResponse | ApiError;
export type PaginatedPostApiResponse = PaginatedPostResponse | ApiError;