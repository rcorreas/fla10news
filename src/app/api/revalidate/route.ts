import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (token !== 'fla10-super-secret-sync') {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    // Revalidate home page
    revalidatePath('/');
    
    // Revalidate all pages to be safe, especially layout and dynamic routes
    revalidatePath('/', 'layout');

    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (err) {
    return NextResponse.json({ message: 'Error revalidating' }, { status: 500 });
  }
}
