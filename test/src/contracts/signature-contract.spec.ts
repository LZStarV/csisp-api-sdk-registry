import path from 'path';

import { describe, expect, it } from 'vitest';

import { resolveActiveProfile, resolveActiveProfileName } from '../profiles';
import { runContractTypecheck } from '../template/contract-harness';

describe('server contract signatures', () => {
  const activeProfile = resolveActiveProfile();
  const profileName = resolveActiveProfileName();
  const contractsDir = path.resolve(
    process.cwd(),
    activeProfile.contractFixturesDir
  );
  for (const testCase of activeProfile.contractCases) {
    it(testCase.name, () => {
      const result = runContractTypecheck(contractsDir, testCase.projectFile);
      expect(result.ok).toBe(testCase.shouldPass);
      if (testCase.outputIncludes) {
        expect(result.output).toContain(testCase.outputIncludes);
      }
    });
  }
  it('contract case list should not be empty', () => {
    expect(activeProfile.contractCases.length).toBeGreaterThan(0);
  });
  it('active profile should be resolved', () => {
    expect(profileName.length).toBeGreaterThan(0);
  });
});
