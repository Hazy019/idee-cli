import { Package, TeamSetup, LocalOverride, PackageSchema, validateMergedConfig } from './schema.js';
import { LockedFieldViolationError, ConfigValidationError } from './errors.js';

function arraysEqual(a: string[] = [], b: string[] = []): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((val, index) => val === sortedB[index]);
}

export interface MergeResult {
  mergedPackages: Package[];
  overridePackageIds: string[];
}

export function mergeConfigs(
  baselineConfig: TeamSetup,
  localOverrideConfig?: LocalOverride
): MergeResult {
  const targetMap = new Map<string, Package>();
  const overridePackageIds: string[] = [];

  for (const pkg of baselineConfig.packages) {
    const parsedPkg = PackageSchema.parse(pkg);
    targetMap.set(parsedPkg.id, parsedPkg);
  }

  if (localOverrideConfig && localOverrideConfig.packages) {
    for (const rawOverridePkg of localOverrideConfig.packages) {
      const overridePkg = PackageSchema.parse(rawOverridePkg);
      const baselinePkg = targetMap.get(overridePkg.id);

      if (baselinePkg) {
        if (baselinePkg.locked) {
          if (overridePkg.version !== undefined && overridePkg.version !== baselinePkg.version) {
            throw new LockedFieldViolationError(
              baselinePkg.id,
              'version',
              baselinePkg.version,
              overridePkg.version
            );
          }

          if (
            rawOverridePkg.dependsOn !== undefined &&
            !arraysEqual(baselinePkg.dependsOn, overridePkg.dependsOn)
          ) {
            throw new LockedFieldViolationError(
              baselinePkg.id,
              'dependsOn',
              baselinePkg.dependsOn,
              overridePkg.dependsOn
            );
          }
        }

        const mergedPkg: Package = {
          ...baselinePkg,
          ...overridePkg,
          dependsOn: overridePkg.dependsOn ?? baselinePkg.dependsOn,
          locked: baselinePkg.locked,
        };
        targetMap.set(mergedPkg.id, mergedPkg);
      } else {
        targetMap.set(overridePkg.id, overridePkg);
        overridePackageIds.push(overridePkg.id);
      }
    }
  }

  const mergedPackages = Array.from(targetMap.values());

  try {
    validateMergedConfig(mergedPackages);
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new ConfigValidationError([err.message]);
    }
    throw err;
  }

  return {
    mergedPackages,
    overridePackageIds,
  };
}
