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
  let statusCode
  let body

  if (account === undefined) {
    statusCode = 404
    body = {
      success: false,
      message: 'Address not registered in Rossignol DB'
    }
  } else {
    statusCode = 200
    body = {
      success: true,
      message: 'Address account data successfully retrieved from Rossignol DB',
      data: account
    }
  }

  return {
    statusCode: statusCode,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
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
