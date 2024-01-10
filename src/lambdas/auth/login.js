import { authService } from '../../auth/index.js';
import { databases } from '../../databases/index.js';


async function getUserSiteDomain(email) {
  const { dynamoDB } = databases;

  const record = await dynamoDB.queryItems({
    TableName: 'users',
    IndexName: 'email-index',
    KeyConditionExpression: 'email = :email',
    ExpressionAttributeValues: {
      ':email': email,
    },
    ProjectionExpression: 'site',
    ScanIndexForward: false,
  });
  const items = record.Items;
  // Check if items is defined and has at least one item
  if (!items || items.length === 0) {
    return null;
  }
  const user = items[0];
  const siteName = user.site;
  if (!siteName) {
    return null;
  }

  const siteDomain = `${user.site}.vertex-erp.com`;
  return siteDomain;
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

    const siteDomain = await getUserSiteDomain(email);

    return res.status(200).json({
      message: 'Login successful',
      token: response.AuthenticationResult.IdToken,
      domain: siteDomain
    })
  } catch (err) {
    return res.status(400).json({
      message: err.message
    })
  }
}