import fs from 'fs';
import path from 'path';

async function main() {
  const projectId = process.env.PROJECT_ID;
  const token = process.env.APIFOX_ACCESS_TOKEN;
  const moduleId = process.env.IDP_SERVER_MODULE_ID;
  if (!projectId || !token) {
    throw new Error('缺少项目ID或访问令牌');
  }
  const url = `https://api.apifox.cn/v1/projects/${projectId}/export-openapi`;

  const body = JSON.stringify({
    scope: { type: 'ALL' },
    oasVersion: '3.1',
    moduleId,
  });

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'X-Apifox-Api-Version': '2024-03-28',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body,
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`请求失败 ${res.status} ${res.statusText} ${txt}`);
  }

  const raw = await res.text();

  const pkgDir = path.resolve(__dirname, '..');
  const pkgJson = path.join(pkgDir, 'openapi.json');

  fs.mkdirSync(pkgDir, { recursive: true });
  fs.writeFileSync(pkgJson, raw);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
