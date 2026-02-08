import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '../../../../payload.config';

// Initialize Payload
const getPayloadClient = async () => {
  return getPayload({
    config: configPromise,
  });
};

// Handle GET requests
export async function GET(
  request: NextRequest,
  { params }: { params: { slug?: string[] } }
): Promise<NextResponse> {
  try {
    const payload = await getPayloadClient();
    const slug = params.slug?.join('/') || '';

    // Handle admin route - serve admin HTML
    if (slug === 'admin' || slug.startsWith('admin/')) {
      const adminHTML = await payload.generateAdminHTML();
      return new NextResponse(adminHTML, {
        headers: {
          'Content-Type': 'text/html',
        },
      });
    }

    // Handle API requests
    const url = new URL(request.url);
    const searchParams = Object.fromEntries(url.searchParams.entries());

    // Forward to Payload API
    const response = await payload.find({
      collection: slug as any,
      ...searchParams,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Payload API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Handle POST requests
export async function POST(
  request: NextRequest,
  { params }: { params: { slug?: string[] } }
): Promise<NextResponse> {
  try {
    const payload = await getPayloadClient();
    const slug = params.slug?.join('/') || '';
    const body = await request.json();

    // Handle login and other admin operations
    if (slug === 'admin/login' || slug === 'api/users/login') {
      // Auth is handled by NextAuth, redirect or handle accordingly
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ slug, received: body });
  } catch (error) {
    console.error('Payload API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Handle other HTTP methods
export const PUT = GET;
export const DELETE = GET;
export const PATCH = GET;
