IDP Server SDK

- 提供 CSISP 身份服务（IDP）客户端 SDK，基于 OpenAPI 生成。
- 入口：
  - main: dist/index.js
  - types: dist/index.d.ts
- 使用示例（typescript-fetch）：

```ts
import { AuthApi, Configuration } from '@csisp-api/idp-server';

const api = new AuthApi(
  new Configuration({
    basePath: 'http://localhost', // 在生产中替换为真实服务地址
  })
);

// 例如登录
api.authLogin({ loginInternalDto: { email: 'a@b.com', password: 'xxx' } }).then(res => {
  console.log(res);
});
```
