const aws = require('aws-sdk');

const dynamoDBClient = new aws.DynamoDB.DocumentClient();
const table = process.env.DYNAMO_DB_TABLE_NAME;

const { getLogger } = require('./logger');
const logger = getLogger('ROSSIGNOL');

const {
  CryptoUtils: {
    generatePrivateKey, publicKeyFromPrivateKey, Uint8ArrayToB64,
  },
  LocalAddress: {
    fromPublicKey,
  },
} = require('loom-js');

const buildAccount = () => {
  const privateKey = generatePrivateKey();
  const publicKey = publicKeyFromPrivateKey(privateKey);
  const address = fromPublicKey(publicKey).toString();

  return {
    private_key: Uint8ArrayToB64(privateKey),
    public_key: Uint8ArrayToB64(publicKey),
    address,
  };
};

const saveAccount = async (account) => {
  const params = {
    TableName: table,
    Item: account,
  };

  await dynamoDBClient.put(params).promise();
};

const createAccount = async () => {
  const account = buildAccount();
  await saveAccount(account);

  logger.info(`Created new sidechain account at address ${account.address}`);

  return account;
};

const getAccount = async (address) => {
  const params = {
    TableName: table,
    Key: {
      address,
    },
  };

  const { Item: result } = await dynamoDBClient.get(params).promise();

  logger.info(`Retrieved sidechain account data for address ${address}`);

  return result;
};

module.exports = {
  createAccount,
  getAccount,
};
