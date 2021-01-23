import _ from 'lodash';
import { ResolverData } from 'type-graphql';

import logger from '@boilerz/logger';

export interface DecodedToken {
  id: string;
  exp: number;
  iat: number;
  firstName: string;
  lastName: number;
  roles: string[];
}

export interface AuthCoreContext {
  accessToken: string | null;
  decodedToken: DecodedToken | null;
}

function isAccessTokenValid(
  decodedToken: DecodedToken,
  allowedRoles: string[],
): boolean {
  try {
    const { exp, roles: userRoles }: DecodedToken = decodedToken;

    if (
      !_.isEmpty(allowedRoles) &&
      !userRoles.some((userRole) => allowedRoles.includes(userRole))
    ) {
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
  const { decodedToken } = context;

  return !!decodedToken && isAccessTokenValid(decodedToken!, roles);
}
