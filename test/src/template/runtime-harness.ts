import 'reflect-metadata';
import { DynamicModule, INestApplication, Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
export type RuntimeHarnessConfig<TClients> = {
  imports: DynamicModule[];
  createClients: (basePath: string) => TClients;
};

export type RuntimeHarness<TClients> = {
  app: INestApplication;
  basePath: string;
  clients: TClients;
};

export const createRuntimeHarness = async <TClients>(
  config: RuntimeHarnessConfig<TClients>
): Promise<RuntimeHarness<TClients>> => {
  @Module({
    imports: config.imports,
  })
  class RuntimeTestModule {}

  const app = await NestFactory.create(RuntimeTestModule, {
    logger: false,
  });
  await app.listen(0);
  const server = app.getHttpServer();
  const address = server.address();
  const port = typeof address === 'string' ? 0 : address.port;
  const basePath = `http://127.0.0.1:${port}`;
  const clients = config.createClients(basePath);
  return {
    app,
    basePath,
    clients,
  };
};
