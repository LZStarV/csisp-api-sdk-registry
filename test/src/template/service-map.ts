import type { RuntimeHarnessConfig } from './runtime-harness';

export type ContractCase = {
  name: string;
  projectFile: string;
  shouldPass: boolean;
  outputIncludes?: string;
};

export type RuntimeExpectations = {
  healthStatusCode: number;
  oidcClientsStatusCode: number;
  traceId: string;
};

export type ServiceProfile<TClients> = {
  serviceName: string;
  serverPackageName: string;
  bffPackageName: string;
  smokeEndpoints: {
    health: string;
    healthUpstash: string;
    oidcClients: string;
  };
  runtimeExpectations: RuntimeExpectations;
  contractCases: ContractCase[];
  contractFixturesDir: string;
  createRuntimeHarnessConfig: (options?: {
    basePath?: string;
    timeout?: number;
    enableLogging?: boolean;
  }) => RuntimeHarnessConfig<TClients>;
  testConfig?: {
    defaultTimeout?: number;
    performanceThresholds?: {
      healthStatus?: number;
      oidcClients?: number;
      authLogin?: number;
    };
  };
};
