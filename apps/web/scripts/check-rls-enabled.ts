import * as fs from 'node:fs';
import * as path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';

test('RLS Enabled Check - Assert all application tables have ROW LEVEL SECURITY enabled', () => {
  const migrationPath = path.resolve(process.cwd(), 'supabase/migrations/00001_initial_schema.sql');
  assert.ok(fs.existsSync(migrationPath), `Migration file not found at ${migrationPath}`);

  const sqlContent = fs.readFileSync(migrationPath, 'utf-8');

  // List of required application tables
  const requiredTables = [
    'organizations',
    'users',
    'org_members',
    'service_accounts',
    'telemetry_logs',
    'audit_logs',
  ];

  for (const table of requiredTables) {
    const rlsRegex = new RegExp(
      `ALTER\\s+TABLE\\s+(?:public\\.)?${table}\\s+ENABLE\\s+ROW\\s+LEVEL\\s+SECURITY`,
      'i'
    );
    assert.ok(
      rlsRegex.test(sqlContent),
      `Table "${table}" does not have ENABLE ROW LEVEL SECURITY defined in schema migration!`
    );
  }

  // Assert append-only constraint (no UPDATE or DELETE policies on telemetry_logs and audit_logs)
  const appendOnlyTables = ['telemetry_logs', 'audit_logs'];
  for (const table of appendOnlyTables) {
    const updatePolicyRegex = new RegExp(
      `CREATE\\s+POLICY.*ON\\s+(?:public\\.)?${table}\\s+FOR\\s+(?:UPDATE|DELETE|ALL)`,
      'i'
    );
    assert.ok(
      !updatePolicyRegex.test(sqlContent),
      `Append-only table "${table}" must NOT have UPDATE, DELETE, or ALL policies!`
    );
  }
});
