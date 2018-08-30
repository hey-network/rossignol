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
const getAccount = async (address) => {
  const dynamoDBClient = new AWS.DynamoDB.DocumentClient()
  const table = TABLE_NAME

  const params = {
    TableName: table,
    Key: {
      address: address
    }
  }

  const result = await dynamoDBClient.get(params).promise()

  return result.Item
}

const buildResponse = (account) => {
  const headers = {
    'Content-Type': 'application/json'
  }

  return {
    statusCode: 200,
    headers: headers,
    body: JSON.stringify({
      data: account
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
  const address = event.queryStringParameters.address
  const account = await getAccount(address)
  const response = buildResponse(account)

  return response
}
