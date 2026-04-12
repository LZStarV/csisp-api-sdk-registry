import { idpServiceProfile } from './idp/service-map';

export const profileRegistry = {
  idp: idpServiceProfile,
} as const;

export type ProfileName = keyof typeof profileRegistry;

export const resolveActiveProfileName = (): ProfileName => {
  const raw = (process.env.TEST_PROFILE ?? 'idp').trim().toLowerCase();
  if (raw in profileRegistry) {
    return raw as ProfileName;
  }
  const supported = Object.keys(profileRegistry).join(', ');
  throw new Error(
    `Unknown TEST_PROFILE: ${raw}. Supported profiles: ${supported}`
  );
};

export const resolveActiveProfile = () =>
  profileRegistry[resolveActiveProfileName()];
