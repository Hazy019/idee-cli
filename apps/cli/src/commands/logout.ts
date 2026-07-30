import { Command } from '@oclif/core';
import { TokenStore } from '../auth/token-store.js';

export default class LogoutCommand extends Command {
  static description = 'Revoke and clear stored local credentials';

  async run(): Promise<void> {
    try {
      TokenStore.clearCredentials();
      this.log('Successfully logged out and cleared stored credentials.');
    } catch (err: any) {
      this.error(`Logout failed: ${err.message}`, { exit: 1 });
    }
  }
}
