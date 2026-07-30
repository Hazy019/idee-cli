import { TokenStore } from './token-store.js';
import { getMachineHash } from './machine-id.js';

export interface AuthResolution {
  token: string;
  source: 'interactive' | 'ci';
  machineHash: string;
}

export function resolveAuthToken(): AuthResolution {
  const machineHash = getMachineHash();

  // 1. Service token check first
  if (process.env.IDEE_SERVICE_TOKEN) {
    return {
      token: process.env.IDEE_SERVICE_TOKEN,
      source: 'ci',
      machineHash,
    };
  }

  // 2. Stored credential check
  const creds = TokenStore.getCredentials();
  if (creds && creds.accessToken) {
    return {
      token: creds.accessToken,
      source: 'interactive',
      machineHash,
    };
  }

  // 3. TTY / non-interactive failure check
  const isTTY = process.stdout.isTTY;
  if (!isTTY) {
    throw new Error(
      'Authentication required: No IDEE_SERVICE_TOKEN found in CI environment and no active login session found.\n' +
        'Please run "idee login" interactively or set IDEE_SERVICE_TOKEN.'
    );
  }

  throw new Error('Authentication required: Please run "idee login" to authenticate with the dashboard.');
}

export async function initiateDeviceFlow(dashboardUrl: string): Promise<string> {
  const machineHash = getMachineHash();

  const codeRes = await fetch(`${dashboardUrl}/api/device/code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ machine_hash: machineHash }),
  });

  if (!codeRes.ok) {
    throw new Error(`Failed to initiate device authorization flow: ${codeRes.statusText}`);
  }

  const { device_code, user_code, verification_uri, interval = 5, expires_in = 600 } = await codeRes.json();

  console.log(`\n======================================================`);
  console.log(`OAuth 2.0 Device Authorization Required`);
  console.log(`Please open URL in your browser: ${verification_uri}`);
  console.log(`Enter Code: ${user_code}`);
  console.log(`======================================================\n`);

  const startTime = Date.now();
  const pollIntervalMs = interval * 1000;

  while ((Date.now() - startTime) / 1000 < expires_in) {
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));

    const tokenRes = await fetch(`${dashboardUrl}/api/device/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        device_code,
        machine_hash: machineHash,
      }),
    });

    if (tokenRes.ok) {
      const data = await tokenRes.json();
      if (data.access_token) {
        TokenStore.saveCredentials({
          accessToken: data.access_token,
          machineHash,
          userCode: user_code,
        });
        console.log('Successfully authenticated and saved credentials!');
        return data.access_token;
      }
    } else if (tokenRes.status !== 400 && tokenRes.status !== 428) {
      const errJson = await tokenRes.json().catch(() => ({}));
      throw new Error(`Device authorization failed: ${errJson.error || tokenRes.statusText}`);
    }
  }

  throw new Error('Device authorization flow timed out. Please try running "idee login" again.');
}
