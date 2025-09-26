import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}
const secretKey = new TextEncoder().encode(JWT_SECRET);

export async function verifyTokenForMiddleware(token: string) {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as { 
      userId: string;
      email: string;
      role: string;
    };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Invalid token');
  }
}

export async function getCurrentUserForMiddleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  
  if (!token) {
    return null;
  }

  try {
    const decoded = await verifyTokenForMiddleware(token);
    return decoded;
  } catch (error: unknown) {
    if (error instanceof Error) {
        console.error('Token verification failed:', error.message);
    } else {
        console.error('Token verification failed: Unknown error');
    }
    return null;
  }
}

export async function isAdminFromToken(req: NextRequest) {
  const user = await getCurrentUserForMiddleware(req);
  return user?.role === 'admin';
}