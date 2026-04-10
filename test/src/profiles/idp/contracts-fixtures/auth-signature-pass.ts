import type { AuthApi, LoginResult } from '@csisp-api/idp-server';

type AuthLoginSignature = AuthApi['authLogin'];

const authLoginImpl: AuthLoginSignature = (authLoginRequestParams, request) => {
  void authLoginRequestParams.loginInternalDto.email;
  void request;
  return { stepUp: 'PENDING_PASSWORD' } as LoginResult;
};

void authLoginImpl;
