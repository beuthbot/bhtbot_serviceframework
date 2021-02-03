# BHT Bot Service Framework

## Purpose

This library is meant to kickstart new BHT-Bot Service Applications and reduce any existing and future redundancies.

You can setup a new Service in just a few lines of code. All you have to care about is the implementation of your specific Service Implementations, while Service Communication and Types are offered by the framework.

Service communication is build w

The framework contains CommonJS and ES-Modules bundles.

## Get in touch

Here are some starting points if you want to get in touch with the code

Examples:
- Example Service written in Typescript: [https://github.com/beuthbot/beuthbot/tree/master/cat_microservice](https://github.com/beuthbot/beuthbot/tree/master/cat_microservice)
- Legacy NodeJS Service migrated to this Framework: [https://github.com/beuthbot/weather_microservice](https://github.com/beuthbot/weather_microservice)

Tests:
- Most of the features are also represented in extensive Tests, so you might find it helpful to take a look at [src/lib/service.spec.ts](src/lib/service.spec.ts)
 
Specs:
- Generated technical documentation can be found at: [https://beuthbot.github.io/bhtbot_serviceframework/](https://beuthbot.github.io/bhtbot_serviceframework/)

## Quick start a service

### Install

Install Dependency to your (node)app
```shell script
$ npm i @bhtbot/bhtbotservice
or
$ yarn add @bhtbot/bhtbotservice
```

### Init | Config | Port | Middleware

Inititalize the Service on a port, specified by process environment
```
import {Service, AppConfig} from '@bhtbot/bhtbotservice';
const config = new AppConfig();
config.port = process.env.CATS_PORT ? Number(process.env.CATS_PORT) : 3000;
const service = new Service('catService', config);
```

Other Options for config can be found here: https://beuthbot.github.io/bhtbot_serviceframework/classes/appconfig.html

For example, if you need to enable another Middleware for your service (like CORS in this example):

```
//...
import * as cors from 'cors';
//...
const config = new AppConfig();
config.addMiddleWare(cors());
const service = new Service('catService', config);
```

### Content Serives (Basic Endpoint)

This framework is especially meant for building "Content Services". The syntax of those requests is defined by the Gateway. 

The current structure of such gateway requests is defined in [https://beuthbot.github.io/bhtbot_serviceframework/classes/gatewayrequest.html](https://beuthbot.github.io/bhtbot_serviceframework/classes/gatewayrequest.html)

If you want to handle gateway requests, just listen for an endpoint name of your choice like so

```
/* Listen on endpoint /cat */
service.endpoint('cat', async (req: GatewayRequest, answ: GatewayAnswer)=>{
    return answ.setContent((await queryCat()).url).setCacheable(false);
})
```

In this simple use case we just return the provided answer with the generated output as content. 
In most use cases, a content service won't do any more communication-related stuff within the service itself.

### Utility Services (Advanced Endpoints)

If you happen to build a custom "Utility Service" you will probably need other Endpoints, because the default endpoint is bound to the gateway request structures, such as having an user, entities and intents

#### File Upload

Accept files as input for your service
```
  service.fileUploadEndpoint('upload', async (request, answer) => {
    const fileKeys = Object.keys(request.files);
    const firstFile: UploadedFile = <UploadedFile>request.files[fileKeys[0]];
    return answer.setContent(firstFile.name);
  });
```

#### File Answer

For passing Files as response of Gateway-Requests
```
service.endpoint(testEndpoint, async (_request, _answer) => {
    return FileAnswer.fromPath(testFilePathOGG);
});
```

#### Arbitrary Endpoints

If you need any special endpoint that can't be created with the given tools, feel free to register them like you usually would within an express server
```
service.expressApp.get('/custom', function(req, res) {
    res.send('Hello Custom endpoint')
})
```


## Contribution

Since this is a university project which will be passed to new students every semester with their own philosophies and goals, this framework is subject of heavy (breaking) changes.

To keep everybody in sync, any rules and changes made to the project must be visible within this repository.

All rules and pipelines must be implemented as a script withing [package.json](./package.json)

### Building

For development you can use convenient watchers that will rebuild on file change

```
$ npm watch:build
$ npm watch:test
```

Release builds are triggered by
```
$ npm build:main
$ npm build:module
```

### Lint & beautify

Some code cleanup is done by `fix` scripts and validated by `test` scripts

```
$npm run fix:prettier
$npm run fix:lint
$npm run test:prettier
$npm run test:lint
$npm run test:spelling
```

### Test

There are unit tests as well as coverage checks
```
$ npm run test: unit
$ npm run cov
```

### Releasing

#### Deployment
The final release script combines all the steps into a single pipeline which also heightens the build version in package.json and commits the version as a tag for the repository.

This will also generate the docs with `npm run doc` which will be published to [github pages](https://beuthbot.github.io/bhtbot_serviceframework)
```
$ # npm run reset-hard # BEWARE: this will clear your working tree. make sure every changes you want to publish are commited
$ npm run prepare-release
```

#### Publishing
After the build pipeline is finished, you will be provided with information about how to publish, which essentially means pushing your code to the git repository and publishing the build to npmjs

```
$ git push --tags
$ npm publish
```

#### Versioning / Changelog
The Patch-Versioning is done automagically by the prepare-release script. 
Feature and Major releases can be set manually or with help of `npm run standard-version`
You should also consider adding notes to the [CHANGELOG.md](./CHANGELOG.md)

### Credits 
Credits to Bitjson for providing a mature Typescript starter template https://github.com/bitjson/typescript-starter

Initial Work by Dennis Walz
