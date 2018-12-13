const {
  createAccount,
  getAccount,
} = require('./accounts');

const buildResponse = (data, message) => ({
  statusCode: 200,
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    success: true,
    message,
    data,
  }),
});

exports.setter = async () => {
  const account = await createAccount();
  const { address } = account;
  const response = buildResponse({ address }, 'successfully created account');
  return response;
};

exports.getter = async (event) => {
  const { address } = event.queryStringParameters;
  const account = await getAccount(address);
  const response = buildResponse(account, 'successfully retrieved account');
  return response;
};
