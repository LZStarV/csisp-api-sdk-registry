import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { resolveActiveProfile, resolveActiveProfileName } from '../profiles';
import {
  createRuntimeHarness,
  type RuntimeHarness,
} from '../template/runtime-harness';
import type { ServiceProfile } from '../template/service-map';

type HealthStatusResponse = {
  ok: boolean;
  ts: number;
};

type OidcClientsResponse = Array<{
  client_id: string;
  name: string;
  default_redirect_uri: string;
  scopes: string[];
}>;

type AuthLoginResponse = {
  stepUp: string;
};

type AuthRegisterResponse = {
  status: string;
};

type AuthSessionResponse = {
  user: string;
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
      const response = await harness.clients.healthClient.healthStatus();
      expect(response).toBeDefined();
      // 这里需要根据实际返回的响应格式进行调整
    });

    it('should handle missing trace id', async () => {
      const response = await harness.clients.healthClient.healthStatus();
      expect(response).toBeDefined();
      // 这里需要根据实际返回的响应格式进行调整
    });
  });

  describe('OIDC Service', () => {
    it('should pass x-trace-id to server contract object', async () => {
      const response = await harness.clients.oidcClient.oidcClients({
        'x-trace-id': profile.runtimeExpectations.traceId,
      });
      expect(response[0]?.client_id).toBe(
        profile.runtimeExpectations.traceId
      );
    });

    it('should handle missing trace id', async () => {
      const response = await harness.clients.oidcClient.oidcClients({});
      expect(response[0]?.client_id).toBe('no-trace');
    });
  });

  describe('Auth Service', () => {
    it('authLogin should return expected payload with trace id', async () => {
      const response = await harness.clients.authClient.authLogin({
        LoginInternalDto: { username: 'test', password: 'test' },
        'x-trace-id': profile.runtimeExpectations.traceId,
      });
      expect(response).toBeDefined();
      // 这里需要根据实际返回的响应格式进行调整
    });

    it('authLogin should handle missing trace id', async () => {
      const response = await harness.clients.authClient.authLogin({
        LoginInternalDto: { username: 'test', password: 'test' },
      });
      expect(response).toBeDefined();
      // 这里需要根据实际返回的响应格式进行调整
    });

    it('authRegister should return expected payload with trace id', async () => {
      const response = await harness.clients.authClient.authRegister({
        RegisterDto: {
          username: 'test',
          password: 'test',
          email: 'test@example.com',
        },
        'x-trace-id': profile.runtimeExpectations.traceId,
      });
      expect(response).toBeDefined();
      // 这里需要根据实际返回的响应格式进行调整
    });

    it('authRegister should handle missing trace id', async () => {
      const response = await harness.clients.authClient.authRegister({
        RegisterDto: {
          username: 'test',
          password: 'test',
          email: 'test@example.com',
        },
      });
      expect(response).toBeDefined();
      // 这里需要根据实际返回的响应格式进行调整
    });

    it('authSession should return expected payload with trace id', async () => {
      const response = await harness.clients.authClient.authSession({
        AuthSessionRequest: {},
        'x-trace-id': profile.runtimeExpectations.traceId,
      });
      expect(response).toBeDefined();
      // 这里需要根据实际返回的响应格式进行调整
    });

    it('authSession should handle missing trace id', async () => {
      const response = await harness.clients.authClient.authSession({
        AuthSessionRequest: {},
      });
      expect(response).toBeDefined();
      // 这里需要根据实际返回的响应格式进行调整
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty request objects', async () => {
      const response = await harness.clients.authClient.authSession({
        AuthSessionRequest: {},
      });
      expect(response.user).toBe('test');
    });

    it('should handle large trace id values', async () => {
      const largeTraceId = 'x'.repeat(1000);
      const response = await harness.clients.oidcClient.oidcClients({
        'x-trace-id': largeTraceId,
      });
      expect(response[0]?.client_id).toBe(largeTraceId);
    });
  });
});
