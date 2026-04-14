import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { resolveActiveProfile } from '../profiles';
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

type AuthSessionResponse = {
  user: string;
};

type AuthLoginParams = {
  LoginInternalDto: {
    username: string;
    password: string;
  };
  'x-trace-id': string;
};

type AuthSessionParams = {
  AuthSessionRequest: Record<string, never>;
  'x-trace-id': string;
};

type ActiveClients = {
  healthClient: {
    healthStatus: () => Promise<HealthStatusResponse>;
  };
  oidcClient: {
    oidcClients: (params: {
      'x-trace-id': string;
    }) => Promise<OidcClientsResponse>;
  };
  authClient: {
    authLogin: (params: AuthLoginParams) => Promise<AuthLoginResponse>;
    authSession: (params: AuthSessionParams) => Promise<AuthSessionResponse>;
  };
};

type ActiveRuntimeHarness = RuntimeHarness<ActiveClients>;

describe('performance and security tests', () => {
  const profile = resolveActiveProfile() as ServiceProfile<ActiveClients>;
  let harness: ActiveRuntimeHarness;

  beforeAll(async () => {
    harness = await createRuntimeHarness(profile.createRuntimeHarnessConfig());
  });

  afterAll(async () => {
    await harness.cleanup();
  });

  // 性能测试
  it('healthStatus should respond within 100ms', async () => {
    const startTime = Date.now();
    await harness.clients.healthClient.healthStatus();
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    expect(responseTime).toBeLessThan(100);
  });

  it('oidcClients should respond within 200ms', async () => {
    const startTime = Date.now();
    await harness.clients.oidcClient.oidcClients({
      'x-trace-id': profile.runtimeExpectations.traceId,
    });
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    expect(responseTime).toBeLessThan(200);
  });

  it('authLogin should respond within 300ms', async () => {
    const startTime = Date.now();
    await harness.clients.authClient.authLogin({
      LoginInternalDto: { username: 'test', password: 'test' },
      'x-trace-id': profile.runtimeExpectations.traceId,
    });
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    expect(responseTime).toBeLessThan(300);
  });

  // 安全测试
  it('should handle malicious input in trace id', async () => {
    const maliciousTraceId = '<script>alert("XSS")</script>';
    const response = await harness.clients.oidcClient.oidcClients({
      'x-trace-id': maliciousTraceId,
    });
    expect(response).toBeDefined();
    // 确保没有执行脚本，只是作为字符串处理
  });

  it('should handle large number of concurrent requests', async () => {
    const requestCount = 10;
    const requests = [];

    for (let i = 0; i < requestCount; i++) {
      requests.push(
        harness.clients.healthClient.healthStatus()
      );
    }

    const responses = await Promise.all(requests);
    expect(responses.length).toBe(requestCount);
    responses.forEach(response => {
      expect(response).toBeDefined();
      // 这里需要根据实际返回的响应格式进行调整
    });
  });
});
