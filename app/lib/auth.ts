import { NextRequest } from 'next/server';
import User from '@/models/User';
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;
const secretKey = new TextEncoder().encode(JWT_SECRET);

export async function generateToken(user: any) {
  const token = await new SignJWT({
    userId: user._id.toString(),
    email: user.email,
    role: user.role
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1d')
    .sign(secretKey);
  
  return token;
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as { 
      userId: string;
      email: string;
      role: string;
    };
  } catch (error) {
    throw new Error('Invalid token');
  }
}


export async function getCurrentUser(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  if (!token) return null;

  try {
    const { userId } = await verifyToken(token);
    const user = await User.findById(userId);
    return user;
  } catch (error) {
    return null;
  }
}

export async function isAdmin(req: NextRequest) {
  const user = await getCurrentUser(req);
  return user?.role === 'admin';
}