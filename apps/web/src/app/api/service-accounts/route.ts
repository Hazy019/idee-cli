import { NextRequest, NextResponse } from 'next/server';
import { globalStore } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const accounts = globalStore.getServiceAccounts().map((acc) => {
    const expiresAt = new Date(acc.expires_at).getTime();
    const now = Date.now();
    const daysUntilExpiry = Math.ceil((expiresAt - now) / (1000 * 3600 * 24));

    let status: 'active' | 'warning' | 'expired' = 'active';
    if (daysUntilExpiry <= 0) {
      status = 'expired';
    } else if (daysUntilExpiry <= 14) {
      status = 'warning';
    }

    return {
      ...acc,
      status,
      daysUntilExpiry,
    };
  });

  return NextResponse.json({ serviceAccounts: accounts });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, action, id } = body;

    if (action === 'revoke' && id) {
      globalStore.revokeServiceAccount(id);
      return NextResponse.json({ success: true, message: 'Token revoked' });
    }

    if (action === 'regenerate' && id) {
      globalStore.revokeServiceAccount(id);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 90);
      const newToken = `st_${Math.random().toString(36).substring(2, 18)}`;
      const newAcc = {
        id: crypto.randomUUID(),
        organization_id: globalStore.getOrganizations()[0]?.id || '00000000-0000-0000-0000-000000000001',
        name: name || 'Regenerated CI Token',
        token_hash: newToken,
        expires_at: expiresAt.toISOString(),
      };
      globalStore.addServiceAccount(newAcc);
      return NextResponse.json({ success: true, token: newToken, serviceAccount: newAcc });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 90);
    const token = `st_${Math.random().toString(36).substring(2, 18)}`;
    const newAcc = {
      id: crypto.randomUUID(),
      organization_id: globalStore.getOrganizations()[0]?.id || '00000000-0000-0000-0000-000000000001',
      name: name || 'New CI Token',
      token_hash: token,
      expires_at: expiresAt.toISOString(),
    };

    globalStore.addServiceAccount(newAcc);
    return NextResponse.json({ success: true, token, serviceAccount: newAcc }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
