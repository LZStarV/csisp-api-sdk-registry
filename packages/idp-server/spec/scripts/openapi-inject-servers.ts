import fs from 'fs';
import path from 'path';

type OpenApiServersConfig = {
  servers: Array<{
    url: string;
    description?: string;
  }>;
};

async function main() {
  const specDir = path.resolve(__dirname, '..');
  const openapiFile = path.join(specDir, 'openapi.json');
  const serversConfigFile = path.join(specDir, 'openapi.servers.json');

  const openapiRaw = fs.readFileSync(openapiFile, 'utf-8');
  const openapi = JSON.parse(openapiRaw) as Record<string, unknown>;

  try {
    const serversConfigRaw = fs.readFileSync(serversConfigFile, 'utf-8');
    const serversConfig = JSON.parse(serversConfigRaw) as OpenApiServersConfig;

    if (!Array.isArray(serversConfig.servers)) {
      throw new Error('openapi.servers.json 中 servers 必须是数组');
    }

    openapi.servers = serversConfig.servers;
  } catch (err) {
    if (err instanceof Error && err.message.includes('ENOENT')) {
      console.warn('openapi.servers.json 文件不存在，不进行服务器配置注入');
    } else {
      throw err;
    }
  }
  fs.writeFileSync(openapiFile, `${JSON.stringify(openapi, null, 2)}\n`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
