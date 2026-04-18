# BFF Integrated Server SDK

- 提供集成服务的 gRPC 客户端 SDK，基于 Protocol Buffers 生成。
- 入口：
  - main: dist/index.js
  - types: dist/index.d.ts

## 使用场景

此包用于 **BFF 层**调用 gRPC 远程服务。包中包含：

- Message 类型定义
- gRPC Client 客户端（如 `DemoClient`）
- NestJS 装饰器支持

## 使用示例

### 客户端配置

```typescript
import { ClientGrpc, ClientsModule, Transport } from '@nestjs/microservices';
import { Module } from '@nestjs/common';
import { DemoClient, INTEGRATED_SERVER_PACKAGE_NAME } from '@csisp-api/bff-integrated-server';
import { join } from 'path';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'INTEGRATED_SERVER',
        transport: Transport.GRPC,
        options: {
          package: INTEGRATED_SERVER_PACKAGE_NAME,
          protoPath: join(__dirname, 'proto/demo.proto'), // 在实际部署中替换为真实路径
          url: 'localhost:50051',
        },
      },
    ]),
  ],
})
export class AppModule {}
```

### 在 Service 中使用

```typescript
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { DemoClient, GetDemoInfoRequest } from '@csisp-api/bff-integrated-server';
import { Observable } from 'rxjs';

@Injectable()
export class DemoService implements OnModuleInit {
  private demoService: DemoClient;

  constructor(@Inject('INTEGRATED_SERVER') private client: ClientGrpc) {}

  onModuleInit() {
    this.demoService = this.client.getService<DemoClient>('Demo');
  }

  getDemoInfo(demoId: string): Observable<GetDemoInfoResponse> {
    const request: GetDemoInfoRequest = {
      demoId,
      withExtra: true,
    };
    return this.demoService.getDemoInfo(request);
  }
}
```
