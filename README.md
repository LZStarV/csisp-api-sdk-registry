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
