import { NextResponse } from 'next/server';
import { generateToken } from '@/lib/auth';
import User from '@/models/User';
import dbConnect from '@/lib/db';
import {
  ApiResponse,
  apiErrorResponse,
  apiSuccessResponse,
  checkContentType,
  parseJsonRequest
} from '@/lib/utils';
import { LoginSchema } from '@/lib/validation/authSchemas';

export async function POST(request: Request): Promise<NextResponse<ApiResponse<{
  user: {
    id: string;
    email: string;
    role: string;
  };
  token: string;
}>>> {
  try {
    await dbConnect();

    const contentTypeError = await checkContentType(request);
    if (contentTypeError) return contentTypeError;

    const parseResult = await parseJsonRequest(request);
    if ('success' in parseResult && !parseResult.success) return parseResult;

    const { error, value } = LoginSchema.validate(parseResult);
    if (error) {
      return apiErrorResponse(
        'Validation failed',
        'Invalid login data',
        400,
        error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      );
    }

    const { email, password } = value;

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return apiErrorResponse(
        'Authentication failed',
        'Invalid email or password',
        401
      );
    }

    const isMatch = await user.comparePassword(password.trim());
    if (!isMatch) {
      return apiErrorResponse(
        'Authentication failed',
        'Invalid email or password',
        401
      );
    }

    const token = await generateToken(user);

    const response = apiSuccessResponse({
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      },
      token: token
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: false,
      maxAge: 60 * 60 * 24,
      path: '/',
      sameSite: 'lax'
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return apiErrorResponse(
      'Server error',
      'An unexpected error occurred',
      500,
      error instanceof Error ? error.message : undefined
    );
  }
}