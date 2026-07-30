import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

export interface StoredCredentials {
  accessToken: string;
  machineHash: string;
  expiresAt?: string;
  userCode?: string;
}

const CREDENTIALS_FILE = path.join(os.homedir(), '.ideefy', 'credentials.json');

export class TokenStore {
  public static getCredentials(): StoredCredentials | null {
    if (!fs.existsSync(CREDENTIALS_FILE)) {
      return null;
    }
    try {
      const data = fs.readFileSync(CREDENTIALS_FILE, 'utf-8');
      return JSON.parse(data) as StoredCredentials;
    } catch {
      return null;
    }
  }

  public static saveCredentials(creds: StoredCredentials): void {
    const dir = path.dirname(CREDENTIALS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(creds, null, 2), {
      encoding: 'utf-8',
      mode: 0o600, // User read/write only
    });
  }

  public static clearCredentials(): void {
    if (fs.existsSync(CREDENTIALS_FILE)) {
      fs.unlinkSync(CREDENTIALS_FILE);
    }
  }
}
