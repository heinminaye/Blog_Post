// /app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import User from '@/models/User';
import dbConnect from '@/lib/db';
import { ApiResponse, apiSuccessResponse, apiErrorResponse } from '@/lib/utils';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET environment variable is not set');

const secretKey = new TextEncoder().encode(JWT_SECRET);

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as { userId: string; email: string; role: string };
  } catch {
    throw new Error('Invalid token');
  }
}

export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse<{ user: { id: string; email: string; role: string } }>>> {
  try {
    await dbConnect();

    const token = req.cookies.get('token')?.value;
    if (!token) {
      return apiErrorResponse('Unauthorized', 'No token provided', 401);
    }

    let decoded;
    try {
      decoded = await verifyToken(token);
    } catch {
      return apiErrorResponse('Unauthorized', 'Invalid token', 401);
    }

    const user = await User.findById(decoded.userId).select('_id email role');
    if (!user) {
      return apiErrorResponse('Unauthorized', 'User not found', 401);
    }

    return apiSuccessResponse({
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Auth me error:', error);
    return apiErrorResponse('Server error', 'An unexpected error occurred', 500);
  }
}
