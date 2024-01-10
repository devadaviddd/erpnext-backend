import { databases } from '../../databases/index.js';
import serverDomain from '../../server/domain.js';

async function getSiteCredential(email) {
  console.log('email', email);
  const { dynamoDB } = databases;

  const record = await dynamoDB.queryItems({
    TableName: 'users',
    IndexName: 'email-index',
    KeyConditionExpression: 'email = :email',
    ExpressionAttributeValues: {
      ':email': email,
    },
    ProjectionExpression: 'site, sitePassword',
    ScanIndexForward: false,
  });
  const items = record.Items;
  const user = items[0];
  console.log('user', user);
  const site = user.site;
  const password = user.sitePassword;
  return { site, password };
}


export const configSite = async (req, res) => {
  const { email, siteName, sitePassword } = req.body;

  // Check if all fields are provided
  if (!email || !siteName || !sitePassword) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Create record and check if site exists
  const isCreateRouteSuccess = serverDomain.createSubDomain(siteName);
  if (!isCreateRouteSuccess) {
    return res.status(400).json({ message: 'Site name must be unique' });
  }

  // Save user details
  const { dynamoDB } = databases;
  const tableName = dynamoDB.getTable('users');

  if (!tableName) {
    return res.status(500).json({ error: 'Table name not found' });
  }

  const params = {
    TableName: 'users',
    IndexName: 'email-index',
    KeyConditionExpression: 'email = :email',
    ExpressionAttributeValues: {
      ':email': email
    },
  };

  try{
    const data = await dynamoDB.queryItems(params);
    console.log('data', data);

    const items = data.Items;
    if (!items || items.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const batchUpdateParams = items.map((item) => {
      return {
        PutRequest: {
          Item: {
            userTier: item.userTier,
            email: item.email,
            dateExpired: item.dateExpired,
            isExpired: item.isExpired,
            site: siteName,
            sitePassword: sitePassword,
          },
        },
      };
    });
    console.log('batchUpdateParams', batchUpdateParams);
    const newData = await dynamoDB.batchUpdate(batchUpdateParams, tableName);
    console.log('newData', newData);

    res.status(200).json({
      message: 'Config site successfully',
      siteName: siteName,
      sitePassword: sitePassword,
      siteDomain: `${siteName}.vertex-erp.com`,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }  
};

