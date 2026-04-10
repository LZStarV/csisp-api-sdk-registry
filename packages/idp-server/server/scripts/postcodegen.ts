import fs from 'fs';
import path from 'path';

/**
 * 这个脚本用于修复 openapi-generator (typescript-nestjs-server) 官方生成器的一个 Bug
 * 在生成 OidcApi 时，生成器丢失了对 ClientInfo 类型的导入，导致 TypeScript 编译报错。
 *
 * 作用：在 codegen 结束后，自动去这些文件里把 `ClientInfo` 补回到 import 语句中。
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

fixMissingImports();
