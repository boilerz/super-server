# @boilerz/super-server-auth-core

[![GitHub package.json version](https://img.shields.io/github/package-json/v/boilerz/super-server-auth-core)](https://www.npmjs.com/package/@boilerz/super-server-auth-core)
[![GH CI Action](https://github.com/boilerz/super-server-auth-core/workflows/CI/badge.svg)](https://github.com/boilerz/super-server-auth-core/actions?query=workflow:CI)
[![codecov](https://codecov.io/gh/boilerz/super-server-auth-core/branch/master/graph/badge.svg)](https://codecov.io/gh/boilerz/super-server-auth-core)

> Core module for authentication support on super server

### Install

```bash
npx install-peerdeps @boilerz/super-server-auth-core
```

### Usage

This plugin add support for a sign up resolver and it is required for other `super-server-auth-*` plugin.
It need a mongo setup to work so the plugin `@boilerz/super-server-mongo` need to be set before this one.

```typescript
import { Arg, Query, Resolver } from 'type-graphql';
import * as superServer from '@boilerz/super-server';
import mongoPlugin from '@boilerz/super-server-mongo';
import authCorePlugin from '@boilerz/super-server-auth-core';

@Resolver()
class GreetingResolver {
  @Query(() => String)
  public hello(@Arg('name') name: string): string {
    return `Hello ${name}`;
  }
}

superServer
  .start({
    resolvers: [GreetingResolver],
    plugins: [mongoPlugin, authCorePlugin], // <-- Plugin here (after mongoPlugin)
  })
  .catch(console.error);
```

In situation example with local auth plugin [example](https://github.com/boilerz/super-server/blob/master/examples/withLocalAuth.ts)

If mail support is not disabled (@see `DISABLE_MAILING_SUPPORT` below) the worker process defined below should be setup: 

```bash
node node_modules/@boilerz/super-server-auth-core/worker/email
```

### Release

```bash
yarn version
yarn build
yarn publish dist --access public
```

# Env vars

## Web plugin

| Name                                        | Default                      | Description                                                                                                        |
|---------------------------------------------|------------------------------|--------------------------------------------------------------------------------------------------------------------|
| JWT_SECRET                                  | `Math.random().toString(36)` | JWT secret                                                                                                         |
| JWT_EXPIRE_IN                               | `30 * 60 * 1000`             | Token expiration in seconds.                                                                                       |
| DISABLE_MAILING_SUPPORT                     | `false`                      | Disable mailing support.                                                                                           |
| EXTERNAL_PROVIDER_LINK_CODE_EXPIRES_DURATION| `2`                          | External provider link code expiration in hours.                                                                   |
| EMAIL_VALIDATION_EXPIRES_DURATION           | `48`                         | Validation code expiration in hours.                                                                               |
| AMQP_URL                                    | `amqp://localhost`           | AMQP url (*used for communication between the plugin and the email validation worker*).                            |

## Email validation worker

| Name                                        | Default                   | Description                                                                                                        |
|---------------------------------------------|---------------------------|--------------------------------------------------------------------------------------------------------------------|
| SENDGRID_API_KEY                            |                           | Sendgrid API Key for email validation.                                                                             |
| SENDER_EMAIL                                |                           | Sendgrid sender email (must be validated by sendgrid).                                                             |
| EMAIL_VALIDATION_TEMPLATE_ID                |                           | Sendgrid validation email template id. (Must handle `firstName`, `lastName` and `validationUrl` as template data). |
| LINK_ACCOUNT_TEMPLATE_ID                    |                           | Sendgrid link account template id. (Must handle `firstName`, `lastName` and `linkCode` as template data).          |
| WAITING_DURATION_BEFORE_NEXT_EMAIL_ATTEMPT  | `5000`                    | Waiting duration in ms between two email validation attempt.                                                       |
| AMQP_URL                                    | `amqp://localhost`        | See above                                                                                                              |
