# Rossignol

## Overview
While we wait for a super ergonomic wallet, we perform sidechain accounts management on behalf of Hey users. This is an very sensitive service as it contains all user accounts data. Please read carefully.

Note that in the future we plan to improve security of the underlying DB (a DynamoDB). For now it is already encrypted at rest - next we could consider sharding across multiple service providers.

## Infrastructure setup

### AWS DynamoDB
You need to have a DynamoDB table setup for the target environment, typically `rossignol_staging` and `rossignol_production`. The table must have 1 primary partition key named address under the string type, and no sort key. Make sure that the table is encrypted at rest (you need to overwrite default table creation options for this)!

### AWS API Gateway
The API Gateway can be configured directly from the Lambda console, selecting the "Open with access key" security option. Note that the authentication happens with the following header parameter: `X-Api-Key: API_KEY_HERE`.

### AWS Lambda
The Lambdas must use a `node 8.10` runtime and be given a role that allows it to access DynamoDB (typically LambdaFullAccess). Note that there are 2 Lambda functions, `setter` and `getter`, that use the same code but just have different entry points setup from the AWS console (`setter` uses `index.setter` while `getter` uses `index.getter`). While we introduce a bit of duplication here by uploading the same code twice, it reduces the maintenance workload while allowing us to reason on the full accounts lifecycle in one single repository of code.

# Deployment

## Building Web3 for Lambdas
All interactions with the Blockchain use the standard web3 library. This is a heavy library that comes packaged with plenty of dependencies. Amongst those is a dependency on scrypt, a cryptography package written in C, that must be compiled when installing the dependency. Unfortunately the compilation must be made on a machine similar to the target machine (Ubuntu for the Lambdas): this means that running `npm install` on a Mac or Windows machine will provide dependencies that will not work once deployed on the Lambda.

Fortunately there is a workaround to this: using Docker. Just install and run the Docker daemon, then in the Lambda folder run the following command:

```
docker run -it -v $(pwd):/src node:8.10 bash
```

This will spin an Ubuntu machine container that will share the current volume with the host machine (that's the purpose of the `-v` flag, followed by a `from:to` mapping instruction. Once you're in the container, you can safely go to the `src` directory containing `package.json` and run `npm install`. Once done, kill the container: you'll see that the dependencies have been correctly installed - and in particular the scrypt cryptography package has been built for an Ubuntu machine. It can thus now be deployed to a Lambda with no problem.

## Deployment workflow

Simply run `npm run deploy:ENV:LAMBDA` (where `ENV` can be `staging` or `production` and `LAMBDA` can be `getter` or `setter`). This script zips the lambda code and its dependencies in a package file, then uploads it to AWS and updates the ENV variables of the Lambda. Note that you need to have run `npm install` before (see above section).
