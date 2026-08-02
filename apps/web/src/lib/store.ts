import { SeedData } from './seed-data';

class InMemoryStore {
  private data: SeedData;
  private deviceSessions = new Map<
    string,
    { deviceCode: string; userCode: string; machineHash: string; status: 'pending' | 'approved'; expiresAt: number }
  >();

  constructor() {
    this.data = {
      organizations: [
        {
          id: '00000000-0000-0000-0000-000000000001',
          name: 'Engineering Org',
          slug: 'engineering-org',
          created_at: new Date().toISOString(),
        },
      ],
      users: [],
      machines: [],
      telemetryLogs: [],
      serviceAccounts: [
        {
          id: 'sa-1',
          name: 'GitHub Actions CI Main Runner',
          token_hash: 'st_8a7f901...3b9',
          expires_at: new Date(Date.now() + 45 * 86400000).toISOString(),
          status: 'active',
          daysUntilExpiry: 45,
        },
      ],
      auditLogs: [],
    };
  }

  public getTelemetryLogs() {
    return this.data.telemetryLogs;
  }

  public getServiceAccounts() {
    return this.data.serviceAccounts;
  }

  public getOrganizations() {
    return this.data.organizations;
  }

  public addTelemetry(log: any) {
    this.data.telemetryLogs.unshift(log);
  }

  public createDeviceSession(machineHash: string) {
    const deviceCode = Math.random().toString(36).substring(2, 15);
    const userCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 600000;

    const session = { deviceCode, userCode, machineHash, status: 'pending' as const, expiresAt };
    this.deviceSessions.set(deviceCode, session);
    this.deviceSessions.set(userCode, session);
    return session;
  }

  public approveDeviceSession(userCode: string) {
    const session = this.deviceSessions.get(userCode);
    if (session) {
      session.status = 'approved';
      return true;
    }
    return false;
  }

  public checkDeviceSession(deviceCode: string) {
    return this.deviceSessions.get(deviceCode);
  }

  public revokeServiceAccount(id: string) {
    this.data.serviceAccounts = this.data.serviceAccounts.filter((s) => s.id !== id);
  }

  public addServiceAccount(sa: any) {
    this.data.serviceAccounts.unshift(sa);
  }
}

export const globalStore = new InMemoryStore();
