import test from 'node:test';
import assert from 'node:assert/strict';
import { getRawMachineGuid, getMachineHash } from './machine-id.js';

test('machine-id - getRawMachineGuid returns non-empty string', () => {
  const rawId = getRawMachineGuid();
  assert.ok(typeof rawId === 'string');
  assert.ok(rawId.length > 0);
});

test('machine-id - getMachineHash returns 64-char hex string', () => {
  const hash = getMachineHash();
  assert.ok(typeof hash === 'string');
  assert.equal(hash.length, 64);
  assert.match(hash, /^[a-f0-9]{64}$/);
});
