import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import Post from '@/models/Post';
import dbConnect from '@/lib/db';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { NextRequest } from 'next/server';
import { 
  PostResponse,
  PaginatedPostResponse,
  ContentBlockInput
} from '@/types/post';
import {
  ApiResponse,
  apiErrorResponse,
  apiSuccessResponse,
  formatValidationError,
  checkContentType,
  parseJsonRequest
} from '@/lib/utils';
import { PostCreateSchema } from '@/lib/validation/postSchemas';

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<PaginatedPostResponse>>> {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const skip = (page - 1) * limit;
    const tag = searchParams.get('tag');
    const featured = searchParams.get('featured') === 'true';
    const slug = searchParams.get('slug');
    const search = searchParams.get('search');

    // Handle getting a single post by slug
    if (slug) {
      const post = await Post.findOne({ 
        slug, 
        published: true 
      })
      .populate('author', 'name email')
      .lean<PostResponse>();

      if (!post) {
        return apiErrorResponse(
          'Not found',
          'Post not found',
          404
        ) as NextResponse<ApiResponse<PaginatedPostResponse>>;
      }

      // For single post, we need to return it in a paginated format
      const paginatedResponse: PaginatedPostResponse = {
        data: [post],
        pagination: {
          page: 1,
          limit: 1,
          total: 1,
          totalPages: 1
        }
      };

      return apiSuccessResponse(paginatedResponse) as NextResponse<ApiResponse<PaginatedPostResponse>>;
    }

    // Build the query object for multiple posts
    const query: Record<string, unknown> = { published: true };
    
    // Add tag filtering if provided
    if (tag) {
      query.tags = tag;
    }

    // Add featured filtering if provided
    if (featured) {
      query.featured = true;
    }
     if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { excerpt: searchRegex },
        { tags: searchRegex }
      ];
    }

    const [posts, total] = await Promise.all([
      Post.find(query)
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'name email')
        .lean<PostResponse[]>(),
      Post.countDocuments(query)
    ]);

    const paginatedResponse: PaginatedPostResponse = {
      data: posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };

    return apiSuccessResponse(paginatedResponse);

  } catch (error) {
    console.error('GET /api/posts error:', error);
    return apiErrorResponse(
      'Server error',
      'Failed to fetch posts',
      500,
      error
    ) as NextResponse<ApiResponse<PaginatedPostResponse>>;
  }
}

interface ProcessResult {
  content: ContentBlockInput[];
  migratedImages: string[];
}

async function processContentBlocks(
  blocks: ContentBlockInput[],
  userId: string
): Promise<ProcessResult> {
  const migratedImages: string[] = [];
  
  const processedBlocks = await Promise.all(
    blocks.map(async (block) => {
      if (block.type === 'image' && block.url?.includes('/drafts/')) {
        try {
          const publicId = block.url.split('/drafts/')[1].split('.')[0];
          const newPublicId = `posts/${userId}/${publicId}`;

          await cloudinary.uploader.rename(
            `drafts/${userId}/${publicId}`,
            newPublicId,
            { resource_type: 'image' }
          );
          await cloudinary.uploader.remove_tag('draft', [newPublicId]);

          migratedImages.push(newPublicId);
          return { 
            ...block,
            url: block.url.replace('/drafts/', '/posts/')
          };
        } catch (error) {
          console.error(`Image migration failed:`, error);
          return block; // Return original on failure
        }
      }
      return block;
    })
  );

  return {
    content: processedBlocks,
    migratedImages
  };
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const contentTypeError = await checkContentType(request);
    if (contentTypeError) return contentTypeError;

    const parseResult = await parseJsonRequest(request);
    if ('success' in parseResult && !parseResult.success) return parseResult;

    const user = await getCurrentUser(request);
    if (!user || !(await isAdmin(request))) {
      return apiErrorResponse('Unauthorized', 'Admin privileges required', 401);
    }

    const { error, value } = PostCreateSchema.validate(parseResult);
    if (error) {
      return apiErrorResponse(
        'Validation failed',
        'Invalid post data',
        400,
        formatValidationError(error)
      );
    }

    const { content: processedContent } = await processContentBlocks(
      value.content, 
      user.id
    );

    const post = new Post({
      ...value,
      content: processedContent,
      author: user._id,
      publishedAt: value.published ? new Date() : null
    });

    await post.save();

    return apiSuccessResponse(post.toObject(), 200);

  } catch (error) {
    console.error('POST /api/posts error:', error);
    return apiErrorResponse(
      'Server error',
      'Failed to create post',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}