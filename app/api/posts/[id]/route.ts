import { NextResponse } from 'next/server';
import Post from '@/models/Post';
import dbConnect from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { NextRequest } from 'next/server';
import {
  ApiResponse,
  apiErrorResponse,
  apiSuccessResponse,
  checkContentType,
  formatValidationError,
  parseJsonRequest
} from '@/lib/utils';
import { PostResponse } from '@/types/post';
import { PostUpdateSchema } from '@/lib/validation/postSchemas';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<PostResponse>>> {
  try {
    await dbConnect();
    const { id } = await params;
    const isObjectId =/^[0-9a-fA-F]{24}$/.test(id);
    
    let post;
    if (isObjectId) {
      post = await Post.findById(id).populate('author', 'email');
    } else {
      post = await Post.findOne({ slug: id }).populate('author', 'email');
    }
    
    if (!post) {
      return apiErrorResponse(
        'Not Found',
        'Post not found',
        404
      );
    }

    return apiSuccessResponse(post.toObject());

  } catch (error) {
    console.error('GET /api/posts/[id] error:', error);
    return apiErrorResponse(
      'Server Error',
      'Failed to fetch post',
      500,
      error
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<PostResponse>>> {
  try {
    await dbConnect();

    const contentTypeError = await checkContentType(request);
    if (contentTypeError) return contentTypeError;

    const parseResult = await parseJsonRequest(request);
    if ('success' in parseResult && !parseResult.success) return parseResult;

    if (!(await isAdmin(request))) {
      return apiErrorResponse(
        'Unauthorized',
        'Admin privileges required',
        401
      );
    }

    const { error, value } = PostUpdateSchema.validate(parseResult);
    if (error) {
      return apiErrorResponse(
        'Validation failed',
        'Invalid post data',
        400,
        formatValidationError(error)
      );
    }

    const post = await Post.findByIdAndUpdate(params.id, value, { 
      new: true 
    }).populate('author', 'email');

    if (!post) {
      return apiErrorResponse(
        'Not Found',
        'Post not found',
        404
      );
    }

    return apiSuccessResponse(post.toObject());

  } catch (error) {
    console.error('PUT /api/posts/[id] error:', error);
    return apiErrorResponse(
      'Server Error',
      'Failed to update post',
      500,
      error
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<{ success: boolean }>>> {
  try {
    await dbConnect();

    if (!(await isAdmin(request))) {
      return apiErrorResponse(
        'Unauthorized',
        'Admin privileges required',
        401
      );
    }

    const post = await Post.findByIdAndDelete(params.id);

    if (!post) {
      return apiErrorResponse(
        'Not Found',
        'Post not found',
        404
      );
    }

    return apiSuccessResponse({ success: true });

  } catch (error) {
    console.error('DELETE /api/posts/[id] error:', error);
    return apiErrorResponse(
      'Server Error',
      'Failed to delete post',
      500,
      error
    );
  }
}