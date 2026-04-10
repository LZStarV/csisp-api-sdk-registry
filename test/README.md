# test 模板子包

## 定位

提供可复用的测试基础设施（harness + 规则执行器）与服务配置入口（profile），各服务通过新增 profile 接入。

## 架构分层

- `src/template`
  - 通用模板层，不包含业务服务细节
  - `runtime-harness.ts`：通用 Nest in-memory 启动器
  - `contract-harness.ts`：通用 contract typecheck 执行器
  - `service-map.ts`：通用 profile 类型契约
- `src/profiles/<service>`
  - 服务接入层，承载该服务的依赖、实现、断言配置
  - 当前已有 `src/profiles/idp/service-map.ts`
  - contracts fixture 也放在 profile 目录下（避免多服务互相污染）
- `src/runtime` / `src/contracts`
  - 运行时与编译期测试入口
  - 只消费 profile，不直接硬编码服务细节

## 当前目录

```text
test/
  package.json
  tsconfig.json
  vitest.config.ts
  src/
    contracts/
      signature-contract.spec.ts
    runtime/
      bff-server-smoke.spec.ts
    profiles/
      idp/
        service-map.ts
        contracts-fixtures/
          auth-signature-pass.ts
          auth-signature-fail.ts
          tsconfig.pass.json
          tsconfig.fail.json
    template/
      contract-harness.ts
      runtime-harness.ts
      service-map.ts
```

## 使用方式（当前 idp）

```bash
pnpm install
pnpm --filter @csisp-api/bff-idp-server run codegen
pnpm --filter @csisp-api/bff-idp-server run build
pnpm --filter @csisp-api/idp-server run codegen
pnpm --filter @csisp-api/idp-server run build
pnpm test:idp
```

## 新服务接入步骤

1. 新建 `src/profiles/<new-service>/service-map.ts`
2. 在该 profile 中实现：
   - `serviceName / serverPackageName / bffPackageName`
   - `runtimeExpectations`
   - `contractFixturesDir`
   - `contractCases`
   - `createRuntimeHarnessConfig`
3. 新建 `src/profiles/<new-service>/contracts-fixtures/*`
4. 在 `src/runtime/*.spec.ts` 与 `src/contracts/*.spec.ts` 切换到对应 profile

## Profile 选择

- 默认 profile：`idp`
- 可通过环境变量切换：`TEST_PROFILE=<name>`
- 当前注册入口：`src/profiles/index.ts`

## 显式失败策略

每个 profile 的 `contractCases` 中都应保留至少一个 `shouldPass: false` 的显式失败用例，用于提前发现契约不匹配问题。
