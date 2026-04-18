# Integrated Server SDK

- 提供集成服务的 gRPC 类型定义，基于 Protocol Buffers 生成。
- 入口：
  - main: dist/index.js
  - types: dist/index.d.ts

## 使用场景

此包用于**服务端**实现 gRPC Service 时引用类型定义。包中包含：

- Message 类型定义（如 `GetDemoInfoRequest`、`GetDemoInfoResponse`）
- 序列化/反序列化方法（`encode`/`decode`）
- gRPC 服务定义对象（如 `DemoService`，用于服务注册）

## 使用示例

### 服务注册（main.ts）

```typescript
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DemoService } from '@csisp-api/integrated-server';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: INTEGRATED_SERVER_PACKAGE_NAME,
        url: '0.0.0.0:50051',
        packageDefinition: {
          // 把静态生成的服务定义 注册到 gRPC 服务器
          'integrated.server.demo': DemoService,
        },
      },
    },
  );

  await app.listen();
}
bootstrap();
```

### 服务端实现

```typescript
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { DemoServer, GetDemoInfoRequest, GetDemoInfoResponse } from '@csisp-api/integrated-server';

@Controller()
export class DemoController implements DemoServer {
  @GrpcMethod('Demo', 'GetDemoInfo')
  getDemoInfo(data: GetDemoInfoRequest): GetDemoInfoResponse {
    return {
      demoInfo: {
        demoId: data.demoId,
        title: 'Demo Title',
        description: 'Demo Description',
        createTime: Date.now(),
      },
      code: 200,
      message: 'Success',
    };
  }
}
```
