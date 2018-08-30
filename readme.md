# Rossignol Key Broker

## Interface


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

### Testing from your machine

#### Setter

```
curl -X POST \
  -H 'x-api-key:API_KEY' \
  -H 'Content-Type: application/json' \
  -i "https://28gksj7fhl.execute-api.eu-central-1.amazonaws.com/staging/RossignolSetterStaging"
```

#### Getter

```
curl -X GET \
  -H 'x-api-key:API_KEY' \
  -H 'Content-Type: application/json' \
  -i "https://gu2e48i3kl.execute-api.eu-central-1.amazonaws.com/staging/RossignolGetterStaging?address=0x18219e7696130cb661d941e7c6d3d68a60fd015f"
```
