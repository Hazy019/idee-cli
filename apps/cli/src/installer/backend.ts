export interface InstallResult {
  packageId: string;
  success: boolean;
  exitCode?: number;
  stdout: string;
  stderr: string;
  errorReason?: string;
}

export interface InstallerBackend {
  name: string;
  getInstalledPackages(): Promise<Set<string>>;
  isPackageInstalled(id: string): Promise<boolean>;
  installPackage(id: string, options?: { version?: string }): Promise<InstallResult>;
}
