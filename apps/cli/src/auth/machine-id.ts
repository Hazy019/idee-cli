import { execSync } from 'node:child_process';
import * as crypto from 'node:crypto';
import * as os from 'node:os';

export function getRawMachineGuid(): string {
  if (process.platform === 'win32') {
    try {
      const output = execSync(
        'reg query "HKLM\\SOFTWARE\\Microsoft\\Cryptography" /v MachineGuid',
        { encoding: 'utf-8', windowsHide: true }
      );
      const match = output.match(/MachineGuid\s+REG_SZ\s+([a-fA-F0-9\-]+)/);
      if (match && match[1]) {
        return match[1].trim();
      }
    } catch {
      // Fallback if reg query fails
    }
  }

  // Fallback machine identifier based on network interfaces / hostname
  const cpus = os.cpus().map((c) => c.model).join(',');
  const hostname = os.hostname();
  return `fallback-${hostname}-${cpus}`;
}

export function getMachineHash(): string {
  const rawId = getRawMachineGuid();
  return crypto.createHash('sha256').update(rawId).digest('hex');
}
