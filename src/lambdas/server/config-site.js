import { databases } from '../../databases/index.js';
import AWS from 'aws-sdk';

async function createRoute53Record(siteName) {
  const isCreateRouteSuccess = true;
  const route53 = new AWS.Route53();
  const hostedZoneId = 'Z0956807UI85NVKPHSTY';

  const params = {
    ChangeBatch: {
      Changes: [
        {
          Action: 'CREATE',
          ResourceRecordSet: {
            Name: `${siteName}.vertex-erp.com`,
            Type: 'A',
            TTL: 60,
            ResourceRecords: [
              {
                Value: '54.82.167.21',
              },
            ],
          },
        },
      ],
    },
    HostedZoneId: hostedZoneId,
  };

  try {
    await route53.changeResourceRecordSets(params).promise();
    return isCreateRouteSuccess;
  } catch (error) {
    console.error('Error creating Route53 record:', error);
    return !isCreateRouteSuccess;
  }
}

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

  const isCreateRouteSuccess = await createRoute53Record(siteName);
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
