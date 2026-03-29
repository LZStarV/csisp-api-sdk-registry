# API 管理与生成发布计划（BFF 服务用）

## 目标与范围

- 以 Apifox 为事实源，自动化“拉取 OpenAPI → 校验 → 代码生成 → 构建 → 测试 → 发布 npm 包”，仅供 BFF（服务端）与后端服务的服务间通信使用。
- 在独立 GitHub 仓库实施该流水线；CSISP 项目仅作为消费者，通过包名拉取 SDK，不在本仓库维护 OpenAPI 文件。

## 发布粒度与架构

- 服务级发布：一个服务一个 SDK 包（如 @csisp/idp-sdk），避免 domain（paths 子集）级的碎片化发布与版本联动复杂度。
- 包内部按 domain（auth、health、oidc 等）组织 API 分组或命名空间；统一导出入口，保证消费者体验稳定。
- 浏览器→BFF→服务端架构下，生成包仅在 BFF/服务端层使用；浏览器不直接消费生成包。

## Monorepo 组织（示例/建议）

- packages/
  - <service>-sdk/：服务级包（openapi.json、源码 generated、dist、构建与发布脚本、README）
  - generator-config/：生成器共享配置与规则（可选）
- specs/
  - <service>/openapi.json：Apifox 导出的规范原件（CI 存档与 diff 对比）
- .github/workflows/
  - export-and-publish.yml：手动触发 + 分支/预发布支持
- scripts/
  - apifox-export.mjs：从 Apifox 拉取指定服务的规范
  - diff-check.mjs：OpenAPI 破坏性变更检测
- redocly.yaml：统一规则（错误模型、鉴权、trace-id、描述完整性等）
- pnpm-workspace.yaml、tsconfig.base.json、eslint、prettier：统一基础设施

## 工具与选型（本项目已验证）

- OpenAPI 代码生成：OpenAPI Generator（@openapitools/openapi-generator-cli），模板 typescript-fetch
  - 优点：成熟模板、CLI 支持配置文件（-c）、易于 CI 集成与批处理
  - 适配：生成 apis/models/runtime 源码到 generated
- 构建与导出：TypeScript 编译（tsc）
  - 风格：CommonJS（与 Nest 使用习惯一致）
  - 输出：dist/index.js + dist/index.d.ts；exports 同时映射 require/import 到 dist/index.js
- Apifox 导出：使用官方开放接口获取模块/服务的 OpenAPI（JSON/YAML），存入 specs/<service>/openapi.json
- 推荐辅助：Redocly lint + bundle 形成 canonical JSON；在 CI 中做契约质量门槛与破坏性变更检测

## 生成与构建（本仓库实操样例）

- 服务包示例：/infra/idp-server-api-test
  - 配置文件：[openapi.config.json](file:///Users/bytedance/project/CSISP/infra/idp-server-api-test/openapi.config.json)
    ```json
    {
      "supportsES6": true,
      "useSingleRequestParameter": true,
      "typescriptThreePlus": true,
      "modelPropertyNaming": "original"
    }
    ```
  - 生成脚本（package.json）：
    - codegen: openapi-generator-cli generate -i ./openapi.json -g typescript-fetch -o ./generated -c ./openapi.config.json
    - build: tsc -p tsconfig.json
    - 导出入口：type: commonjs；main/types/exports 指向 dist
    - 查看配置与脚本：[package.json](file:///Users/bytedance/project/CSISP/infra/idp-server-api-test/package.json)
  - TS 编译配置（tsconfig.json）：
    ```json
    {
      "compilerOptions": {
        "strict": true,
        "target": "ES2020",
        "module": "CommonJS",
        "moduleResolution": "Node",
        "declaration": true,
        "emitDeclarationOnly": false,
        "outDir": "./dist",
        "rootDir": "./generated",
        "sourceMap": false,
        "skipLibCheck": true
      },
      "include": ["generated"]
    }
    ```
  - 本地命令顺序：
    - pnpm -F idp-server-api-test codegen
    - pnpm -F idp-server-api-test build
  - 生成源码与产物：
    - 源码目录：[generated](file:///Users/bytedance/project/CSISP/infra/idp-server-api-test/generated)
    - 产物目录：[dist](file:///Users/bytedance/project/CSISP/infra/idp-server-api-test/dist)

## 消费者测试（包名引用）

- 示例子包：/apps/idp-sdk-consumer-test
  - 依赖：在 package.json dependencies 中声明 "idp-server-api-test": "workspace:\*"
  - 运行脚本：tsx src/test.ts
  - 示例代码：[test.ts](file:///Users/bytedance/project/CSISP/apps/idp-sdk-consumer-test/src/test.ts)
    ```ts
    import { Configuration, AuthApi } from 'idp-server-api-test';
    async function main() {
      const config = new Configuration({
        basePath: 'http://localhost/api/idp',
        headers: { Authorization: 'Bearer <token>', 'x-trace-id': 'demo-trace-id' },
      });
      const auth = new AuthApi(config);
      const loginReq = await auth.authLoginRequestOpts({
        loginInternalDto: { email: 'user@example.com', password: 'secret' },
        xTraceId: 'demo-trace-id',
      });
      console.log(loginReq.path, loginReq.method, loginReq.headers, loginReq.body);
    }
    main();
    ```
  - 验证输出：路径/方法/头/请求体符合契约；可扩展测试 ResendSignupOtp、VerifyOtp、Session 等。
  - 注意：直接调用 auth.authLogin(...) 会发起 fetch 请求；Node 需 ≥18 或显式提供 fetchApi。

## CI/CD 流水线（建议模板）

- 触发方式：workflow_dispatch（手动参数：service、preid），或按分支/定时触发
- 步骤建议：
  - 导出：Apifox 拉取到 specs/<service>/openapi.json
  - 校验：Redocly lint + bundle（生成 canonical JSON）
  - 代码生成：openapi-generator-cli（typescript-fetch）
  - 构建与测试：tsc 编译、契约 smoke tests
  - 版本与发布：Changesets（或 semantic-release）计算版本、打 tag、npm 发布
- 发布策略：
  - 主干/release → npm dist-tag: latest
  - 功能分支/预发 → npm dist-tag: next 或 canary（使用预发布号 1.4.0-beta.1/rc.0 等）
- 凭据管理：
  - APIFOX_TOKEN、NPM_TOKEN 作为仓库 Secrets；不得硬编码
- 可选：openapitools.json 固定 CLI 版本与批量生成项，便于维护

## 版本与分支策略（SemVer）

- major：破坏性变更（字段删除/重命名、必填变更、响应结构变化、路径变化）
- minor：向后兼容增强（新增路径/字段、将字段改为可选、非必需响应补充）
- patch：文档与示例修正、描述完善，不改变契约
- 预发布：1.4.0-beta.N / 1.4.0-rc.N；npm 用 dist-tags（next/canary）承载分支试用
- 自动化：Conventional Commits + Changesets 生成 changelog 与版本；破坏性变更检测阻断不合规发布

## 质量门槛与校验

- Redocly 规则：强制 4xx/5xx 错误模型、Authorization 与 x-trace-id、字段描述/示例、tags/servers 完整性
- 契约 diff：对比上一个 canonical JSON，检测破坏性变更（字段/必填/响应/路径）
- 类型与构建：TS 严格模式、无 any；ESLint + Prettier；CommonJS 输出与 Nest 兼容
- 测试：关键路由的 smoke tests（类型断言 + 简易 Mock 或仅构建 RequestOpts），确保生成 SDK 与契约一致

## ESM vs CJS 与导出约定

- 本计划采用 CommonJS，面向 Nest（服务端）使用场景，简化 require/import 行为
- 包导出推荐：
  - type: commonjs
  - main: dist/index.js
  - types: dist/index.d.ts
  - exports 映射 import/require 到 dist/index.js；不暴露源码子路径（例如 ./generated）

## 本地演练 SOP（用于新仓库复制）

- 初始化：创建服务包 <service>-sdk 与 specs/<service>/openapi.json
- 生成器配置：openapi.config.json（按需调整 supportsES6/useSingleRequestParameter 等）
- 命令：
  - pnpm -F <service>-sdk codegen
  - pnpm -F <service>-sdk build
  - 在消费者项目中以包名引用测试（如 Nest/BFF 中导入 Configuration 与各 Api）
- 验证：检查 dist 产物与导出入口，运行测试脚本输出是否符合契约

## 风险与应对

- 规范不一致：Apifox 导出与 Redocly 校验冲突时阻断发布；提供清晰报错与修复建议
- 版本扩散：多服务多包的版本管理复杂度高；用 Monorepo + Changesets 与共享生成器配置降低成本
- 运行时差异：Node 版本与 fetch 支持差异；要求 Node ≥18 或在配置中提供 fetchApi
- 命名冲突：如 Error 与语言保留类型冲突，生成器会自动重命名（ModelError）；在 CI 日志中明确提示

---

参考本仓库的 idp-server API 包与消费者测试示例，可直接在新仓库按上述结构与 SOP 落地；将输入源切换为 Apifox 导出，即可实现“事实源→自动化生成→服务端消费”的完整闭环。
