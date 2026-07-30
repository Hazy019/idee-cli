import { Command, Flags } from '@oclif/core';
import { computeDiff, sortPackagesTopologically } from '@idee-cli/shared';
import { loadAndMergeConfig } from '../config/loader.js';
import { WingetBackend } from '../installer/winget.js';

export default class AuditCommand extends Command {
  static description = 'Read-only inspection of target configuration vs installed machine state';

  static flags = {
    config: Flags.string({ char: 'c', description: 'Path to baseline team-setup.json' }),
    override: Flags.string({ char: 'o', description: 'Path to local-override.json' }),
    json: Flags.boolean({ description: 'Output results in JSON format' }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(AuditCommand);

    try {
      // 1. Merge and validate config (fails fast on locked violations or Zod errors)
      const { mergedPackages, overridePackageIds } = loadAndMergeConfig({
        baselinePath: flags.config,
        overridePath: flags.override,
      });

      // 2. Validate graph topological order (fails fast on cycles)
      sortPackagesTopologically(mergedPackages);

      // 3. Retrieve installed host packages
      const installer = new WingetBackend();
      const installedSet = await installer.getInstalledPackages();

      // 4. Compute diff
      const { missingPackages, installedPackages } = computeDiff(mergedPackages, installedSet);

      if (flags.json) {
        this.log(
          JSON.stringify(
            {
              targetCount: mergedPackages.length,
              installedCount: installedPackages.length,
              missingCount: missingPackages.length,
              missingPackages: missingPackages.map((p) => p.id),
              overridePackages: overridePackageIds,
            },
            null,
            2
          )
        );
        return;
      }

      this.log(`\n======================================================`);
      this.log(`idee audit — Dev Environment Reconciliation Audit`);
      this.log(`======================================================\n`);

      this.log(`Target Packages Total: ${mergedPackages.length}`);
      this.log(`Already Installed:     ${installedPackages.length}`);
      this.log(`Missing Packages:       ${missingPackages.length}\n`);

      if (missingPackages.length > 0) {
        this.log(`[Missing Packages to Install]`);
        for (const pkg of missingPackages) {
          const isOverride = overridePackageIds.includes(pkg.id) ? ' (local override)' : '';
          this.log(` - ${pkg.id}${pkg.version ? ` @ ${pkg.version}` : ''}${isOverride}`);
        }
      } else {
        this.log(`✔ Machine environment is completely in parity with target baseline!`);
      }
    } catch (err: any) {
      this.error(err.message, { exit: 1 });
    }
  }
}
