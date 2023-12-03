import { databases } from '../databases/index.js';

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
    },
    FilterExpression: 'dateExpired = :date',
  }

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
          }
        }
      }
    })

    console.log('batchUpdateParams', batchUpdateParams);
    const newData = await dynamoDB.batchUpdate(batchUpdateParams, tableName);
    console.log('newData', newData);

    res.status(200).json({
      message: 'Scheduling expired plan successfully',
      newData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}