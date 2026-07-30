import { NextRequest, NextResponse } from 'next/server';
import { globalStore } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { machine_hash } = body;

    if (!machine_hash) {
      return NextResponse.json({ error: 'machine_hash is required' }, { status: 400 });
    }

    const session = globalStore.createDeviceSession(machine_hash);
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const verification_uri = `${protocol}://${host}/device?code=${session.userCode}`;

    return NextResponse.json({
      device_code: session.deviceCode,
      user_code: session.userCode,
      verification_uri,
      expires_in: 600,
      interval: 2,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
