import { Command, Flags } from '@oclif/core';
import { computeDiff, sortPackagesTopologically } from '@idee-cli/shared';
import { loadAndMergeConfig } from '../config/loader.js';
import { WingetBackend } from '../installer/winget.js';

export default class PlanCommand extends Command {
  static description = 'Resolve and print the execution queue in topological dependency order (dry-run)';

  static flags = {
    config: Flags.string({ char: 'c', description: 'Path to baseline team-setup.json' }),
    override: Flags.string({ char: 'o', description: 'Path to local-override.json' }),
    json: Flags.boolean({ description: 'Output execution queue in JSON format' }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(PlanCommand);

    try {
      const { mergedPackages, overridePackageIds } = loadAndMergeConfig({
        baselinePath: flags.config,
        overridePath: flags.override,
      });

      // Topological sort will throw CircularDependencyError on cycle
      const sortedQueue = sortPackagesTopologically(mergedPackages);

      const installer = new WingetBackend();
      const installedSet = await installer.getInstalledPackages();

      const { missingPackages } = computeDiff(sortedQueue, installedSet);

      if (flags.json) {
        this.log(
          JSON.stringify(
            {
              executionQueue: missingPackages.map((p) => ({
                id: p.id,
                version: p.version,
                dependsOn: p.dependsOn,
                isOverride: overridePackageIds.includes(p.id),
              })),
            },
            null,
            2
          )
        );
        return;
      }

      this.log(`\n======================================================`);
      this.log(`idee plan — Dependency Topological Execution Plan`);
      this.log(`======================================================\n`);

      if (missingPackages.length === 0) {
        this.log(`No missing packages. Execution queue is empty.`);
        return;
      }

      this.log(`Resolved Queue (${missingPackages.length} packages in dependency order):\n`);
      missingPackages.forEach((pkg, index) => {
        const deps = pkg.dependsOn && pkg.dependsOn.length > 0 ? ` (depends on: ${pkg.dependsOn.join(', ')})` : '';
        const isOverride = overridePackageIds.includes(pkg.id) ? ' [local override]' : '';
        this.log(` ${index + 1}. ${pkg.id}${pkg.version ? `@${pkg.version}` : ''}${deps}${isOverride}`);
      });
    } catch (err: any) {
      this.error(err.message, { exit: 1 });
    }
  }
}
