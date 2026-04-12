import { firstValueFrom } from 'rxjs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { resolveActiveProfile, resolveActiveProfileName } from '../profiles';
import {
  createRuntimeHarness,
  type RuntimeHarness,
} from '../template/runtime-harness';
import type { ServiceProfile } from '../template/service-map';

type HealthStatusResponse = {
  status: number;
  data: {
    ok: boolean;
    ts: number;
  };
};

type OidcClientsResponse = {
  status: number;
  data: Array<{
    client_id: string;
    name: string;
    default_redirect_uri: string;
    scopes: string[];
  }>;
};

type AuthLoginResponse = {
  status: number;
  data: {
    stepUp: string;
  };
};

type AuthRegisterResponse = {
  status: number;
  data: {
    status: string;
  };
};

type AuthSessionResponse = {
  status: number;
  data: {
    user: string;
  };
};

type AuthLoginParams = {
  LoginInternalDto: {
    username: string;
    password: string;
  };
  'x-trace-id'?: string;
};

type AuthRegisterParams = {
  RegisterDto: {
    username: string;
    password: string;
    email: string;
  };
  'x-trace-id'?: string;
};

type AuthSessionParams = {
  AuthSessionRequest: Record<string, never>;
  'x-trace-id'?: string;
};

type ActiveClients = {
  healthClient: {
    healthStatus: () => Promise<HealthStatusResponse>;
  };
  oidcClient: {
    oidcClients: (params: {
      'x-trace-id'?: string;
    }) => Promise<OidcClientsResponse>;
  };
  authClient: {
    authLogin: (params: AuthLoginParams) => Promise<AuthLoginResponse>;
    authRegister: (params: AuthRegisterParams) => Promise<AuthRegisterResponse>;
    authSession: (params: AuthSessionParams) => Promise<AuthSessionResponse>;
  };
};

type ActiveRuntimeHarness = RuntimeHarness<ActiveClients>;

describe('BFF -> Server Runtime Smoke Tests', () => {
  const profile = resolveActiveProfile() as ServiceProfile<ActiveClients>;
  const profileName = resolveActiveProfileName();
  let harness: ActiveRuntimeHarness;

  beforeAll(async () => {
    harness = await createRuntimeHarness(profile.createRuntimeHarnessConfig());
  });

  afterAll(async () => {
    await harness.cleanup();
  });

  describe('Profile Resolution', () => {
    it('should resolve active profile', () => {
      expect(profileName.length).toBeGreaterThan(0);
    });
  });

  describe('Health Service', () => {
    it('should return expected payload through bff client', async () => {
      const response = await firstValueFrom(
        harness.clients.healthClient.healthStatus()
      );
      expect(response.status).toBe(
        profile.runtimeExpectations.healthStatusCode
      );
      expect(response.data.ok).toBe(true);
      expect(typeof response.data.ts).toBe('number');
    });

    it('should handle missing trace id', async () => {
      const response = await firstValueFrom(
        harness.clients.healthClient.healthStatus()
      );
      expect(response.status).toBe(
        profile.runtimeExpectations.healthStatusCode
      );
      expect(response.data.ok).toBe(true);
    });
  });

  describe('OIDC Service', () => {
    it('should pass x-trace-id to server contract object', async () => {
      const response = await firstValueFrom(
        harness.clients.oidcClient.oidcClients({
          'x-trace-id': profile.runtimeExpectations.traceId,
        })
      );
      expect(response.status).toBe(
        profile.runtimeExpectations.oidcClientsStatusCode
      );
      expect(response.data[0]?.client_id).toBe(
        profile.runtimeExpectations.traceId
      );
    });

    it('should handle missing trace id', async () => {
      const response = await firstValueFrom(
        harness.clients.oidcClient.oidcClients({})
      );
      expect(response.status).toBe(
        profile.runtimeExpectations.oidcClientsStatusCode
      );
      expect(response.data[0]?.client_id).toBe('no-trace');
    });
  });

  describe('Auth Service', () => {
    it('authLogin should return expected payload with trace id', async () => {
      const response = await firstValueFrom(
        harness.clients.authClient.authLogin({
          LoginInternalDto: { username: 'test', password: 'test' },
          'x-trace-id': profile.runtimeExpectations.traceId,
        })
      );
      expect(response.data.stepUp).toBe('PENDING_PASSWORD');
    });

    it('authLogin should handle missing trace id', async () => {
      const response = await firstValueFrom(
        harness.clients.authClient.authLogin({
          LoginInternalDto: { username: 'test', password: 'test' },
        })
      );
      expect(response.data.stepUp).toBe('PENDING_PASSWORD');
    });

    it('authRegister should return expected payload with trace id', async () => {
      const response = await firstValueFrom(
        harness.clients.authClient.authRegister({
          RegisterDto: {
            username: 'test',
            password: 'test',
            email: 'test@example.com',
          },
          'x-trace-id': profile.runtimeExpectations.traceId,
        })
      );
      expect(response.data.status).toBe('ok');
    });

    it('authRegister should handle missing trace id', async () => {
      const response = await firstValueFrom(
        harness.clients.authClient.authRegister({
          RegisterDto: {
            username: 'test',
            password: 'test',
            email: 'test@example.com',
          },
        })
      );
      expect(response.data.status).toBe('ok');
    });

    it('authSession should return expected payload with trace id', async () => {
      const response = await firstValueFrom(
        harness.clients.authClient.authSession({
          AuthSessionRequest: {},
          'x-trace-id': profile.runtimeExpectations.traceId,
        })
      );
      expect(response.data.user).toBe('test');
    });

    it('authSession should handle missing trace id', async () => {
      const response = await firstValueFrom(
        harness.clients.authClient.authSession({
          AuthSessionRequest: {},
        })
      );
      expect(response.data.user).toBe('test');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty request objects', async () => {
      const response = await firstValueFrom(
        harness.clients.authClient.authSession({
          AuthSessionRequest: {},
        })
      );
      expect(response.data.user).toBe('test');
    });

    it('should handle large trace id values', async () => {
      const largeTraceId = 'x'.repeat(1000);
      const response = await firstValueFrom(
        harness.clients.oidcClient.oidcClients({
          'x-trace-id': largeTraceId,
        })
      );
      expect(response.data[0]?.client_id).toBe(largeTraceId);
    });
  });
});
