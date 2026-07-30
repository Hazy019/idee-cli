import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';

test('RLS Performance Verification - Assert B-Tree Indexes and STABLE Security Definer Helper', () => {
  const migrationPath = path.resolve(process.cwd(), 'supabase/migrations/00001_initial_schema.sql');
  assert.ok(fs.existsSync(migrationPath), 'Schema migration file must exist');

  const sql = fs.readFileSync(migrationPath, 'utf-8');

  // 1. Verify B-Tree index definitions for RLS columns
  const requiredIndexes = [
    'idx_telemetry_org_id',
    'idx_org_members_user_id',
    'idx_org_members_org_id',
    'idx_service_accounts_org_id',
  ];

  for (const idx of requiredIndexes) {
    assert.ok(
      sql.includes(idx),
      `Required index "${idx}" is missing from schema migration!`
    );
  }

  // 2. Verify STABLE SECURITY DEFINER helper function
  assert.ok(
    sql.includes('private.user_org_ids()'),
    'Helper function private.user_org_ids() must be defined'
  );
  assert.ok(
    sql.includes('SECURITY DEFINER'),
    'Helper function must specify SECURITY DEFINER'
  );
  assert.ok(
    sql.includes('STABLE'),
    'Helper function must specify STABLE for query plan caching'
  );
  assert.ok(
    sql.includes("SET search_path = ''"),
    "Helper function must pin search_path = '' for security"
  );
});
