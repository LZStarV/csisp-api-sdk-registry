---
title: Request 类型桥接与 OpenAPI 适配
description: 分析 @csisp-api 自动生成代码中全局 Request 与 Express Request 之间的类型冲突及其解决方案。
editLink: true
outline: deep
---

# Request 类型桥接与 OpenAPI 适配

本文档记录了在使用 `typescript-nestjs-server` 生成后端 API 接口契约时遇到的 `Request` 类型冲突问题，以及我们在项目中所采用的适配器模式（Adapter Pattern）解决方案。

## 1. 什么是桥接问题？

在本项目中，我们使用 `@openapitools/openapi-generator-cli`（基于 `typescript-nestjs-server` 生成器）生成了 API 契约包 `@csisp-api/idp-server`。

在自动生成的包中，所有的 API 抽象类（如 `AuthApi` 和 `OidcApi`）的 `request` 参数，默认被指定为全局的 DOM/Fetch `Request` 类型。例如：

```typescript
// 生成的抽象方法示例
abstract authLogin(params: AuthLoginRequestParams, request: Request): LoginResult;
```

然而，NestJS 默认底层使用 Express 作为 HTTP 框架。我们在 Controller 中通过 `@Req()` 装饰器获取到的实际上是 `express.Request` 对象。如果直接让 Controller 去 `implements AuthApi`，TypeScript 就会报错，因为 `express.Request` 的类型签名与全局 `Request` 完全不兼容。这就是我们所称的**“Request 类型桥接问题”**。

## 2. 产生原因

这是 OpenAPI 生成器 `typescript-nestjs-server` 的一个默认行为机制导致的：

- **平台无关性设计**：生成器为了保持生成的代码与底层框架解耦，默认使用了标准的 Web API `Request` 类型作为占位符。
- **业务实际需求**：虽然 NestJS 是支持多平台（如 Fastify）的，但我们在实际业务中重度依赖了 Express 的特有属性（例如操作 `req.res` 或是存取 Cookies），导致我们必须强依赖 `express.Request`。

两者在这里产生了类型定义的代沟，因此需要一种机制进行类型上的“桥接”。

## 3. 当前的解决方案：适配器模式

为了避免大面积的类型报错并保持 Controller 的职责单一，我们没有让 Controller 直接去实现生成的 API 接口，而是引入了 `ApiImpl` 适配层。

具体做法包含以下两步：

### 第一步：Controller 层强制转换为全局 Request

在 Controller（例如 `auth.controller.ts`）中，我们接收真实的 `ExpressRequest`，然后通过 `as unknown as Request` 进行类型桥接，将其伪装成契约所要求的全局 `Request` 传递给底层适配器：

```typescript
import type { Request as ExpressRequest } from 'express';

export class AuthController {
  // ...
  private toContractRequest(request: ExpressRequest): Request {
    return request as unknown as Request;
  }

  @Post('login')
  async authLogin(@Body() loginInternalDto: LoginInternalDto, @Req() request: ExpressRequest) {
    return this.authApi.authLogin(
      { loginInternalDto, xTraceId: this.getTraceId(request) },
      this.toContractRequest(request) // 桥接转换
    );
  }
}
```

### 第二步：Impl 适配层强制还原为 Express Request

在真正实现契约的适配器类（例如 `auth-api.impl.ts`）中，我们再把传进来的“伪全局 Request”安全地还原回 `ExpressRequest`，以便 Service 层可以正常调用 Express 的特有方法：

```typescript
import type { Request as ExpressRequest } from 'express';
import { AuthApi } from '@csisp-api/idp-server';

@Injectable()
export class AuthApiImpl implements AuthApi {
  // ...
  private toExpressRequest(request: Request): ExpressRequest {
    return request as unknown as ExpressRequest; // 还原转换
  }

  async authLogin(requestParams: AuthLoginRequestParams, request: Request) {
    const expressRequest = this.toExpressRequest(request);
    // 此时可以安全地使用 expressRequest，如获取 res 对象等
    const response = expressRequest.res;
    return this.service.loginEmailPassword(requestParams.loginInternalDto, response);
  }
}
```

## 4. 总结与后续演进

当前，该桥接问题已通过**适配器模式在业务侧得到妥善处理（Workaround）**，在运行时不会产生任何问题，因为 NestJS 实际注入的始终是真实的 Express Request 对象。

如果要从根本上“消灭”这个转换过程，未来可考虑调整 `@csisp-api/idp-server` 的 OpenAPI Generator 配置。通过 `type-mapping` 强制让生成器直接输出 `import type { Request } from 'express'`。在此之前，我们将继续沿用当前的 `ApiImpl` 适配层方案以确保类型安全与逻辑分离。
