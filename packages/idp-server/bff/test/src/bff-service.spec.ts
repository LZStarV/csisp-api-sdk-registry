import { HttpService } from '@nestjs/axios';
import axios from 'axios';
import { describe, expect, it } from 'vitest';

import { Configuration, HealthService, OidcService, AuthService } from '../..';

describe('BFF Service Tests', () => {
  describe('Service Instantiation', () => {
    it('should be able to create health service instance', () => {
      const httpService = new HttpService(axios.create());
      const config = new Configuration({ basePath: 'http://localhost:3000' });
      const healthService = new HealthService(httpService, config);
      expect(healthService).toBeDefined();
    });

    it('should be able to create oidc service instance', () => {
      const httpService = new HttpService(axios.create());
      const config = new Configuration({ basePath: 'http://localhost:3000' });
      const oidcService = new OidcService(httpService, config);
      expect(oidcService).toBeDefined();
    });

    it('should be able to create auth service instance', () => {
      const httpService = new HttpService(axios.create());
      const config = new Configuration({ basePath: 'http://localhost:3000' });
      const authService = new AuthService(httpService, config);
      expect(authService).toBeDefined();
    });
  });

  describe('Configuration', () => {
    it('should have correct basePath configuration', () => {
      const basePath = 'http://localhost:3000';
      const config = new Configuration({ basePath });
      expect(config.basePath).toBe(basePath);
    });

    it('should handle empty configuration object', () => {
      const config = new Configuration({});
      expect(config).toBeDefined();
    });
  });

  describe('Service Methods', () => {
    it('healthService should have healthStatus method', () => {
      const httpService = new HttpService(axios.create());
      const config = new Configuration({ basePath: 'http://localhost:3000' });
      const healthService = new HealthService(httpService, config);
      expect(typeof healthService.healthStatus).toBe('function');
    });

    it('oidcService should have oidcClients method', () => {
      const httpService = new HttpService(axios.create());
      const config = new Configuration({ basePath: 'http://localhost:3000' });
      const oidcService = new OidcService(httpService, config);
      expect(typeof oidcService.oidcClients).toBe('function');
    });

    it('authService should have authLogin method', () => {
      const httpService = new HttpService(axios.create());
      const config = new Configuration({ basePath: 'http://localhost:3000' });
      const authService = new AuthService(httpService, config);
      expect(typeof authService.authLogin).toBe('function');
    });

    it('authService should have authRegister method', () => {
      const httpService = new HttpService(axios.create());
      const config = new Configuration({ basePath: 'http://localhost:3000' });
      const authService = new AuthService(httpService, config);
      expect(typeof authService.authRegister).toBe('function');
    });

    it('authService should have authSession method', () => {
      const httpService = new HttpService(axios.create());
      const config = new Configuration({ basePath: 'http://localhost:3000' });
      const authService = new AuthService(httpService, config);
      expect(typeof authService.authSession).toBe('function');
    });
  });
});
