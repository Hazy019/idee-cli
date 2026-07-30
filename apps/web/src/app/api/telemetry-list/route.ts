import { NextResponse } from 'next/server';
import { globalStore } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const logs = globalStore.getTelemetryLogs();
  return NextResponse.json({ logs });
}
