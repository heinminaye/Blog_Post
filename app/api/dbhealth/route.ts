import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';

export async function GET() {
  try {
    const db = await connectDB();
    const admin = db.connection.db.admin();
    await admin.ping();
    
    return NextResponse.json({
      status: 'healthy',
      dbState: db.connection.readyState, // 1 = connected
      dbName: db.connection.name
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'unhealthy', error: error },
      { status: 500 }
    );
  }
}