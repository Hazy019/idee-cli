import { Command, Flags } from '@oclif/core';
import {
  computeDiff,
  sortPackagesTopologically,
  FailedPackage,
  TelemetryPayload,
} from '@idee-cli/shared';
import { loadAndMergeConfig } from '../config/loader.js';
import { WingetBackend } from '../installer/winget.js';
import { resolveAuthToken } from '../auth/device-flow.js';
import { sendTelemetry } from '../telemetry/client.js';

export default class ApplyCommand extends Command {
  static description = 'Execute dev environment reconciliation loop (install missing packages)';

  static flags = {
    config: Flags.string({ char: 'c', description: 'Path to baseline team-setup.json' }),
    override: Flags.string({ char: 'o', description: 'Path to local-override.json' }),
    'dry-run': Flags.boolean({ description: 'Resolve and print queue without installing packages' }),
    json: Flags.boolean({ description: 'Output machine-readable JSON result' }),
    'no-telemetry': Flags.boolean({ description: 'Skip posting telemetry report to dashboard' }),
    'dashboard-url': Flags.string({ description: 'Custom dashboard server URL', env: 'IDEE_DASHBOARD_URL' }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(ApplyCommand);
    const startTime = Date.now();

    try {
      // 1. Pre-flight config validation & merge (fails fast before any process spawns)
      const { mergedPackages, overridePackageIds } = loadAndMergeConfig({
        baselinePath: flags.config,
        overridePath: flags.override,
      });

      // 2. Topological sort (fails fast on circular dependencies)
      const sortedQueue = sortPackagesTopologically(mergedPackages);

      // 3. Inspect current host state
      const installer = new WingetBackend();
      const installedSet = await installer.getInstalledPackages();

      const { missingPackages, installedPackages } = computeDiff(sortedQueue, installedSet);

      if (flags['dry-run']) {
        this.log('[DRY-RUN] Execution plan calculated. No packages will be installed.');
        this.log(`Missing packages: ${missingPackages.map((p) => p.id).join(', ') || 'None'}`);
        return;
      }

      const installedCountBefore = installedPackages.length;
      const newlyInstalled: string[] = [];
      const skipped: string[] = installedPackages.map((p) => p.id);
      const failed: FailedPackage[] = [];

      this.log(`\n======================================================`);
      this.log(`idee apply — Dev Environment Reconciliation Loop`);
      this.log(`======================================================\n`);
      this.log(`Target: ${mergedPackages.length} packages | Skipped (already installed): ${skipped.length}`);
      this.log(`Queue: ${missingPackages.length} packages to install\n`);

      // 4. Sequential execution (partial failure does NOT abort queue)
      for (const pkg of missingPackages) {
        this.log(`Installing [${pkg.id}]...`);
        const result = await installer.installPackage(pkg.id, { version: pkg.version });

        if (result.success) {
          this.log(` ✔ [${pkg.id}] Installed successfully.`);
          newlyInstalled.push(pkg.id);
        } else {
          this.warn(` ✖ [${pkg.id}] Failed: ${result.errorReason || result.stderr}`);
          failed.push({
            id: pkg.id,
            reason: result.errorReason || result.stderr || 'Unknown installation error',
            exit_code: result.exitCode,
          });
        }
      }

      const executionTimeMs = Date.now() - startTime;

      // 5. Summary reporting
      if (!flags.json) {
        this.log(`\n======================================================`);
        this.log(`Reconciliation Complete (${(executionTimeMs / 1000).toFixed(2)}s)`);
        this.log(`======================================================`);
        this.log(`Newly Installed: ${newlyInstalled.length}`);
        this.log(`Skipped:         ${skipped.length}`);
        this.log(`Failed:          ${failed.length}`);

        if (failed.length > 0) {
          this.log(`\n[Failed Packages]`);
          failed.forEach((f) => this.log(` - ${f.id}: ${f.reason} (exit code: ${f.exit_code ?? 'N/A'})`));
        }
      } else {
        this.log(
          JSON.stringify(
            {
              success: failed.length === 0,
              executionTimeMs,
              newlyInstalled,
              skipped,
              failed,
            },
            null,
            2
          )
        );
      }

      // 6. Telemetry transmission
      if (!flags['no-telemetry']) {
        try {
          const auth = resolveAuthToken();
          const dashboardUrl = flags['dashboard-url'] || process.env.IDEE_DASHBOARD_URL || 'http://localhost:3000';

          const telemetryPayload: TelemetryPayload = {
            machine_hash: auth.machineHash,
            source: auth.source,
            execution_time_ms: executionTimeMs,
            packages_installed: newlyInstalled,
            packages_skipped: skipped,
            packages_failed: failed,
            override_packages: overridePackageIds,
            timestamp: new Date().toISOString(),
          };

          this.log(`Sending telemetry report to ${dashboardUrl}...`);
          await sendTelemetry(telemetryPayload, auth.token, dashboardUrl);
        } catch (authErr: any) {
          this.warn(`Telemetry skipped: ${authErr.message}`);
        }
      }

      if (failed.length > 0) {
        this.error(`${failed.length} package(s) failed during execution loop.`, { exit: 1 });
      }
    } catch (err: any) {
      this.error(err.message, { exit: 1 });
    }
  }
}
