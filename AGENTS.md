# 项目知识库

## 项目概览

CSISP API SDK Registry 是一个 Monorepo，用于从 OpenAPI 规范生成 TypeScript SDK，并发布为私有 npm 包。
核心技术栈：Node.js 20+、pnpm、TypeScript、OpenAPI Generator（依赖 Java）。

## 目录结构

```text
csisp-api-sdk-registry/
├─ packages/
│  └─ idp-server/            # 主业务目录
│     ├─ bff/                # BFF 层
│     ├─ server/             # SDK 生成与 API 服务核心
│     ├─ spec/               # OpenAPI 导出与预处理脚本
│     └─ test/               # 统一测试包（Vitest）
├─ .github/workflows/        # CI/CD 流水线
└─ test/                     # 仓库级集成测试（若存在）
```

## 常见任务定位

| 任务 | 位置 | 说明 |
| --- | --- | --- |
| OpenAPI 导出 | `packages/idp-server/spec` | `dev:export` 会先导出，再注入 `servers` |
| SDK 生成 | `packages/idp-server/server/scripts/codegen.ts` | 使用 `@openapitools/openapi-generator-cli` |
| 发布流程 | `.github/workflows/publish.yml` | CI 中会处理 `bff` 与 `server` 包 |
| SDK 入口 | `packages/idp-server/server/src/index.ts` | 对外导出 SDK |
| 配置与密钥 | `.infisical`（运行时注入） | 通过 Infisical CLI 注入环境变量 |

## 代码索引

| 符号 | 类型 | 文件 | 作用 |
| --- | --- | --- | --- |
| `generateSdk` | function | `packages/idp-server/server/scripts/codegen.ts` | 从 OpenAPI 生成 SDK |
| `publishPackage` | function | `packages/idp-server/server/scripts/publish.ts` | 发布 npm 包 |
| `AppConfig` | interface | `packages/idp-server/server/src/config.ts` | 应用配置定义 |

## 开发约定

- 业务源码统一放在 `src/`，使用 `tsx` 编译/运行。
- 构建产物位于 `dist/`，生成产物不要手动改动。
- 脚本优先通过 `pnpm --filter <pkg> <script>` 调用。
- 运行时环境变量通过 Infisical 注入。
- 尽量避免 `any`，保持 TypeScript 严格类型。

## 测试与质量门禁

- 提交前至少执行受影响包的构建与测试。
- `idp-server` 相关推荐测试入口：
  - `pnpm test:idp`
  - `pnpm test:idp:contracts`
  - `pnpm test:idp:runtime`
- 发布前建议在目标包目录执行一次 `npm test` 或等效脚本确认通过。
- CI 对格式、类型和测试失败采用快速失败策略。

## 发布建议（重要）

- 推荐先进入目标包目录，再执行发布命令，降低误发布风险。
- 示例（以 `server` 包为例）：

```bash
cd packages/idp-server/server
npm test
npm publish
```

- 示例（以 `bff` 包为例）：

```bash
cd packages/idp-server/bff
npm test
npm publish
```

- 若使用 workspace 方式发布，先确认 `--filter` 指向正确包名再执行。

## 常用命令

```bash
# 1) 导出 OpenAPI（含 servers 注入）
pnpm --filter @csisp-api/idp-server run dev:export

# 2) 生成 SDK
pnpm --filter @csisp-api/idp-server run codegen

# 3) 构建与测试
pnpm --filter @csisp-api/idp-server run build
pnpm --filter @csisp-api/idp-server test
pnpm test:idp

# 4) 按包发布（更推荐先 cd 到对应包目录后 npm publish）
pnpm --filter @csisp-api/idp-server publish
```

## 注意事项

- 使用 OpenAPI Generator 前需安装 Java 17+。
- 严禁将 `generated/`、`dist/` 等生成文件提交到仓库。
- 发布动作必须在测试通过后执行。

## TODO（后续优化）

- [ ] 检查测试流程是否完善并继续优化（覆盖率、失败用例、回归验证与执行效率）。
- [ ] 将测试流程接入 CI/CD（PR 校验、主分支门禁与失败阻断）。
- [ ] 完善自动化打包与生成 npm 包的 GitHub Actions 流程（构建、版本管理、发布前校验与发布策略）。
