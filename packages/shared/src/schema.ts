import { z } from 'zod';

export const packageIdRegex = /^[a-zA-Z0-9\.\-_]+$/;

export const PackageSchema = z.object({
  id: z
    .string()
    .min(1, 'Package ID cannot be empty')
    .regex(packageIdRegex, 'Package ID must contain only alphanumeric characters, dots, hyphens, and underscores'),
  name: z.string().optional(),
  version: z.string().optional(),
  dependsOn: z.array(z.string()).optional().default([]),
  locked: z.boolean().optional().default(false),
  source: z.string().optional(),
});

export type Package = z.infer<typeof PackageSchema>;

export const TeamSetupSchema = z.object({
  version: z.string().default('1.0'),
  name: z.string().optional(),
  packages: z.array(PackageSchema).default([]),
});

export type TeamSetup = z.infer<typeof TeamSetupSchema>;

export const LocalOverrideSchema = z.object({
  version: z.string().optional(),
  packages: z.array(PackageSchema).default([]),
});

export type LocalOverride = z.infer<typeof LocalOverrideSchema>;

export const FailedPackageSchema = z.object({
  id: z.string(),
  reason: z.string(),
  exit_code: z.number().optional(),
});

export type FailedPackage = z.infer<typeof FailedPackageSchema>;

export const TelemetryPayloadSchema = z.object({
  organization_id: z.string().optional(),
  machine_hash: z.string().min(1, 'Machine hash is required'),
  source: z.enum(['interactive', 'ci']),
  execution_time_ms: z.number().nonnegative(),
  packages_installed: z.array(z.string()),
  packages_skipped: z.array(z.string()),
  packages_failed: z.array(FailedPackageSchema),
  override_packages: z.array(z.string()),
  timestamp: z.string().datetime().optional(),
});

export type TelemetryPayload = z.infer<typeof TelemetryPayloadSchema>;

export function validateMergedConfig(packages: Package[]): Package[] {
  const errors: string[] = [];
  const seenIds = new Set<string>();

  for (const pkg of packages) {
    if (seenIds.has(pkg.id)) {
      errors.push(`Duplicate package ID found: "${pkg.id}"`);
    } else {
      seenIds.add(pkg.id);
    }
  }

  for (const pkg of packages) {
    if (pkg.dependsOn) {
      for (const depId of pkg.dependsOn) {
        if (!seenIds.has(depId)) {
          errors.push(`Package "${pkg.id}" depends on unknown package ID "${depId}"`);
        }
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(`Config validation failed:\n- ${errors.join('\n- ')}`);
  }

  return packages;
}
