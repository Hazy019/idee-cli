import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeConfigs } from './config-merge.js';
import { TeamSetup, LocalOverride } from './schema.js';
import { LockedFieldViolationError } from './errors.js';

test('mergeConfigs - baseline only', () => {
  const baseline: TeamSetup = {
    version: '1.0',
    packages: [
      { id: 'Git.Git', version: '2.45.0', locked: true, dependsOn: [] },
      { id: 'Node.js', version: '22.0.0', locked: false, dependsOn: [] },
    ],
  };

  const result = mergeConfigs(baseline);
  assert.equal(result.mergedPackages.length, 2);
  assert.equal(result.overridePackageIds.length, 0);
});

test('mergeConfigs - override adds new package', () => {
  const baseline: TeamSetup = {
    version: '1.0',
    packages: [{ id: 'Git.Git', version: '2.45.0', locked: true, dependsOn: [] }],
  };

  const override: LocalOverride = {
    packages: [{ id: 'Neovim.Neovim', version: '0.10.0', locked: false, dependsOn: [] }],
  };

  const result = mergeConfigs(baseline, override);
  assert.equal(result.mergedPackages.length, 2);
  assert.deepEqual(result.overridePackageIds, ['Neovim.Neovim']);
});

test('mergeConfigs - override attempts to change locked version triggers LockedFieldViolationError', () => {
  const baseline: TeamSetup = {
    version: '1.0',
    packages: [{ id: 'Git.Git', version: '2.45.0', locked: true, dependsOn: [] }],
  };

  const override: LocalOverride = {
    packages: [{ id: 'Git.Git', version: '2.46.0', locked: false, dependsOn: [] }],
  };

  assert.throws(
    () => mergeConfigs(baseline, override),
    (err: unknown) => {
      return (
        err instanceof LockedFieldViolationError &&
        err.packageId === 'Git.Git' &&
        err.field === 'version'
      );
    }
  );
});

test('mergeConfigs - override attempts to change locked dependsOn triggers LockedFieldViolationError', () => {
  const baseline: TeamSetup = {
    version: '1.0',
    packages: [{ id: 'Git.Git', version: '2.45.0', locked: true, dependsOn: [] }],
  };

  const override: LocalOverride = {
    packages: [{ id: 'Git.Git', version: '2.45.0', dependsOn: ['Node.js'], locked: false }],
  };

  assert.throws(
    () => mergeConfigs(baseline, override),
    (err: unknown) => {
      return (
        err instanceof LockedFieldViolationError &&
        err.packageId === 'Git.Git' &&
        err.field === 'dependsOn'
      );
    }
  );
});
