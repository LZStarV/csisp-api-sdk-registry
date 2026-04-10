import { firstValueFrom } from 'rxjs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { resolveActiveProfile, resolveActiveProfileName } from '../profiles';
import {
  createRuntimeHarness,
  type RuntimeHarness,
} from '../template/runtime-harness';
import type { ServiceProfile } from '../template/service-map';

type ActiveClients = {
  healthClient: {
    healthStatus: () => any;
  };
  oidcClient: {
    oidcClients: (params: { 'x-trace-id': string }) => any;
  };
};

type ActiveRuntimeHarness = RuntimeHarness<ActiveClients>;

describe('bff -> server runtime smoke', () => {
  const profile = resolveActiveProfile() as ServiceProfile<ActiveClients>;
  const profileName = resolveActiveProfileName();
  let harness: ActiveRuntimeHarness;

  beforeAll(async () => {
    harness = await createRuntimeHarness(profile.createRuntimeHarnessConfig());
  });

  afterAll(async () => {
    await harness.app.close();
  });

  it('healthStatus should return expected payload through bff client', async () => {
    const response = (await firstValueFrom(
      harness.clients.healthClient.healthStatus()
    )) as any;
    expect(response.status).toBe(profile.runtimeExpectations.healthStatusCode);
    expect(response.data.ok).toBe(true);
    expect(typeof response.data.ts).toBe('number');
  });

  it('oidcClients should pass x-trace-id to server contract object', async () => {
    const response = (await firstValueFrom(
      harness.clients.oidcClient.oidcClients({
        'x-trace-id': profile.runtimeExpectations.traceId,
      })
    )) as any;
    expect(response.status).toBe(
      profile.runtimeExpectations.oidcClientsStatusCode
    );
    expect(response.data[0]?.client_id).toBe(
      profile.runtimeExpectations.traceId
    );
  });
  it('active profile should be resolved', () => {
    expect(profileName.length).toBeGreaterThan(0);
  });
});
