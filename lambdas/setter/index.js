const {
  CryptoUtils: {
    generatePrivateKey, publicKeyFromPrivateKey, Uint8ArrayToB64
  },
  LocalAddress: {
    fromPublicKey
  }
} = require('loom-js')
const AWS = require('aws-sdk')
const TABLE_NAME = process.env.DYNAMO_DB_TABLE_NAME

//
// ██╗  ██╗███████╗██╗     ██████╗ ███████╗██████╗ ███████╗
// ██║  ██║██╔════╝██║     ██╔══██╗██╔════╝██╔══██╗██╔════╝
// ███████║█████╗  ██║     ██████╔╝█████╗  ██████╔╝███████╗
// ██╔══██║██╔══╝  ██║     ██╔═══╝ ██╔══╝  ██╔══██╗╚════██║
// ██║  ██║███████╗███████╗██║     ███████╗██║  ██║███████║
// ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝     ╚══════╝╚═╝  ╚═╝╚══════╝
//
const createAccount = () => {
  const privateKey = generatePrivateKey()
  const publicKey = publicKeyFromPrivateKey(privateKey)
  const address = fromPublicKey(publicKey).toString()

  return {
    private_key: Uint8ArrayToB64(privateKey),
    public_key: Uint8ArrayToB64(publicKey),
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
      success: true,
      message: 'Account successfully created and recorded',
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
