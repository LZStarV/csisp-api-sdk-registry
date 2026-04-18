# Integrated Server SDK

- 提供集成服务的 gRPC 类型定义，基于 Protocol Buffers 生成。
- 入口：
  - main: dist/index.js
  - types: dist/index.d.ts

## 使用场景

此包用于**服务端**实现 gRPC Service 时引用类型定义。包中包含：

- Message 类型定义（如 `GetDemoInfoRequest`、`GetDemoInfoResponse`）
- 序列化/反序列化方法（`encode`/`decode`）

## 使用示例

```typescript
import { GetDemoInfoRequest, GetDemoInfoResponse, DemoInfo } from '@csisp-api/integrated-server';

// 在 Service 实现中使用
const request: GetDemoInfoRequest = {
  demoId: '123',
  withExtra: true,
};

// 序列化
const encoded = GetDemoInfoRequest.encode(request).finish();

// 反序列化
const decoded = GetDemoInfoRequest.decode(encoded);
```
