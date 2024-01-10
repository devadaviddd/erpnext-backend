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
  const siteCredential = await getSiteCredential(req.userEmail);
  const siteName = siteCredential.site;
  const sitePassword = siteCredential.password;

  console.log('siteName', siteName);

  const isCreateRouteSuccess = serverDomain.createSubDomain(siteName);
  if (!isCreateRouteSuccess) {
    res.status(400).json({ message: 'Site name must be unique' });
  }

  res.status(200).json({
    message: 'Config site successfully',
    siteName: siteName,
    sitePassword: sitePassword,
    siteDomain: `${siteName}.vertex-erp.com`,
  });

};
