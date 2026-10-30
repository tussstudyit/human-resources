import { afterEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from './auth.service.js';

describe('Public registration role boundary', () => {
  afterEach(() => vi.unstubAllEnvs());
  it('never grants HR privileges requested by a public registrant', async () => {
    vi.stubEnv('N8N_WELCOME_WEBHOOK_URL', '');
    const create = vi.fn(async ({data}: any) => ({id:'synthetic', ...data, department:null}));
    const prisma = {user:{findUnique:vi.fn(async()=>null),create}};
    const jwt = {signAsync:vi.fn(async()=>'synthetic-token')};
    const service = new AuthService(prisma as any,jwt as any);
    const result=await service.register({email:'synthetic@example.invalid',password:'synthetic-test-only',fullName:'Synthetic',role:'HR'});
    expect(create.mock.calls[0][0].data.role).toBe('EMPLOYEE');
    expect(result.user.role).toBe('EMPLOYEE');
    expect(result.user).not.toHaveProperty('password');
  });
});
