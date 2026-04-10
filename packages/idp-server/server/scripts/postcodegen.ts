import fs from 'fs';
import path from 'path';

/**
 * 这个脚本用于修复 openapi-generator (typescript-nestjs-server) 官方生成器的一个 Bug
 * 在生成 OidcApi 时，生成器丢失了对 ClientInfo 类型的导入，导致 TypeScript 编译报错。
 * 并且它生成的 index.ts 也没有导出 api 和 models 目录的内容。
 *
 * 作用：在 codegen 结束后，自动去这些文件里把缺失的部分补全。
 */
function fixMissingImports() {
  const filesToFix = [
    path.join(__dirname, '../generated/api/OidcApi.ts'),
    path.join(__dirname, '../generated/controllers/OidcApi.controller.ts'),
  ];

  filesToFix.forEach(filePath => {
    try {
      if (!fs.existsSync(filePath)) {
        console.warn(`[postcodegen] File not found: ${filePath}`);
        return;
      }

      let content = fs.readFileSync(filePath, 'utf8');

      // 检查是否已经包含了 ClientInfo，避免重复替换
      if (!content.includes('import { ClientInfo')) {
        content = content.replace(
          /import \{ AuthorizationRequestInfo/g,
          'import { ClientInfo, AuthorizationRequestInfo'
        );
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(
          `[postcodegen] Successfully fixed imports in ${path.basename(filePath)}`
        );
      }
    } catch (err) {
      console.error(`[postcodegen] Failed to fix imports in ${filePath}:`, err);
    }
  });
}

function fixMissingExports() {
  const indexFilePath = path.join(__dirname, '../generated/index.ts');
  try {
    if (!fs.existsSync(indexFilePath)) return;

    let content = fs.readFileSync(indexFilePath, 'utf8');

    // 如果没有导出 models 和 api，手动加上
    if (!content.includes("export * from './models'")) {
      content += "\nexport * from './models';";
    }
    if (!content.includes("export * from './api'")) {
      content += "\nexport * from './api';";
    }

    fs.writeFileSync(indexFilePath, content, 'utf8');
    console.log(`[postcodegen] Successfully added missing exports to index.ts`);
  } catch (err) {
    console.error(`[postcodegen] Failed to fix exports in index.ts:`, err);
  }
}

fixMissingImports();
fixMissingExports();
