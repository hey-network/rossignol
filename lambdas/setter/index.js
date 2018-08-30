const {
  CryptoUtils,
  LocalAddress
} = require('loom-js')
const AWS = require('aws-sdk')
const TABLE_NAME = 'rossignol_accounts'

//
// ██╗  ██╗███████╗██╗     ██████╗ ███████╗██████╗ ███████╗
// ██║  ██║██╔════╝██║     ██╔══██╗██╔════╝██╔══██╗██╔════╝
// ███████║█████╗  ██║     ██████╔╝█████╗  ██████╔╝███████╗
// ██╔══██║██╔══╝  ██║     ██╔═══╝ ██╔══╝  ██╔══██╗╚════██║
// ██║  ██║███████╗███████╗██║     ███████╗██║  ██║███████║
// ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝     ╚══════╝╚═╝  ╚═╝╚══════╝
//
const createAccount = () => {
  const privateKey = CryptoUtils.generatePrivateKey()
  const publicKey = CryptoUtils.publicKeyFromPrivateKey(privateKey)
  const address = LocalAddress.fromPublicKey(publicKey).toString()

  return {
    private_key: Array.from(privateKey),
    public_key: Array.from(publicKey),
    address: address
  }
}

const saveAccount = async (account) => {
  const dynamoDBClient = new AWS.DynamoDB.DocumentClient()
  const table = TABLE_NAME

  const params = {
    TableName: table,
    Item: account
  }

  await dynamoDBClient.put(params).promise()
}

const buildResponse = (account) => {
  const headers = {
    'Content-Type': 'application/json'
  }

  return {
    statusCode: 200,
    headers: headers,
    body: JSON.stringify({
      data: {
        address: account.address
      }
    })
  }
}

//
// ███╗   ███╗ █████╗ ██╗███╗   ██╗
// ████╗ ████║██╔══██╗██║████╗  ██║
// ██╔████╔██║███████║██║██╔██╗ ██║
// ██║╚██╔╝██║██╔══██║██║██║╚██╗██║
// ██║ ╚═╝ ██║██║  ██║██║██║ ╚████║
// ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝
//
exports.handler = async (event) => {
  const account = createAccount()
  await saveAccount(account)
  const response = buildResponse(account)

  return response
}
