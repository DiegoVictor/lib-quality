# LibQuality
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/DiegoVictor/lib-quality/CI?logo=github&style=flat-square)](https://github.com/DiegoVictor/lib-quality/actions)
[![mongoose](https://img.shields.io/badge/mongoose-5.13.2-green?style=flat-square&logo=mongo&logoColor=white)](https://mongoosejs.com/)
[![eslint](https://img.shields.io/badge/eslint-7.30.0-4b32c3?style=flat-square&logo=eslint)](https://eslint.org/)
[![airbnb-style](https://flat.badgen.net/badge/style-guide/airbnb/ff5a5f?icon=airbnb)](https://github.com/airbnb/javascript)
[![jest](https://img.shields.io/badge/jest-27.0.6-brightgreen?style=flat-square&logo=jest)](https://jestjs.io/)
[![coverage](https://img.shields.io/codecov/c/gh/DiegoVictor/lib-quality?logo=codecov&style=flat-square)](https://codecov.io/gh/DiegoVictor/lib-quality)
[![MIT License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](https://github.com/DiegoVictor/libquality/blob/master/LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)<br>
[![Run in Insomnia}](https://insomnia.rest/images/run.svg)](https://insomnia.rest/run/?label=LibQuality&uri=https%3A%2F%2Fgithub.com%2FDiegoVictor%2Flib-quality%2FInsomnia_2020-09-05.json)
[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/3419c923f3c15604cbab)

Allow users to search by project name and check issues status like opened issues, average days opened and deviation. The app use JWT to logins, validation, also a simple versioning was made.

## Table of Contents
* [Installing](#installing)
  * [Configuring](#configuring)
    * [MongoDB](#mongodb)
    * [.env](#env)
* [Usage](#usage)
  * [Bearer Token](#bearer-token)
  * [Versioning](#versioning)
  * [Routes](#routes)
    * [Requests](#requests)
* [Running the tests](#running-the-tests)
  * [Coverage report](#coverage-report)

# Installing
Easy peasy lemon squeezy:
```
$ yarn
```
Or:
```
$ npm install
```
> Was installed and configured the [`eslint`](https://eslint.org/) and [`prettier`](https://prettier.io/) to keep the code clean and patterned.

## Configuring
The application use just one database: [MongoDB](https://www.mongodb.com/). For the fastest setup is recommended to use [docker-compose](https://docs.docker.com/compose/), you just need to up all services:
```
$ docker-compose up -d
```

### MongoDB
Store searchs terms, users searchs by session and the users utilized by the application. If for any reason you would like to create a MongoDB container instead of use `docker-compose`, you can do it by running the following command:
```
$ docker run --name libquality-mongo -d -p 27017:27017 mongo
```

### .env
In this file you may configure your MongoDB's database connection, JWT settings and app's port. Rename the `.env.example` in the root directory to `.env` then just update with your settings.

|key|description|default
|---|---|---
|APP_PORT|Port number where the app will run.|`3333`
|JWT_SECRET|A alphanumeric random string. Used to create signed tokens.| -
|JWT_EXPIRATION_TIME|How long time will be the token valid. See [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken#usage) repo for more information.|`7d`
|MONGO_HOST|MongoDB host.|`mongodb`
|MONGO_PORT|MongoDB port.|`6379`
|MONGO_DB|Database name.|`libquality`

# Usage
To start up the app run:
```
$ yarn dev:server
```
Or:
```
npm run dev:server
```

## Error Handling
Instead of only throw a simple message and HTTP Status Code this API return friendly errors:
```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Missing authorization token",
  "code": 240,
  "docs": "https://github.com/DiegoVictor/lib-quality#errors-reference"
}
```
> Errors are implemented with [@hapi/boom](https://github.com/hapijs/boom). As you can see an url to error docs are returned too. To configure this url update the `DOCS_URL` key from `.env` file. In the next sub section ([Errors Reference](https://github.com/DiegoVictor/lib-quality#errors-reference)) you can see the errors code description.

### Errors Reference
code|message|description
---|---|---
|140|Email already in use|An user with the same email already exists.
|141|User and/or password does not match|Password not match.
|144|User and/or password does not match|An user with the provided email was not found.
|240|Missing authorization token|The `Authorization` header was not sent.
|241|Token expired or invalid|The Bearer token provided is expired or invalid.
|350|An error occured while trying to get repositories list|The repositories search fail.
|351|An error occured while trying to get repositories|The tentative to get user's repositories fail.
|352|An error occured while trying to get repositories' issues|The request fail when trying to load repositories' issues.
|440|Resource not found|The url requested was not found.

## Bearer Token
A few routes expect a Bearer Token in an `Authorization` header.
> You can see these routes in the [routes](#routes) section.
```
GET http://localhost:3333/v1/repositories/libquality Authorization: Bearer <token>
```
> To achieve this token you just need authenticate through the `/sessions` route and it will return the `token` key with a valid Bearer Token.

## Versioning
A simple versioning was made. Just remember to set after the `host` the `/v1/` string to your requests.
```
GET http://localhost:3333/v1/repositories/libquality
```

## Routes
|route|HTTP Method|params|description|auth method
|:---|:---:|:---:|:---:|:---:
|`/sessions`|POST|Body with user's `email` and `password`.|Authenticates user, return a Bearer Token and user's id and session.|:x:
|`/users`|POST|Body with user's `email` and `password`.|Create a new user.|:x:
|`/repositories/:projectName`|GET|`:projectName` to search for.|Search repositories in GitHub and return suggestions.|:heavy_check_mark:
|`/analytics/:user/:repository`|GET|`:user` and `:repository` from a GitHub's repository (`full name`).|Return repository's name, open issues count, days opened average and days opened deviation.|:heavy_check_mark:
|`/analytics/chart`|GET|`repository[0]`, `repository[1]` ... `repository[n]`, repository full name| Return data to fill a chart of lines ([Chart.js](https://www.chartjs.org). You can see an example inside `demo` folder.)

> Routes with auth method expect an `Authorization` header. See [Bearer Token](#bearer-token) section for more information.

### Requests
* `POST /session`

Request body:
```json
{
  "email": "johndoe@example.com",
  "password": "123456"
}
```

* `POST /users`

Request body:
```json
{
  "email": "johndoe@example.com",
  "password": "123456"
}
```

# Running the tests
[Jest](https://jestjs.io/) was the choice to test the app, to run:
```
$ yarn test
```
Or:
```
$ npm run test
```

## Coverage report
You can see the coverage report inside `tests/coverage`. They are automatically created after the tests run.
