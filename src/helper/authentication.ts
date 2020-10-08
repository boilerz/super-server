import { ResolverData } from 'type-graphql';
import logger from '@boilerz/logger';
import jwt from 'jsonwebtoken';

export interface AuthCoreContext {
  accessToken: string | null;
}

interface DecodedToken {
  id: string;
  exp: number;
  iat: number;
  firstName: string;
  lastName: number;
  roles: string[];
}

function isAccessTokenValid(token: string, allowedRoles: string[]): boolean {
  try {
    const { exp, roles: userRoles }: DecodedToken = jwt.decode(
      token,
    ) as DecodedToken;

    if (!userRoles.some((userRole) => allowedRoles.includes(userRole))) {
      return false;
    }

    return exp * 1000 - Date.now() > 0;
  } catch (err) {
    logger.error({ err }, '[helper.getAccessToken] Unknown');
    return false;
  }
}

export function authChecker(
  { context }: ResolverData<AuthCoreContext>,
  roles: string[],
): boolean {
  const { accessToken } = context;

  return !!accessToken && isAccessTokenValid(accessToken!, roles);
}
