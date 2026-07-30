import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { TelemetryPayload, TelemetryPayloadSchema } from '@idee-cli/shared';

function getQueueFilePath(): string {
  const baseDir = process.env.APPDATA || path.join(os.homedir(), '.idee-cli');
  const dir = path.join(baseDir, 'idee-cli');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return path.join(dir, 'telemetry-queue.json');
}

function loadQueue(): TelemetryPayload[] {
  try {
    const p = getQueueFilePath();
    if (fs.existsSync(p)) {
      const data = fs.readFileSync(p, 'utf-8');
      return JSON.parse(data);
    }
  } catch {
    // Ignore read error
  }
  return [];
}

function saveQueue(queue: TelemetryPayload[]): void {
  try {
    const p = getQueueFilePath();
    fs.writeFileSync(p, JSON.stringify(queue, null, 2), 'utf-8');
  } catch {
    // Ignore write error
  }
}

export async function flushTelemetryQueue(
  token: string,
  dashboardUrl: string = process.env.IDEE_DASHBOARD_URL || 'http://localhost:3000'
): Promise<number> {
  const queue = loadQueue();
  if (queue.length === 0) return 0;

  const remaining: TelemetryPayload[] = [];
  let flushedCount = 0;

  for (const item of queue) {
    try {
      const res = await fetch(`${dashboardUrl}/api/telemetry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(item),
      });

      if (res.ok) {
        flushedCount++;
      } else {
        remaining.push(item);
      }
    } catch {
      remaining.push(item);
    }
  }

  saveQueue(remaining);
  return flushedCount;
}

export async function sendTelemetry(
  payload: TelemetryPayload,
  token: string,
  dashboardUrl: string = process.env.IDEE_DASHBOARD_URL || 'http://localhost:3000'
): Promise<boolean> {
  try {
    const validated = TelemetryPayloadSchema.parse(payload);

    // Attempt flush of previously queued offline items first
    await flushTelemetryQueue(token, dashboardUrl);

    const res = await fetch(`${dashboardUrl}/api/telemetry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(validated),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`[idee-cli] Telemetry transmission failed (${res.status}): ${errText}`);
      // Save to self-recovery offline queue
      const queue = loadQueue();
      queue.push(validated);
      saveQueue(queue);
      return false;
    }

    return true;
  } catch (err: any) {
    console.warn(`[idee-cli] Telemetry offline: saving payload to self-recovery queue (${err.message})`);
    try {
      const validated = TelemetryPayloadSchema.parse(payload);
      const queue = loadQueue();
      queue.push(validated);
      saveQueue(queue);
    } catch {
      // Validation error
    }
    return false;
  }
}
