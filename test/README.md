# 测试文档

## 测试目的

本测试套件旨在确保 CSISP API SDK Registry 项目的各个组件能够正常工作，包括：

- 验证 OpenAPI 规范的正确性和完整性
- 确保 SDK 生成过程的可靠性
- 测试 API 接口的功能和性能
- 验证 BFF 层与 Server 层的集成
- 确保类型导出和 TypeScript 提示的正确性

## 测试结构

测试目录结构如下：

```
test/
├── src/
│   ├── contracts/         # 契约测试
│   ├── profiles/          # 测试配置文件
│   ├── runtime/           # 运行时测试
│   └── template/          # 测试模板和工具
└── vitest.config.ts       # Vitest 配置文件
```

### 主要测试文件

1. **契约测试**
   - `signature-contract.spec.ts` - 验证契约案例是否通过

2. **运行时测试**
   - `bff-server-smoke.spec.ts` - BFF 到 Server 的集成测试
   - `performance-security.spec.ts` - 性能和安全测试
   - `type-export-print.spec.ts` - 类型导出和打印测试

3. **测试模板**
   - `contract-harness.ts` - 契约测试基础设施
   - `runtime-harness.ts` - 运行时测试基础设施
   - `service-map.ts` - 服务映射模板

4. **测试配置**
   - `profiles/index.ts` - 配置文件加载器
   - `profiles/idp/service-map.ts` - IDP 服务的测试配置

## 子项目测试

各个子项目的测试位于各自的 `test` 目录中：

1. **BFF 测试**
   - 位置：`packages/idp-server/bff/test/src/bff-service.spec.ts`
   - 测试内容：BFF 服务的实例化、配置和方法

2. **Server 测试**
   - 位置：`packages/idp-server/server/test/src/server-api.spec.ts`
   - 测试内容：Server API 的导入、接口实现和方法返回值

3. **Spec 测试**
   - 位置：`packages/idp-server/spec/test/src/spec-scripts.spec.ts`
   - 测试内容：OpenAPI 规范文件的存在性、内容和目录结构

## 测试命令

### 运行所有测试

```bash
pnpm test:all
```

### 运行特定包的测试

```bash
# 运行 IDP 测试（根目录测试模板）
pnpm test:idp

# 运行 BFF 测试
pnpm test:bff

# 运行 Server 测试
pnpm test:server

# 运行 Spec 测试
pnpm test:spec
```

### 运行单个测试文件

```bash
# 运行契约测试
pnpm --filter @csisp-api/test-template run test src/contracts/signature-contract.spec.ts

# 运行 BFF 服务测试
pnpm --filter @csisp-api/bff-idp-server-test run test src/bff-service.spec.ts
```

## 测试配置

Vitest 配置文件位于 `test/vitest.config.ts`，包含以下配置：

- 测试环境：Node.js
- 测试文件匹配：`src/**/*.spec.ts`
- 超时设置：10秒
- 重试机制：失败时重试2次
- 环境变量配置
- 测试覆盖率报告：启用并设置阈值

## 测试数据清理

测试使用 `runtime-harness.ts` 中的 `cleanup` 方法进行测试数据和应用资源的清理，确保测试之间的隔离性。

## 测试覆盖率

测试覆盖率报告将在测试运行后生成，位于 `test/coverage` 目录中，包含以下指标：

- 语句覆盖率：70%
- 分支覆盖率：70%
- 函数覆盖率：40%
- 行覆盖率：70%

## 测试最佳实践

1. **测试命名**：使用清晰、描述性的测试名称，说明测试的目的
2. **测试分组**：使用 `describe` 块将相关测试分组，提高可读性
3. **测试隔离**：确保每个测试独立运行，不依赖其他测试的状态
4. **测试数据**：使用合理的测试数据，包括正常情况、边界情况和异常情况
5. **测试断言**：使用明确的断言，验证预期结果
6. **测试清理**：使用 `afterAll` 或 `afterEach` 钩子清理测试数据和资源

## 故障排除

### 常见问题

1. **测试失败**：检查测试数据、API 响应和断言是否正确
2. **依赖问题**：确保所有依赖已安装，特别是 `@vitest/coverage-v8`
3. **超时问题**：如果测试超时，检查 API 响应时间或增加超时设置
4. **类型错误**：确保 TypeScript 类型定义正确，特别是接口和类型导出

### 调试技巧

1. **运行单个测试**：使用 `pnpm test:idp src/runtime/bff-server-smoke.spec.ts` 运行特定测试文件
2. **添加日志**：在测试中添加 `console.log` 语句来查看变量值和执行流程
3. **检查覆盖率**：查看覆盖率报告，了解测试覆盖情况
4. **检查 API 响应**：使用工具如 Postman 或 curl 测试 API 接口

## 贡献测试

如果您需要添加新的测试或修改现有测试，请遵循以下步骤：

1. **了解测试结构**：熟悉现有的测试文件和结构
2. **添加测试文件**：在适当的目录中创建新的测试文件
3. **编写测试用例**：使用 `describe` 和 `it` 块编写测试用例
4. **运行测试**：确保测试通过
5. **更新文档**：如果需要，更新测试文档

## 总结

测试套件是确保项目质量的重要组成部分，通过定期运行测试，可以及早发现和解决问题，提高代码质量和可靠性。
