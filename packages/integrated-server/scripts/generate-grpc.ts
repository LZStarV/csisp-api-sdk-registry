import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const configPath = path.join(process.cwd(), 'grpc.config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

const cleanOldCode = (dir: string) => {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
  fs.mkdirSync(dir, { recursive: true });
};

const main = () => {
  cleanOldCode(config.output.server);
  cleanOldCode(config.output.bff);

  const allProtoFiles = fs
    .readdirSync(config.protoRoot)
    .filter(file => file.endsWith('.proto'));
  const protoFiles = allProtoFiles.map(file =>
    path.join(config.protoRoot, file)
  );
  const protoPaths = [`--proto_path=${config.protoRoot}`];

  // 为服务端生成代码
  const serverGenCmd = [
    'protoc',
    ...protoPaths,
    `--ts_proto_out=${config.output.server}`,
    ...protoFiles,
    '--ts_proto_opt=outputServices=grpc-js,nestJs=true,snakeToCamel=true',
  ];
  const serverResult = spawnSync(serverGenCmd[0], serverGenCmd.slice(1), {
    stdio: 'inherit',
  });
  if (serverResult.status !== 0) {
    console.error('Server code generation failed');
    process.exit(1);
  }

  // 为BFF层生成代码
  const bffGenCmd = [
    'protoc',
    ...protoPaths,
    `--ts_proto_out=${config.output.bff}`,
    ...protoFiles,
    '--ts_proto_opt=outputServices=grpc-js,nestJs=true,snakeToCamel=true',
  ];
  const bffResult = spawnSync(bffGenCmd[0], bffGenCmd.slice(1), {
    stdio: 'inherit',
  });
  if (bffResult.status !== 0) {
    console.error('BFF code generation failed');
    process.exit(1);
  }

  const fixDuplicateProtobufPackage = (
    outputDir: string,
    protoFiles: string[]
  ) => {
    protoFiles.forEach(protoFile => {
      const fileName = path.basename(protoFile, '.proto');
      const filePath = path.join(outputDir, `${fileName}.ts`);

      if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf-8');
        content = content.replace(
          /export const protobufPackage = /g,
          `export const ${fileName}ProtobufPackage = `
        );
        fs.writeFileSync(filePath, content);
      }
    });
  };

  const generateIndexFile = (outputDir: string, protoFiles: string[]) => {
    const lines: string[] = [];

    lines.push('// 类型和服务导出');
    protoFiles.forEach(protoFile => {
      const fileName = path.basename(protoFile, '.proto');
      lines.push(`export * from './${fileName}';`);
    });

    const indexPath = path.join(outputDir, 'index.ts');
    fs.writeFileSync(indexPath, lines.join('\n') + '\n');
  };

  fixDuplicateProtobufPackage(config.output.server, protoFiles);
  fixDuplicateProtobufPackage(config.output.bff, protoFiles);

  generateIndexFile(config.output.server, protoFiles);
  generateIndexFile(config.output.bff, protoFiles);

  console.log('gRPC code generated successfully!');
};

main();
