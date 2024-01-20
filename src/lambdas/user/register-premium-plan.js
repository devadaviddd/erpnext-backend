import { databases } from '../../databases/index.js';

async function getExistingTrialPlan(email) {
  const { dynamoDB } = databases;

  const record = await dynamoDB.queryItems({
    TableName: 'users',
    KeyConditionExpression: 'userTier = :pk AND email = :email',
    ExpressionAttributeValues: {
      ':pk': 'trial',
      ':email': email,
    },
  });

  const items = record.Items;
  const user = items[0];

  if (user) {
    return {
      site: user.site,
      sitePassword: user.sitePassword,
    };
  } else {
    return null;
  }
}

export const registerPremiumPlan = async (req, res) => {
  const userEmail = req.userEmail;
  const { dynamoDB } = databases;

  const tableName = dynamoDB.getTable('users');
  if (!tableName) {
    res.status(500).json({ error: 'Table name not found' });
  }

  try {
    const existingTrialPlan = await getExistingTrialPlan(userEmail);

    if (existingTrialPlan) {
      await dynamoDB.deleteItem({
        TableName: 'users',
        Key: {
          userTier: 'trial',
          email: userEmail,
        },
      });
    }
    await dynamoDB.putItem({
      TableName: 'users',
      Item: {
        userTier: 'premium',
        email: userEmail,
        isExpired: false,
      },
    });
    res.status(200).json({ message: 'Register premium plan successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
