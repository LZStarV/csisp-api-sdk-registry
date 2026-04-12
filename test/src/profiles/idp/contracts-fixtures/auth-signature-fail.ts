import type {
  AuthApi,
  LoginInternalDto,
  LoginResult,
} from '@csisp-api/idp-server';

type AuthLoginSignature = AuthApi['authLogin'];

const authLoginImpl: AuthLoginSignature = (
  loginInternalDto: LoginInternalDto,
  xTraceId: string | undefined,
  request: Request
) => {
  void loginInternalDto.email;
  void xTraceId;
  void request;
  return { stepUp: 'PENDING_PASSWORD' } as LoginResult;
};

void authLoginImpl;
