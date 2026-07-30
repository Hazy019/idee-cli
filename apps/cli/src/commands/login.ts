import { Command, Flags } from '@oclif/core';
import { initiateDeviceFlow } from '../auth/device-flow.js';
import { TokenStore } from '../auth/token-store.js';

export default class LoginCommand extends Command {
  static description = 'Authenticate CLI with central dashboard via OAuth 2.0 Device Flow';

  static flags = {
    'dashboard-url': Flags.string({
      description: 'Dashboard server URL',
      default: 'http://localhost:3000',
      env: 'IDEE_DASHBOARD_URL',
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(LoginCommand);

    try {
      const existing = TokenStore.getCredentials();
      if (existing && existing.accessToken) {
        this.log('Already logged in! Replacing existing credentials...');
      }

      await initiateDeviceFlow(flags['dashboard-url']);
    } catch (err: any) {
      this.error(`Login failed: ${err.message}`, { exit: 1 });
    }
  }
}
