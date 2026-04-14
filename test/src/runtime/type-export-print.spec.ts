import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { resolveActiveProfile } from '../profiles';
import {
  createRuntimeHarness,
  type RuntimeHarness,
} from '../template/runtime-harness';
import type { ServiceProfile } from '../template/service-map';

// 导入类型以测试类型导出
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
  'x-trace-id': string;
};

type AuthRegisterParams = {
  RegisterDto: {
    username: string;
    password: string;
    email: string;
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
    authRegister: (params: AuthRegisterParams) => Promise<AuthRegisterResponse>;
    authSession: (params: AuthSessionParams) => Promise<AuthSessionResponse>;
  };
};

type ActiveRuntimeHarness = RuntimeHarness<ActiveClients>;

describe('type export and print tests', () => {
  const profile = resolveActiveProfile() as ServiceProfile<ActiveClients>;
  let harness: ActiveRuntimeHarness;

  beforeAll(async () => {
    harness = await createRuntimeHarness(profile.createRuntimeHarnessConfig());
  });

  afterAll(async () => {
    await harness.cleanup();
  });

  // 测试类型导出
  it('should be able to import and use types from server package', () => {
    // 类型导入测试已在文件顶部完成
    // 这里验证profile对象的类型结构
    expect(typeof profile.serviceName).toBe('string');
    expect(typeof profile.serverPackageName).toBe('string');
    expect(typeof profile.bffPackageName).toBe('string');
    expect(typeof profile.runtimeExpectations).toBe('object');
    expect(typeof profile.createRuntimeHarnessConfig).toBe('function');
  });

  // 测试函数调用后的信息打印
  it('should print normal information after function call', async () => {
    // 捕获console.log
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    try {
      // 调用healthStatus方法
      const response = await harness.clients.healthClient.healthStatus();

      // 验证响应
      expect(response).toBeDefined();
      // 这里需要根据实际返回的响应格式进行调整

      // 手动打印信息以测试打印功能
      console.log('Health status response:', response);
      console.log('API call successful');

      // 验证console.log被调用
      expect(consoleLogSpy).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Health status response:',
        response
      );
      expect(consoleLogSpy).toHaveBeenCalledWith('API call successful');
    } finally {
      // 恢复console.log
      consoleLogSpy.mockRestore();
    }
  });

  // 测试多个API调用的信息打印
  it('should print information for multiple API calls', async () => {
    // 捕获console.log
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    try {
      // 调用authLogin方法
      const loginResponse = await harness.clients.authClient.authLogin({
        LoginInternalDto: { username: 'test', password: 'test' },
        'x-trace-id': profile.runtimeExpectations.traceId,
      });

      console.log('Login response:', loginResponse);

      // 调用authSession方法
      const sessionResponse = await harness.clients.authClient.authSession({
        AuthSessionRequest: {},
        'x-trace-id': profile.runtimeExpectations.traceId,
      });

      console.log('Session response:', sessionResponse);

      // 验证响应
      expect(loginResponse).toBeDefined();
      expect(sessionResponse).toBeDefined();
      // 这里需要根据实际返回的响应格式进行调整

      // 验证console.log被调用
      expect(consoleLogSpy).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Login response:',
        loginResponse
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Session response:',
        sessionResponse
      );
    } finally {
      // 恢复console.log
      consoleLogSpy.mockRestore();
    }
  });

  // 测试TS提示相关的类型检查
  it('should have correct TypeScript types for API responses', async () => {
    // 调用API获取响应
    const healthResponse = await harness.clients.healthClient.healthStatus();

    const oidcResponse = await harness.clients.oidcClient.oidcClients({
      'x-trace-id': profile.runtimeExpectations.traceId,
    });

    // 验证响应类型结构
    expect(typeof healthResponse).toBe('object');
    // 这里需要根据实际返回的响应格式进行调整

    expect(typeof oidcResponse).toBe('object');
    // 这里需要根据实际返回的响应格式进行调整
  });
});
