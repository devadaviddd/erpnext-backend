import { databases } from '../../databases/index.js';

export const registerPremiumPlan = async (req, res) => {
  const userEmail = req.userEmail;
  const { dynamoDB } = databases;

  const tableName = dynamoDB.getTable('users');
  if (!tableName) {
    res.status(500).json({ error: 'Table name not found' });
  }

  try {
    await dynamoDB.putItem({
      TableName: 'users',
      Item: {
        userTier: 'premium',
        email: userEmail
      }
    });
    res.status(200).json({ message: 'Register premium plan successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }

}