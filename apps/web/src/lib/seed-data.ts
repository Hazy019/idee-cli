import * as crypto from 'node:crypto';

export interface SeedData {
  organizations: Array<{ id: string; name: string }>;
  users: Array<{ id: string; email: string; organization_id: string }>;
  serviceAccounts: Array<{ id: string; organization_id: string; name: string; token_hash: string; expires_at: string }>;
  telemetryLogs: Array<{
    id: string;
    organization_id: string;
    machine_hash: string;
    source: 'interactive' | 'ci';
    execution_time_ms: number;
    packages_installed: string[];
    packages_skipped: string[];
    packages_failed: Array<{ id: string; reason: string }>;
    override_packages: string[];
    timestamp: string;
  }>;
}

export function generateSeedData(orgCount = 30, usersPerOrg = 35, telemetryPerOrg = 330): SeedData {
  const data: SeedData = {
    organizations: [],
    users: [],
    serviceAccounts: [],
    telemetryLogs: [],
  };

  const samplePackages = [
    'Git.Git',
    'Nodejs.Nodejs',
    'Python.Python.3.11',
    'Microsoft.VisualStudioCode',
    'Docker.DockerDesktop',
    'Neovim.Neovim',
    'GoLang.Go',
    'Rustlang.Rustup',
  ];

  for (let o = 1; o <= orgCount; o++) {
    const orgId = crypto.randomUUID();
    const orgName = `Engineering Org ${o}`;
    data.organizations.push({ id: orgId, name: orgName });

    // Seed users
    for (let u = 1; u <= usersPerOrg; u++) {
      data.users.push({
        id: crypto.randomUUID(),
        email: `dev-${u}@org-${o}.com`,
        organization_id: orgId,
      });
    }

    // Seed Service Token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (o % 2 === 0 ? 10 : 60));
    data.serviceAccounts.push({
      id: crypto.randomUUID(),
      organization_id: orgId,
      name: `CI Service Token Org ${o}`,
      token_hash: crypto.createHash('sha256').update(`service-token-${orgId}`).digest('hex'),
      expires_at: expiresAt.toISOString(),
    });

    // Seed Telemetry Logs
    for (let t = 1; t <= telemetryPerOrg; t++) {
      const isCi = t % 4 === 0;
      const installed = samplePackages.slice(0, (t % samplePackages.length) + 1);
      const skipped = samplePackages.slice((t % samplePackages.length) + 1);

      data.telemetryLogs.push({
        id: crypto.randomUUID(),
        organization_id: orgId,
        machine_hash: crypto.createHash('sha256').update(`machine-${o}-${t % 10}`).digest('hex'),
        source: isCi ? 'ci' : 'interactive',
        execution_time_ms: Math.floor(Math.random() * 4000) + 500,
        packages_installed: installed,
        packages_skipped: skipped,
        packages_failed: t % 15 === 0 ? [{ id: 'Docker.DockerDesktop', reason: 'Download timeout' }] : [],
        override_packages: t % 5 === 0 ? ['Neovim.Neovim'] : [],
        timestamp: new Date(Date.now() - t * 3600000).toISOString(),
      });
    }
  }

  return data;
}
