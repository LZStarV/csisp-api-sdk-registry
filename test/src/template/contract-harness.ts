import { execSync } from 'node:child_process';

export const runContractTypecheck = (cwd: string, projectFile: string) => {
  try {
    execSync(`pnpm exec tsc -p ${projectFile}`, {
      cwd,
      stdio: 'pipe',
    });
    return { ok: true, output: '' };
  } catch (error) {
    const stdout = Buffer.isBuffer((error as { stdout?: unknown }).stdout)
      ? ((error as { stdout: Buffer }).stdout.toString() ?? '')
      : '';
    const stderr = Buffer.isBuffer((error as { stderr?: unknown }).stderr)
      ? ((error as { stderr: Buffer }).stderr.toString() ?? '')
      : '';
    return { ok: false, output: `${stdout}\n${stderr}` };
  }
};
