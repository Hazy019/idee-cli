import { NextRequest, NextResponse } from 'next/server';
import { globalStore } from '@/lib/store';

export const dynamic = 'force-dynamic';

function isAuthenticated(req: NextRequest): boolean {
  const hasSbCookie = req.cookies.getAll().some((c) => c.name.startsWith('sb-'));
  const sessionToken =
    req.cookies.get('sb-access-token')?.value ||
    req.cookies.get('idee-session')?.value ||
    (hasSbCookie ? 'supabase-auth-cookie' : null) ||
    req.headers.get('authorization');
  return Boolean(sessionToken);
}

export async function GET(req: NextRequest) {
  if (!isAuthenticated(req)) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'You must be authenticated to retrieve telemetry data.' },
      { status: 401 }
    );
  }

  const logs = globalStore.getTelemetryLogs();
  return NextResponse.json({ logs });
}
