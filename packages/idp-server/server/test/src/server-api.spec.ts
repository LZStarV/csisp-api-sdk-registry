import { Injectable } from '@nestjs/common';
import { describe, expect, it } from 'vitest';

import { ApiModule, AuthApi, HealthApi, OidcApi } from '../..';

describe('Server API Tests', () => {
  describe('API Module Import', () => {
    it('should be able to import ApiModule', () => {
      expect(ApiModule).toBeDefined();
      expect(typeof ApiModule.forRoot).toBe('function');
    });
  });

  describe('API Interface Import', () => {
    it('should be able to import AuthApi interface', () => {
      expect(AuthApi).toBeDefined();
    });

    it('should be able to import HealthApi interface', () => {
      expect(HealthApi).toBeDefined();
    });

    it('should be able to import OidcApi interface', () => {
      expect(OidcApi).toBeDefined();
    });
  });

  describe('AuthApi Implementation', () => {
    @Injectable()
    class TestAuthApi implements AuthApi {
      authCreateExchangeCode() {
        return { exchangeCode: 'test' };
      }
      authEnter() {
        return { next: 'ok' };
      }
      authForgotChallenge() {
        return { next: 'ok' };
      }
      authForgotInit() {
        return { next: 'ok' };
      }
      authForgotVerify() {
        return { next: 'ok' };
      }
      authLogin() {
        return { stepUp: 'PENDING_PASSWORD' };
      }
      authMfaMethods() {
        return { methods: [] };
      }
      authMultifactor() {
        return { next: 'ok' };
      }
      authRegister() {
        return { status: 'ok' };
      }
      authResendSignupOtp() {
        return { ok: true };
      }
      authResetPassword() {
        return { next: 'ok' };
      }
      authResetPasswordRequest() {
        return { next: 'ok' };
      }
      authRsatoken() {
        return { alg: 'RS256', publicKeyPem: 'test' };
      }
      authSendOtp() {
        return { ok: true };
      }
      authSession() {
        return { user: 'test' };
      }
      authVerifyOtp() {
        return { verified: true };
      }
      authVerifySignupOtp() {
        return { verified: true };
      }
    }

    it('should be able to implement AuthApi interface', () => {
      const testAuthApi = new TestAuthApi();
      expect(testAuthApi).toBeDefined();
    });

    it('authLogin should return expected response', () => {
      const testAuthApi = new TestAuthApi();
      const result = testAuthApi.authLogin();
      expect(result).toEqual({ stepUp: 'PENDING_PASSWORD' });
    });

    it('authSession should return expected response', () => {
      const testAuthApi = new TestAuthApi();
      const result = testAuthApi.authSession();
      expect(result).toEqual({ user: 'test' });
    });

    it('authRegister should return expected response', () => {
      const testAuthApi = new TestAuthApi();
      const result = testAuthApi.authRegister();
      expect(result).toEqual({ status: 'ok' });
    });
  });

  describe('HealthApi Implementation', () => {
    @Injectable()
    class TestHealthApi implements HealthApi {
      healthStatus() {
        return { ok: true, ts: Date.now() };
      }
      healthUpstash() {
        return { ok: true, region: 'local', count: 1 };
      }
    }

    it('should be able to implement HealthApi interface', () => {
      const testHealthApi = new TestHealthApi();
      expect(testHealthApi).toBeDefined();
    });

    it('healthStatus should return expected response', () => {
      const testHealthApi = new TestHealthApi();
      const result = testHealthApi.healthStatus();
      expect(result.ok).toBe(true);
      expect(typeof result.ts).toBe('number');
    });
  });

  describe('OidcApi Implementation', () => {
    @Injectable()
    class TestOidcApi implements OidcApi {
      oidcClients() {
        return [
          {
            client_id: 'test',
            name: 'test-client',
            default_redirect_uri: 'http://localhost',
            scopes: ['openid'],
          },
        ];
      }
      oidcGetAuthorizationRequest() {
        return { request_uri: 'urn:test', expires_in: 60 };
      }
    }

    it('should be able to implement OidcApi interface', () => {
      const testOidcApi = new TestOidcApi();
      expect(testOidcApi).toBeDefined();
    });

    it('oidcClients should return expected response', () => {
      const testOidcApi = new TestOidcApi();
      const result = testOidcApi.oidcClients();
      expect(Array.isArray(result)).toBe(true);
      expect(result[0].client_id).toBe('test');
      expect(result[0].name).toBe('test-client');
    });
  });
});
