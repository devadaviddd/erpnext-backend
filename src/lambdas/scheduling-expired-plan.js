import { databases } from '../databases/index.js';
import serverDomain from '../server/domain.js';
import { vertex } from '../server/vertex.js';
// import AWS from 'aws-sdk';

// const ses = new AWS.SES();

// async function sendExpiredSubscriptionEmail(email, siteName) {
//   const emailParams = {
//     Destination: {
//       ToAddresses: [email],
//     },
//     Message: {
//       Body: {
//         Text: {
//           Data: `
//           Hi ${siteName} team,

//           We hope this message finds you well. We would like to inform you that your subscription has come to an end. We appreciate your support and hope our services have been valuable to you.

//           If you have any questions or would like to renew your subscription, please don't hesitate to reach out to our support team. We're here to assist you in any way we can.

//           Thank you for being a part of our community, and we look forward to serving you again soon.

//           Best regards,
//           Vertex-ERP Team
//           `,
//           Charset: 'UTF-8',
//         },
//       },
//       Subject: {
//         Data: `Your subscription has come to an end for site ${siteName}`,
//         Charset: 'UTF-8',
//       },
//     },
//     Source: 'erpvertex@gmail.com',
//     ReplyToAddresses: ['erpvertex@gmail.com'],
//   };

//   const response = await ses.sendEmail(emailParams).promise();
//   return response;
// }

export const schedulingExpiredPlan = async (req, res) => {
  const today = new Date();
  const currentDate = new Date(today.getTime()).toDateString();
  console.log('currentDate', currentDate);

  const { dynamoDB } = databases;
  const tableName = dynamoDB.getTable('users');

  if (!tableName) {
    res.status(500).json({ error: 'Table name not found' });
  }

  const params = {
    TableName: 'users',
    KeyConditionExpression: 'userTier = :pk',
    ExpressionAttributeValues: {
      ':pk': 'trial',
      ':date': currentDate,
      ':isExpired': false,
    },
    FilterExpression: 'dateExpired = :date',
  };

  try {
    const data = await dynamoDB.queryItems(params);
    console.log('data', data);
    const items = data.Items;

    // drop site
    const dropSitesResponse = items.map(async (item) => {
      const siteName = item.site;
      console.log('siteName', siteName);
      const promise = new Promise((resolve, reject) => {
        vertex
          .exec(
            `bench  drop-site ${siteName} --db-root-password ${process.env.DB_PASSWORD}`,
            {
              out: (stdout) => {
                resolve(stdout);
              },
              err: (stderr) => {
                console.log('stderr', stderr);
                reject(stderr);
              },
            }
          )
          .start();
      });

      await promise;
    });

    await Promise.all(dropSitesResponse);

    // drop dns records
    const batchUpdateParams = items.map((item) => {
      return {
        PutRequest: {
          Item: {
            userTier: 'trial',
            email: item.email,
            dateExpired: item.dateExpired,
            isExpired: true,
          },
        },
      };
    });

    console.log('batchUpdateParams', batchUpdateParams);
    const newData = await dynamoDB.batchUpdate(batchUpdateParams, tableName);
    console.log('newData', newData);

    // send email to user
    // const sendEmailResponse = await sendExpiredSubscriptionEmail(
    //   items[0].email,
    //   items[0].site
    // );
    // console.log('sendEmailResponse', sendEmailResponse);

    res.status(200).json({
      message: 'Scheduling expired plan successfully',
      newData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Path: src/lambdas/scheduling-expired-plan.js using for sqs trigger
export const handler = async (req, res) => {
  const today = new Date();
  const currentDate = new Date(today.getTime()).toDateString();
  console.log('currentDate', currentDate);

  const { dynamoDB } = databases;
  const tableName = dynamoDB.getTable('users');

  if (!tableName) {
    res.status(500).json({ error: 'Table name not found' });
  }

  const params = {
    TableName: 'users',
    KeyConditionExpression: 'userTier = :pk',
    ExpressionAttributeValues: {
      ':pk': 'trial',
      ':date': currentDate,
      ':isExpired': false,
    },
    FilterExpression: 'dateExpired = :date AND isExpired = :isExpired',
  };

  try {
    const data = await dynamoDB.queryItems(params);
    console.log('data', data);
    const items = data.Items;


    const batchUpdateParams = items.map((item) => {
      return {
        PutRequest: {
          Item: {
            userTier: 'trial',
            email: item.email,
            dateExpired: item.dateExpired,
            isExpired: true,
            site: item.site,
            sitePassword: item.sitePassword,
          },
        },
      };
    });

    console.log('batchUpdateParams', batchUpdateParams);
    const newData = await dynamoDB.batchUpdate(batchUpdateParams, tableName);
    console.log('newData', newData);


    // drop site
    const dropSitesResponse = items.map(async (item) => {
      const siteName = item.site;
      console.log('siteName', siteName);
      const promise = new Promise((resolve, reject) => {
        vertex
          .exec(
            `bench  drop-site ${siteName} --force --db-root-password ${process.env.DB_PASSWORD}`,
            {
              out: (stdout) => {
                resolve(stdout);
              },
              err: (stderr) => {
                console.log('stderr', stderr);
                reject(stderr);
              },
            }
          )
          .start();
      });

      await promise;
    });

    await Promise.all(dropSitesResponse);

    // drop dns records
    const dropDNSrecords = items.map(async (item) => {
      const siteName = item.site;
      await serverDomain.dropSubDomain(siteName);
    })

    await Promise.all(dropDNSrecords);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Scheduling expired plan successfully',
        newData,
      }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
