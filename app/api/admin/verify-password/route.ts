import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    // Get the secret password from environment (server-side only)
    const correctPassword = process.env.ADMIN_PASSWORD;

    if (!correctPassword) {
      console.error('ADMIN_PASSWORD not set in environment variables');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Verify password
    if (password === correctPassword) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Incorrect password' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Error verifying password:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
