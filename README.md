# @boilerz/super-server-auth-google

[![GitHub package.json version](https://img.shields.io/github/package-json/v/boilerz/super-server-auth-google)](https://www.npmjs.com/package/@boilerz/super-server-auth-google)
[![CircleCI](https://circleci.com/gh/boilerz/super-server-auth-google/tree/master.svg?style=shield)](https://circleci.com/gh/boilerz/super-server-auth-google/tree/master)
[![codecov](https://codecov.io/gh/boilerz/super-server-auth-google/branch/master/graph/badge.svg)](https://codecov.io/gh/boilerz/super-server-auth-google)

> Google oauth for super-server

### Install

```bash
npx install-peerdeps @boilerz/super-server-auth-google 
```

### Usage

Require `super-server-mongo` and `super-server-auth-core`.

Full example [here](https://github.com/boilerz/super-server-auth-google/blob/master/examples/minimal.ts)

# Env vars

| Name                                        | Default                                                                                           | Description                                                                                                        |
|---------------------------------------------|---------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------|
| SERVER_HOST                                 | `http://localhost:3000`                                                                           | Server host                                                                                                        |
| GOOGLE_OAUTH_SCOPE                          | `https://www.googleapis.com/auth/userinfo.profile,https://www.googleapis.com/auth/userinfo.email` | Oauth scope                                                                                                        |
| GOOGLE_CLIENT_ID                            |                                                                                                   | Client ID.                                                                                                         |
| GOOGLE_CLIENT_SECRET                        |                                                                                                   | Client secret.                                                                                                     |
| GOOGLE_FAILURE_REDIRECT                     | `/login`                                                                                          | Google failure redirect.                                                                                           |
| GOOGLE_LINK_PROVIDER_CALLBACK_URL           | `${SERVER_HOST}/auth/connect`                                                                     | Callback used for account linking.                                                                                 |

### Release

```bash
yarn version
yarn build
yarn publish dist --access public
```
