import {
  Configuration,
  HealthService,
  OidcService,
} from '@csisp-api/bff-idp-server';
import { ApiModule, AuthApi, HealthApi, OidcApi } from '@csisp-api/idp-server';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import axios from 'axios';

import type { ServiceProfile } from '../../template/service-map';

@Injectable()
class TestAuthApi extends AuthApi {
  authCreateExchangeCode(): any {
    return { exchangeCode: 'test-code' };
  }
  authEnter(): any {
    return { next: 'ok' };
  }
  authForgotChallenge(): any {
    return { next: 'ok' };
  }
  authForgotInit(): any {
    return { next: 'ok' };
  }
  authForgotVerify(): any {
    return { next: 'ok' };
  }
  authLogin(): any {
    return { stepUp: 'PENDING_PASSWORD' };
  }
  authMfaMethods(): any {
    return { methods: [] };
  }
  authMultifactor(): any {
    return { next: 'ok' };
  }
  authRegister(): any {
    return { status: 'ok' };
  }
  authResendSignupOtp(): any {
    return { ok: true };
  }
  authResetPassword(): any {
    return { next: 'ok' };
  }
  authResetPasswordRequest(): any {
    return { next: 'ok' };
  }
  authRsatoken(): any {
    return { alg: 'RS256', publicKeyPem: 'pem' };
  }
  authSendOtp(): any {
    return { ok: true };
  }
  authSession(): any {
    return { user: 'test' };
  }
  authVerifyOtp(): any {
    return { verified: true };
  }
  authVerifySignupOtp(): any {
    return { verified: true };
  }
}

@Injectable()
class TestHealthApi extends HealthApi {
  healthStatus(): any {
    return { ok: true, ts: Date.now() };
  }
  healthUpstash(): any {
    return { ok: true, region: 'local', count: 1 };
  }
}

@Injectable()
class TestOidcApi extends OidcApi {
  oidcClients(oidcClientsRequestParams: any): any {
    return [
      {
        client_id: oidcClientsRequestParams?.xTraceId ?? 'no-trace',
        name: 'test-client',
        default_redirect_uri: 'http://localhost/callback',
        scopes: ['openid'],
      },
    ];
  }
  oidcGetAuthorizationRequest(): any {
    return {
      request_uri: 'urn:test:request',
      expires_in: 60,
    };
  }
}

export type IdpRuntimeClients = {
  healthClient: HealthService;
  oidcClient: OidcService;
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
        const httpService =
          new HttpService(axios.create()) as unknown as ConstructorParameters<
            typeof HealthService
          >[0];
        const config = new Configuration({ basePath });
        return {
          healthClient: new HealthService(httpService, config),
          oidcClient: new OidcService(httpService, config),
        };
      },
    };
  },
};
