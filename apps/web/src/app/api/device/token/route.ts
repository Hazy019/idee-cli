import { NextRequest, NextResponse } from 'next/server';
import { globalStore } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { device_code, machine_hash, user_code, approve } = body;

    // Direct browser approval path
    if (user_code && approve) {
      const ok = globalStore.approveDeviceSession(user_code);
      if (ok) {
        return NextResponse.json({ success: true, message: 'Device authorized successfully' });
      }
      return NextResponse.json({ error: 'Invalid or expired user code' }, { status: 400 });
    }

    if (!device_code) {
      return NextResponse.json({ error: 'device_code is required' }, { status: 400 });
    }

    const session = globalStore.checkDeviceSession(device_code);
    if (!session) {
      return NextResponse.json({ error: 'invalid_grant' }, { status: 400 });
    }

    if (Date.now() > session.expiresAt) {
      return NextResponse.json({ error: 'expired_token' }, { status: 400 });
    }

    if (session.status === 'pending') {
      return NextResponse.json({ error: 'authorization_pending' }, { status: 428 });
    }

    if (session.status === 'approved') {
      const accessToken = `dev-token-${Date.now()}:${session.machineHash}`;
      return NextResponse.json({
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: 86400 * 30,
      });
    }

    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
