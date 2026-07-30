import { NextRequest, NextResponse } from 'next/server';
import { TelemetryPayloadSchema } from '@idee-cli/shared';
import { checkRateLimit } from '@/lib/rate-limit';
import { globalStore } from '@/lib/store';

export const dynamic = 'force-dynamic';

// XSS Aggressive Sanitization Helper
function sanitizeString(str: string): string {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: missing bearer token' }, { status: 401 });
    }

    // Rate limiting (60 requests per minute limit per token)
    const rateLimit = await checkRateLimit(token || 'anonymous', 60, 60000);
    if (!rateLimit.success) {
      return NextResponse.json({ error: 'Too Many Requests: Rate limit exceeded' }, { status: 429 });
    }

    const body = await req.json();
    const payload = TelemetryPayloadSchema.parse(body);

    // Machine GUID Binding validation (§8.1 & §8.3)
    if (token.startsWith('dev-token-')) {
      const parts = token.split(':');
      const boundMachineHash = parts[1];

      if (boundMachineHash && boundMachineHash !== payload.machine_hash) {
        console.warn(`[AUDIT] Machine hash mismatch! Token bound: ${boundMachineHash}, Request: ${payload.machine_hash}`);
        return NextResponse.json(
          { error: 'Security Violation: Token replayed from unauthorized machine identifier.' },
          { status: 403 }
        );
      }
    }

    // Organization derivation
    const organizationId = globalStore.getOrganizations()[0]?.id || '00000000-0000-0000-0000-000000000001';

    // Aggressive XSS Sanitization of all string payloads from untrusted CLI instances
    const sanitizedInstalled = payload.packages_installed.map(sanitizeString);
    const sanitizedSkipped = payload.packages_skipped.map(sanitizeString);
    const sanitizedOverrides = payload.override_packages.map(sanitizeString);
    const sanitizedFailed = payload.packages_failed.map((f) => ({
      id: sanitizeString(f.id),
      reason: sanitizeString(f.reason),
    }));

    const logEntry = {
      id: crypto.randomUUID(),
      organization_id: organizationId,
      machine_hash: sanitizeString(payload.machine_hash),
      source: payload.source,
      execution_time_ms: payload.execution_time_ms,
      packages_installed: sanitizedInstalled,
      packages_skipped: sanitizedSkipped,
      packages_failed: sanitizedFailed,
      override_packages: sanitizedOverrides,
      timestamp: payload.timestamp || new Date().toISOString(),
    };

    globalStore.addTelemetry(logEntry);

    return NextResponse.json({ success: true, id: logEntry.id }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Invalid telemetry payload' }, { status: 400 });
  }
}
