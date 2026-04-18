import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// 读取配置文件
const configPath = path.join(process.cwd(), 'grpc.config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

const validateProto = () => {
  // 处理通配符
  const allProtoFiles = fs
    .readdirSync(config.protoRoot)
    .filter(file => file.endsWith('.proto'));
  const protoFiles = allProtoFiles.map(file =>
    path.join(config.protoRoot, file)
  );
  const protoPaths = [`--proto_path=${config.protoRoot}`];

  // 简单验证proto语法 - 通过尝试生成头文件来验证
  const tempDir = path.join(process.cwd(), 'temp_validate');
  fs.mkdirSync(tempDir, { recursive: true });

  const validateCmd = [
    'protoc',
    ...protoPaths,
    `--ts_proto_out=${tempDir}`,
    ...protoFiles,
    '--ts_proto_opt=outputServices=none,outputEncodeMethods=false,outputJsonMethods=false',
  ];
  const result = spawnSync(validateCmd[0], validateCmd.slice(1), {
    stdio: 'pipe',
  });

  // 清理临时目录
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }

  if (result.status !== 0) {
    console.error('Proto files validation failed:', result.stderr?.toString());
    process.exit(1);
  }

  console.log('Proto files validation passed!');
};

validateProto();
