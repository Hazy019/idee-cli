import test from 'node:test';
import assert from 'node:assert/strict';
import { WingetBackend } from './winget.js';

test('WingetBackend - instantiation and method signatures', () => {
  const backend = new WingetBackend();
  assert.equal(backend.name, 'winget');
});

test('WingetBackend - map exit code to reason', () => {
  const backend = new WingetBackend();

  // Access private method for testing via (backend as any)
  const fn = (backend as any).mapExitCodeToReason.bind(backend);

  assert.equal(fn(0, ''), 'Success');
  assert.equal(fn(-1978335189, ''), 'Package is already installed'); // 0x8920000B
  assert.equal(fn(-1978335188, ''), 'Package not found in sources'); // 0x8920000C
  assert.equal(fn(-1978335212, ''), 'Package is already installed'); // 0x89200014
  assert.equal(fn(-1978335228, ''), 'Source agreement required'); // 0x89200004
});
