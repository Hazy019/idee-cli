import { generateSeedData } from '../src/lib/seed-data.js';

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Generating seed dataset...');
  const seed = generateSeedData();
  console.log(`Generated:`);
  console.log(` - Organizations: ${seed.organizations.length}`);
  console.log(` - Users:         ${seed.users.length}`);
  console.log(` - Service Tokens:${seed.serviceAccounts.length}`);
  console.log(` - Telemetry Logs:${seed.telemetryLogs.length}`);
}
