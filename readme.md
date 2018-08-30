# Rossignol Key Broker

## Interface

## Lambdas deployment

### Building web3 for Lambdas
All interactions with the Blockchain use the standard `web3` library. This is a heavy library that comes packaged with plenty of dependencies. Amongst those is a dependency on `scrypt`, a cryptography package written in C, that must be compiled when installing the dependency. Unfortunately the compilation must be made on a machine similar to the target machine (Ubuntu for the Lambdas): this means that running `npm install` on a Mac or Windows machine will provide dependencies that will not work once deployed on the Lambda.

Fortunately there is a workaround to this: using Docker. Just install and run the Docker daemon, then in the Lambda folder run the following command:

```
docker run -it -v $(pwd):/src node:8.10 bash
```

This will spin an Ubuntu machine container that will share the current volume with the host machine (that's the purpose of the `-v` command, followed by a `from:to` mapping instruction. Once you're in the container, you can safely go to the `src` directory containing `package.json` and run `npm install`. Once done, kill the container: you'll see that the dependencies have been correctly installed - and in particular the `scrypt` cryptography package has been build for an Ubuntu machine. It can thus now be deployed to a Lambda with no problem.

### Setting up deployment access on AWS

### Deployment workflow

### DynamoDB setup

### Good to know
