// Mark all API routes as dynamic
export const dynamic = 'force-dynamic';

// Simple health check endpoint
export async function GET() {
  return new Response(JSON.stringify({ status: 'ok' }), {
    headers: { 'content-type': 'application/json' },
  });
} 