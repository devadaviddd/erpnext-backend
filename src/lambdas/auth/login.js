import { authService } from '../../auth/index.js';
import { databases } from '../../databases/index.js';


async function getUserCurrentPlan(email) {
  const isExpired = true;
  const { dynamoDB } = databases;

  const record = await dynamoDB.queryItems({
    TableName: 'users',
    IndexName: 'email-index',
    KeyConditionExpression: 'email = :email',
    FilterExpression: 'isExpired = :isExpired',
    ExpressionAttributeValues: {
      ':email': email,
      ':isExpired': isExpired,
    },
    ProjectionExpression: 'site, isExpired',
    ScanIndexForward: false,
  });
  const items = record.Items;
  // Check if items is defined and has at least one item
  if (!items || items.length === 0) {
    return {
      siteDomain: null,
      isExpired: false,
    };
  }
  const user = items[0];
  let siteDomain = null;
  if (user.site) {
    siteDomain = `${user.site}.vertex-erp.com`
  }
  return {
    siteDomain: siteDomain,
    isExpired: user.isExpired,
  };
}


export const login = async (req, res) => {
  const { email, password } = req.body;
  const USER_POOL_ID = process.env.USER_POOL_ID_LOCAL;
  const CLIENT_ID = process.env.CLIENT_ID_LOCAL;

  const params = {
    AuthFlow: 'ADMIN_NO_SRP_AUTH',
    UserPoolId: USER_POOL_ID,
    ClientId: CLIENT_ID,
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password
    }
  } 

  try {
    const response = await authService.adminInitiateAuth(params).promise();
    console.log(response.AuthenticationResult);

    const userCurrentPlan = await getUserCurrentPlan(email);
    console.log('userCurrentPlan', userCurrentPlan);

    return res.status(200).json({
      message: 'Login successful',
      token: response.AuthenticationResult.IdToken,
      domain: userCurrentPlan.siteDomain,
      isExpired: userCurrentPlan.isExpired,
    })
  } catch (err) {
    return res.status(400).json({
      message: err.message
    })
  }
}