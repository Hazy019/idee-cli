import test from 'node:test';
import assert from 'node:assert/strict';
import { sortPackagesTopologically } from './dag.js';
import { Package } from './schema.js';
import { CircularDependencyError, MissingDependencyError } from './errors.js';

test('sortPackagesTopologically - empty graph', () => {
  const result = sortPackagesTopologically([]);
  assert.deepEqual(result, []);
});

test('sortPackagesTopologically - linear chain (C depends on B, B depends on A)', () => {
  const packages: Package[] = [
    { id: 'pkg.C', dependsOn: ['pkg.B'], locked: false },
    { id: 'pkg.B', dependsOn: ['pkg.A'], locked: false },
    { id: 'pkg.A', dependsOn: [], locked: false },
  ];

  const sorted = sortPackagesTopologically(packages);
  const ids = sorted.map((p) => p.id);
  assert.deepEqual(ids, ['pkg.A', 'pkg.B', 'pkg.C']);
});

test('sortPackagesTopologically - diamond dependency (D depends on B and C; B and C depend on A)', () => {
  const packages: Package[] = [
    { id: 'pkg.D', dependsOn: ['pkg.B', 'pkg.C'], locked: false },
    { id: 'pkg.B', dependsOn: ['pkg.A'], locked: false },
    { id: 'pkg.C', dependsOn: ['pkg.A'], locked: false },
    { id: 'pkg.A', dependsOn: [], locked: false },
  ];

  const sorted = sortPackagesTopologically(packages);
  const ids = sorted.map((p) => p.id);

  assert.equal(ids[0], 'pkg.A');
  assert.equal(ids[3], 'pkg.D');
  assert.ok(ids.indexOf('pkg.A') < ids.indexOf('pkg.B'));
  assert.ok(ids.indexOf('pkg.A') < ids.indexOf('pkg.C'));
  assert.ok(ids.indexOf('pkg.B') < ids.indexOf('pkg.D'));
  assert.ok(ids.indexOf('pkg.C') < ids.indexOf('pkg.D'));
});

test('sortPackagesTopologically - disconnected components', () => {
  const packages: Package[] = [
    { id: 'pkg.B', dependsOn: ['pkg.A'], locked: false },
    { id: 'pkg.A', dependsOn: [], locked: false },
    { id: 'pkg.D', dependsOn: ['pkg.C'], locked: false },
    { id: 'pkg.C', dependsOn: [], locked: false },
  ];

  const sorted = sortPackagesTopologically(packages);
  const ids = sorted.map((p) => p.id);

  assert.ok(ids.indexOf('pkg.A') < ids.indexOf('pkg.B'));
  assert.ok(ids.indexOf('pkg.C') < ids.indexOf('pkg.D'));
});

test('sortPackagesTopologically - self-referencing node', () => {
  const packages: Package[] = [
    { id: 'pkg.A', dependsOn: ['pkg.A'], locked: false },
  ];

  assert.throws(
    () => sortPackagesTopologically(packages),
    (err: unknown) => {
      return err instanceof CircularDependencyError && err.unresolvedIds.includes('pkg.A');
    }
  );
});

test('sortPackagesTopologically - 2-node cycle (A depends on B, B depends on A)', () => {
  const packages: Package[] = [
    { id: 'pkg.A', dependsOn: ['pkg.B'], locked: false },
    { id: 'pkg.B', dependsOn: ['pkg.A'], locked: false },
  ];

  assert.throws(
    () => sortPackagesTopologically(packages),
    (err: unknown) => {
      return (
        err instanceof CircularDependencyError &&
        err.unresolvedIds.includes('pkg.A') &&
        err.unresolvedIds.includes('pkg.B')
      );
    }
  );
});

test('sortPackagesTopologically - 3-node cycle (A -> B -> C -> A)', () => {
  const packages: Package[] = [
    { id: 'pkg.A', dependsOn: ['pkg.C'], locked: false },
    { id: 'pkg.B', dependsOn: ['pkg.A'], locked: false },
    { id: 'pkg.C', dependsOn: ['pkg.B'], locked: false },
  ];

  assert.throws(
    () => sortPackagesTopologically(packages),
    (err: unknown) => {
      return (
        err instanceof CircularDependencyError &&
        err.unresolvedIds.length === 3
      );
    }
  );
});

test('sortPackagesTopologically - missing dependency reference', () => {
  const packages: Package[] = [
    { id: 'pkg.A', dependsOn: ['pkg.UNKNOWN'], locked: false },
  ];

  assert.throws(
    () => sortPackagesTopologically(packages),
    (err: unknown) => {
      return err instanceof MissingDependencyError && err.missingDependencyId === 'pkg.UNKNOWN';
    }
  );
});
