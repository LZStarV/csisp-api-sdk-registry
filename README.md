# CSISP API SDK Registry

- 目标：从 Apifox 拉取 CSISP 项目的 OpenAPI 文档，生成可发布的 TypeScript SDK，供主项目直接消费。
- 方式：使用 Infisical 注入敏感环境变量，调用导出脚本写入 openapi.json，随后用 OpenAPI Generator 产出代码并通过 TypeScript 构建。

## 工作流总览

1. 从 Apifox 导出 OpenAPI
   - 命令：在 idp-server 包内执行 dev:export
   - 脚本会向 Apifox Export OpenAPI 接口发起请求，并将结果写入 openapi.json
2. 本地生成 TypeScript SDK
   - 命令：在 idp-server 包内执行 codegen
   - 使用 openapi-generator-cli（typescript-fetch 模板）生成到 generated
3. 构建发布物
   - 命令：在 idp-server 包内执行 build
   - 使用 tsc 从 generated 编译到 dist，并输出类型声明
4. 发布
   - 将包发布到私有 npm 仓库。

### 本地构建与生成
- **注意**：执行 `codegen` 指令需要本地已安装 **Java** 环境。
- 在包目录执行以下命令完成导出与构建：

  ```bash
  npm run dev:export
  npm run codegen
  npm run build
  ```


## 本地开发：登录与发布到私有 npm

仅用于本地调试与手动发布，线上流水线不需要手动执行这些命令。

### 登录私有仓库（二选一）
- 第一次发包时，需要先 adduser

  ```bash
  npm adduser --registry=http://182.92.140.128:40087/
  # 或
  npm adduser --registry="$(npm config get @csisp-api:registry)"
  ```

- 在 adduser 成功以后，会在全局 .npmrc 中存储一个 token。后续每次发布时，直接使用 login 即可登录

  ```bash
  npm login --registry="$(npm config get @csisp-api:registry)"
  ```

### 在包目录内发布
以 idp-server 包为例
：
- 切到包目录：

  ```bash
  cd packages/idp-server
  ```

- 更新版本号（按需）：

  ```bash
  npm version patch
  # 或 minor / major / prerelease --preid=alpha
  ```

- 预检包内容（可选，建议）：

  ```bash
  npm pack
  npm publish --dry-run
  ```

- 发布到私有仓库：

  ```bash
  npm publish
  # 或使用配置变量：
  npm publish --registry="$(npm config get @csisp-api:registry)"
  ```
