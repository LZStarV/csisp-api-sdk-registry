import * as fs from 'fs';
import * as path from 'path';

import { describe, expect, it } from 'vitest';

describe('Spec Scripts Tests', () => {
  const specDir = path.join(__dirname, '..', '..');
  const scriptsDir = path.join(specDir, 'scripts');

  describe('File Existence', () => {
    it('should have openapi.json file', () => {
      const openapiPath = path.join(specDir, 'openapi.json');
      expect(fs.existsSync(openapiPath)).toBe(true);
    });

    it('should have openapi.servers.json file', () => {
      const openapiServersPath = path.join(specDir, 'openapi.servers.json');
      expect(fs.existsSync(openapiServersPath)).toBe(true);
    });

    it('should have apifox-export.ts script', () => {
      const scriptPath = path.join(scriptsDir, 'apifox-export.ts');
      expect(fs.existsSync(scriptPath)).toBe(true);
    });

    it('should have openapi-inject-servers.ts script', () => {
      const scriptPath = path.join(scriptsDir, 'openapi-inject-servers.ts');
      expect(fs.existsSync(scriptPath)).toBe(true);
    });
  });

  describe('File Content', () => {
    it('openapi.json should be a valid JSON file', () => {
      const openapiPath = path.join(specDir, 'openapi.json');
      expect(fs.existsSync(openapiPath)).toBe(true);
      const content = fs.readFileSync(openapiPath, 'utf8');
      expect(() => JSON.parse(content)).not.toThrow();
    });

    it('openapi.servers.json should be a valid JSON file', () => {
      const openapiServersPath = path.join(specDir, 'openapi.servers.json');
      expect(fs.existsSync(openapiServersPath)).toBe(true);
      const content = fs.readFileSync(openapiServersPath, 'utf8');
      expect(() => JSON.parse(content)).not.toThrow();
    });

    it('apifox-export.ts should contain expected content', () => {
      const scriptPath = path.join(scriptsDir, 'apifox-export.ts');
      expect(fs.existsSync(scriptPath)).toBe(true);
      const content = fs.readFileSync(scriptPath, 'utf8');
      expect(content).toContain('apifox');
      expect(content).toContain('export');
    });

    it('openapi-inject-servers.ts should contain expected content', () => {
      const scriptPath = path.join(scriptsDir, 'openapi-inject-servers.ts');
      expect(fs.existsSync(scriptPath)).toBe(true);
      const content = fs.readFileSync(scriptPath, 'utf8');
      expect(content).toContain('servers');
      expect(content).toContain('openapi.servers');
    });
  });

  describe('Directory Structure', () => {
    it('spec directory should exist', () => {
      expect(fs.existsSync(specDir)).toBe(true);
      expect(fs.statSync(specDir).isDirectory()).toBe(true);
    });

    it('scripts directory should exist', () => {
      expect(fs.existsSync(scriptsDir)).toBe(true);
      expect(fs.statSync(scriptsDir).isDirectory()).toBe(true);
    });
  });
});
