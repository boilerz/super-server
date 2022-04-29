import { GraphQLError, GraphQLFormattedError } from 'graphql';

import logger from '@boilerz/logger';

export interface FormattedError extends GraphQLFormattedError {
  code?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context?: any;
}

export function formatError(error: GraphQLError): FormattedError {
  const { originalError, message, locations, path } = error;
  const formattedError: FormattedError = { message, locations, path };

  logger.error({ formattedError, err: originalError }, '[graphql.formatError]');

  return formattedError;
}
