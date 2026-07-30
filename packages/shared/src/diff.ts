import { Package } from './schema.js';

export interface DiffResult {
  missingPackages: Package[];
  installedPackages: Package[];
}

export function computeDiff(
  targetPackages: Package[],
  installedPackageIds: Set<string>
): DiffResult {
  const missingPackages: Package[] = [];
  const installedPackages: Package[] = [];

  for (const pkg of targetPackages) {
    if (installedPackageIds.has(pkg.id)) {
      installedPackages.push(pkg);
    } else {
      missingPackages.push(pkg);
    }
  }

  return {
    missingPackages,
    installedPackages,
  };
}
