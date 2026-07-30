import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { InstallerBackend, InstallResult } from './backend.js';

const execFileAsync = promisify(execFile);
const MAX_BUFFER = 10 * 1024 * 1024; // 10MB explicit buffer

export class WingetBackend implements InstallerBackend {
  public readonly name = 'winget';
  private wingetPath: string;

  constructor(wingetPath = 'winget.exe') {
    this.wingetPath = wingetPath;
  }

  public async getInstalledPackages(): Promise<Set<string>> {
    const installedIds = new Set<string>();
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'idee-winget-'));
    const exportFile = path.join(tempDir, 'installed.json');

    try {
      await execFileAsync(
        this.wingetPath,
        ['export', '-o', exportFile, '--accept-source-agreements'],
        {
          maxBuffer: MAX_BUFFER,
          windowsHide: true,
        }
      );

      if (fs.existsSync(exportFile)) {
        const rawContent = fs.readFileSync(exportFile, 'utf-8');
        const exportData = JSON.parse(rawContent);

        if (exportData.Sources && Array.isArray(exportData.Sources)) {
          for (const source of exportData.Sources) {
            if (source.Packages && Array.isArray(source.Packages)) {
              for (const pkg of source.Packages) {
                if (pkg.PackageIdentifier) {
                  installedIds.add(pkg.PackageIdentifier);
                }
              }
            }
          }
        }
      }
    } catch {
      // Fallback cleanly if winget export fails
    } finally {
      try {
        if (fs.existsSync(exportFile)) {
          fs.unlinkSync(exportFile);
        }
        fs.rmdirSync(tempDir);
      } catch {
        // Ignore cleanup error
      }
    }

    return installedIds;
  }

  public async isPackageInstalled(id: string): Promise<boolean> {
    try {
      const { stdout } = await execFileAsync(
        this.wingetPath,
        ['list', '--id', id, '-e'],
        {
          maxBuffer: MAX_BUFFER,
          windowsHide: true,
        }
      );
      return stdout.includes(id);
    } catch {
      return false;
    }
  }

  public async installPackage(
    id: string,
    options?: { version?: string }
  ): Promise<InstallResult> {
    const args = [
      'install',
      '--id',
      id,
      '--exact',
      '--silent',
      '--accept-package-agreements',
      '--accept-source-agreements',
      '--disable-interactivity',
    ];

    if (options?.version) {
      args.push('--version', options.version);
    }

    try {
      const { stdout, stderr } = await execFileAsync(this.wingetPath, args, {
        maxBuffer: MAX_BUFFER,
        windowsHide: true,
      });

      return {
        packageId: id,
        success: true,
        exitCode: 0,
        stdout: stdout.toString(),
        stderr: stderr.toString(),
      };
    } catch (err: any) {
      const exitCode = err.code ?? err.exitCode;
      const stdout = err.stdout ? err.stdout.toString() : '';
      const stderr = err.stderr ? err.stderr.toString() : err.message || '';
      const errorReason = this.mapExitCodeToReason(exitCode, stderr);

      return {
        packageId: id,
        success: false,
        exitCode,
        stdout,
        stderr,
        errorReason,
      };
    }
  }

  private mapExitCodeToReason(exitCode?: number, stderr: string = ''): string {
    if (exitCode === undefined) {
      return 'Unknown error during execution';
    }

    const uExitCode = exitCode < 0 ? exitCode >>> 0 : exitCode;
    const hexCode = uExitCode.toString(16).toLowerCase();

    if (uExitCode === 0) return 'Success';

    if (
      hexCode.endsWith('000b') ||
      uExitCode === 2156396555 ||
      uExitCode === 2316632075 ||
      exitCode === -1978335189 ||
      exitCode === -1978335221 ||
      exitCode === -2138570741
    ) {
      return 'Package is already installed';
    }
    if (
      hexCode.endsWith('000c') ||
      uExitCode === 2156396556 ||
      uExitCode === 2316632076 ||
      exitCode === -1978335188 ||
      exitCode === -1978335220
    ) {
      return 'Package not found in sources';
    }
    if (
      hexCode.endsWith('0004') ||
      uExitCode === 2156396548 ||
      uExitCode === 2316632068 ||
      exitCode === -1978335212 ||
      exitCode === -1978335228
    ) {
      return 'Source agreement required';
    }
    if (
      hexCode.endsWith('0019') ||
      uExitCode === 2156396569 ||
      uExitCode === 2316632089 ||
      exitCode === -1978335175 ||
      exitCode === -1978335207
    ) {
      return 'Installer execution failed';
    }
    if (hexCode.endsWith('0020')) {
      return 'Download failed';
    }

    const trimmedErr = (stderr || '').slice(0, 100).trim();
    return `Winget failed with exit code ${exitCode}${trimmedErr ? ` (${trimmedErr})` : ''}`;
  }
}
