import { Command, Flags } from '@oclif/core';
import * as fs from 'node:fs';
import * as path from 'node:path';

const DEFAULT_SETUP_TEMPLATE = {
  version: '1.0',
  name: 'Engineering Team Baseline Environment',
  packages: [
    {
      id: 'Git.Git',
      name: 'Git for Windows',
      version: '2.45.0',
      locked: true,
      dependsOn: [],
    },
    {
      id: 'Nodejs.Nodejs',
      name: 'Node.js LTS',
      version: '22.0.0',
      locked: true,
      dependsOn: ['Git.Git'],
    },
    {
      id: 'Microsoft.VisualStudioCode',
      name: 'Visual Studio Code',
      locked: false,
      dependsOn: ['Nodejs.Nodejs'],
    },
  ],
};

export default class InitCommand extends Command {
  static description = 'Initialize a new team-setup.json baseline configuration in the current directory';

  static flags = {
    force: Flags.boolean({ char: 'f', description: 'Overwrite existing team-setup.json' }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(InitCommand);
    const targetPath = path.resolve(process.cwd(), 'team-setup.json');

    if (fs.existsSync(targetPath) && !flags.force) {
      this.error(
        `team-setup.json already exists at ${targetPath}. Use --force to overwrite.`,
        { exit: 1 }
      );
      return;
    }

    fs.writeFileSync(targetPath, JSON.stringify(DEFAULT_SETUP_TEMPLATE, null, 2), 'utf-8');

    this.log(`\n======================================================`);
    this.log(`idee init — Baseline Config Initialized`);
    this.log(`======================================================\n`);
    this.log(`✔ Created baseline config: ${targetPath}`);
    this.log(`Next steps:`);
    this.log(` 1. Inspect or customize packages in team-setup.json`);
    this.log(` 2. Run 'idee plan' to preview installation order`);
    this.log(` 3. Run 'idee apply' to reconcile environment\n`);
  }
}
