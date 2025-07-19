import { NextResponse } from 'next/server';
import { ChatDatabase } from '@/lib/database';

export async function POST() {
  try {
    const db = ChatDatabase.getInstance();
    db.resetDatabase();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database reset successfully' 
    });
  } catch (error) {
    console.error('Error resetting database:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to reset database' 
      },
      { status: 500 }
    );
  }
}