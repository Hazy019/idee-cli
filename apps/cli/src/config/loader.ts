import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {
  TeamSetupSchema,
  LocalOverrideSchema,
  mergeConfigs,
  TeamSetup,
  LocalOverride,
  MergeResult,
  LockedFieldViolationError,
  ConfigValidationError,
} from '@idee-cli/shared';

export interface LoadConfigOptions {
  baselinePath?: string;
  overridePath?: string;
}

export function loadAndMergeConfig(options: LoadConfigOptions = {}): MergeResult {
  const baselineFile = options.baselinePath || path.resolve(process.cwd(), 'team-setup.json');
  const overrideFile =
    options.overridePath || path.join(os.homedir(), '.ideefy', 'local-override.json');

  if (!fs.existsSync(baselineFile)) {
    throw new Error(`Baseline config file not found: ${baselineFile}`);
  }

  let baselineData: TeamSetup;
  try {
    const rawBaseline = fs.readFileSync(baselineFile, 'utf-8');
    baselineData = TeamSetupSchema.parse(JSON.parse(rawBaseline));
  } catch (err: any) {
    throw new Error(`Failed to parse baseline config "${baselineFile}": ${err.message}`);
  }

  let overrideData: LocalOverride | undefined;
  if (fs.existsSync(overrideFile)) {
    try {
      const rawOverride = fs.readFileSync(overrideFile, 'utf-8');
      overrideData = LocalOverrideSchema.parse(JSON.parse(rawOverride));
    } catch (err: any) {
      throw new Error(`Failed to parse local override config "${overrideFile}": ${err.message}`);
    }
  }

  try {
    return mergeConfigs(baselineData, overrideData);
  } catch (err: unknown) {
    if (err instanceof LockedFieldViolationError || err instanceof ConfigValidationError) {
      // Re-throw for clean CLI error formatting
      throw err;
    }
    throw err;
  }
}
