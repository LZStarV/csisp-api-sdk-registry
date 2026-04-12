import {
  Configuration,
  HealthService,
  OidcService,
  AuthService,
} from '@csisp-api/bff-idp-server';
import { ApiModule, AuthApi, HealthApi, OidcApi } from '@csisp-api/idp-server';
import type { ServiceProfile } from '@csisp-api/test-template/src/template/service-map';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
class TestAuthApi extends AuthApi {
  authCreateExchangeCode(): { exchangeCode: string } {
    return { exchangeCode: 'test-code' };
  }
  authEnter(): { next: string } {
    return { next: 'ok' };
  }
  authForgotChallenge(): { next: string } {
    return { next: 'ok' };
  }
  authForgotInit(): { next: string } {
    return { next: 'ok' };
  }
  authForgotVerify(): { next: string } {
    return { next: 'ok' };
  }
  authLogin(): { stepUp: string } {
    return { stepUp: 'PENDING_PASSWORD' };
  }
  authMfaMethods(): {
    methods: Array<{ type: string; id: string; name: string }>;
  } {
    return { methods: [] };
  }
  authMultifactor(): { next: string } {
    return { next: 'ok' };
  }
  authRegister(): { status: string } {
    return { status: 'ok' };
  }
  authResendSignupOtp(): { ok: boolean } {
    return { ok: true };
  }
  authResetPassword(): { next: string } {
    return { next: 'ok' };
  }
  authResetPasswordRequest(): { next: string } {
    return { next: 'ok' };
  }
  authRsatoken(): { alg: string; publicKeyPem: string } {
    return { alg: 'RS256', publicKeyPem: 'pem' };
  }
  authSendOtp(): { ok: boolean } {
    return { ok: true };
  }
  authSession(): { user: string } {
    return { user: 'test' };
  }
  authVerifyOtp(): { verified: boolean } {
    return { verified: true };
  }
  authVerifySignupOtp(): { verified: boolean } {
    return { verified: true };
  }
}

@Injectable()
class TestHealthApi extends HealthApi {
  healthStatus(): { ok: boolean; ts: number } {
    return { ok: true, ts: Date.now() };
  }
  healthUpstash(): { ok: boolean; region: string; count: number } {
    return { ok: true, region: 'local', count: 1 };
  }
}

@Injectable()
class TestOidcApi extends OidcApi {
  oidcClients(oidcClientsRequestParams: { xTraceId?: string }): Array<{
    client_id: string;
    name: string;
    default_redirect_uri: string;
    scopes: string[];
  }> {
    return [
      {
        client_id: oidcClientsRequestParams?.xTraceId ?? 'no-trace',
        name: 'test-client',
        default_redirect_uri: 'http://localhost/callback',
        scopes: ['openid'],
      },
    ];
  }
  oidcGetAuthorizationRequest(): { request_uri: string; expires_in: number } {
    return {
      request_uri: 'urn:test:request',
      expires_in: 60,
    };
  }
}

export type IdpRuntimeClients = {
  healthClient: HealthService;
  oidcClient: OidcService;
  authClient: AuthService;
};

export const idpServiceProfile: ServiceProfile<IdpRuntimeClients> = {
  serviceName: 'idp-server',
  serverPackageName: '@csisp-api/idp-server',
  bffPackageName: '@csisp-api/bff-idp-server',
  smokeEndpoints: {
    health: '/health',
    healthUpstash: '/health/upstash',
    oidcClients: '/oidc/clients',
  },
  runtimeExpectations: {
    healthStatusCode: 200,
    oidcClientsStatusCode: 201,
    traceId: 'trace-from-bff',
  },
  contractFixturesDir: 'src/profiles/idp/contracts-fixtures',
  contractCases: [
    {
      name: 'generated single-request-parameter style should pass',
      projectFile: 'tsconfig.pass.json',
      shouldPass: true,
    },
    {
      name: 'split-parameter style should fail',
      projectFile: 'tsconfig.fail.json',
      shouldPass: false,
      outputIncludes: 'Type',
    },
  ],
  createRuntimeHarnessConfig() {
    return {
      imports: [
        ApiModule.forRoot({
          apiImplementations: {
            authApi: TestAuthApi,
            healthApi: TestHealthApi,
            oidcApi: TestOidcApi,
          },
        }),
      ],
      createClients(basePath: string) {
        const httpService = new HttpService(
          axios.create()
        ) as unknown as ConstructorParameters<typeof HealthService>[0];
        const config = new Configuration({ basePath });
        return {
          healthClient: new HealthService(httpService, config),
          oidcClient: new OidcService(httpService, config),
          authClient: new AuthService(httpService, config),
        };
      },
    };
  },
  testConfig: {
    defaultTimeout: 5000,
    performanceThresholds: {
      healthStatus: 100,
      oidcClients: 200,
      authLogin: 300,
    },
  },
};
