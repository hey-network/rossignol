# Rossignol Key Broker

## Interface

### Setter

When `POST`ED, creates a new account along with public and private key. No body params needed. Returns the following:

```
{
  "data": {
    "address": "0x09911012db565b0d3b96c6db8f32190b7fb3b9bb"
  }
}
```

Requires `X-Api-Key` as header for authentication.

### Getter

When `GET`ED, returns a given account address along with public and private key. URL param needed is `address`. Returns the following:

```
{
  "success": true,
  "message": "Address account data successfully retrieved from Rossignol DB"
  "data": {
    "address": "0x09911012db565b0d3b96c6db8f32190b7fb3b9bb"
    "public_key": [93,13,158,150,160,187,130,1,84,230,29,44,191,69,161,40,82,45,82,161,27,191,76,127,166,31,203,197,94,139,4,172],
    "private_key": [98,137,158,75,171,157,85,76,154,239,108,83,104,236,70,114,89,95,156,97,253,5,220,67,159,242,168,221,84,63,37,27,93,13,158,150,160,187,130,1,84,230,29,44,191,69,161,40,82,45,82,161,27,191,76,127,166,31,203,197,94,139,4,172],
  }
}
```

Note that public and private keys conform to Loom specifications (string representations of `Uint8Array`s of lengths 32 and 64 respectively).

Requires `X-Api-Key` as header for authentication.

## DynamoDB setup

You need to have a DynamoDB table setup for the target environment, typically `rossignol_staging` and `rossignol_production`. The table must have 1 primary partition key named `address` under the `string` type, and no sort key. Make sure that the table is encrypted at rest (you need to overwrite default table creation options for this)!

## Lambdas deployment

### Building web3 for Lambdas

All interactions with the Blockchain use the standard `web3` library. This is a heavy library that comes packaged with plenty of dependencies. Amongst those is a dependency on `scrypt`, a cryptography package written in C, that must be compiled when installing the dependency. Unfortunately the compilation must be made on a machine similar to the target machine (Ubuntu for the Lambdas): this means that running `npm install` on a Mac or Windows machine will provide dependencies that will not work once deployed on the Lambda.

Fortunately there is a workaround to this: using Docker. Just install and run the Docker daemon, then in the Lambda folder run the following command:

```
docker run -it -v $(pwd):/src node:8.10 bash
```

This will spin an Ubuntu machine container that will share the current volume with the host machine (that's the purpose of the `-v` command, followed by a `from:to` mapping instruction. Once you're in the container, you can safely go to the `src` directory containing `package.json` and run `npm install`. Once done, kill the container: you'll see that the dependencies have been correctly installed - and in particular the `scrypt` cryptography package has been build for an Ubuntu machine. It can thus now be deployed to a Lambda with no problem.

### Setting up deployment access on AWS

As a prerequisite, you need to have the `aws-cli` installed on your machine.

#### Policy

We use the `lambdas-staging` policy:

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "lambda:*",
                "logs:*"
            ],
            "Resource": "*"
        }
    ]
}
```

#### Group

We use the `lambdas-staging-group` group.

#### User

Use a user that belongs to the `lambdas-staging-group` group, and copy its credentials in `~/.aws/credentials`:

```
[hey]
aws_access_key_id = ACCESS_KEY_ID_HERE
aws_secret_access_key = SECRET_ACCESS_KEY_HERE
region = eu-central-1
```

Note that it must be named `hey`, as this is the profile used for deployment in the `package.json` script.

### Deployment workflow

Simply run `npm run staging` or `npm run production` to deploy on target environment. This script zips the lambda code and its dependencies in a package file, then uploads it to AWS and updates the `ENV` variables of the Lambda. Note that you need to have run `npm install` before when there are dependencies (see 'Building web3 for Lambdas').

## API Gateway setup

The API Gateway can be configured directly from the Lambda console, selecting the "Open with access key" security option. Note that the authentication happens with the following header parameter: `X-Api-Key: API_KEY_HERE`.

## Manual testing

### Setter

```
curl -X POST \
  -H 'x-api-key:API_KEY' \
  -H 'Content-Type: application/json' \
  -i "https://28gksj7fhl.execute-api.eu-central-1.amazonaws.com/staging/RossignolSetterStaging"
```

### Getter

```
curl -X GET \
  -H 'x-api-key:API_KEY' \
  -H 'Content-Type: application/json' \
  -i "https://gu2e48i3kl.execute-api.eu-central-1.amazonaws.com/staging/RossignolGetterStaging?address=0x18219e7696130cb661d941e7c6d3d68a60fd015f"
```

## Other

Note that this service does NOT push the account creation event to the Loom chain - it works in silo with no connection to any other service. Contrarily to Ethereum, Loom requires each account to be "added" to the chain before it is made usable for transactions. This generally happens with a command in the form of

```
loomProvider.addAccounts([accountPrivateKey])
```

Therefore, you'll need to make sure that if the client consuming Rossignol services tries to perform a chain transaction on behalf of a given account, it first checks for the actual recording of that account on the chain.
