import { databases } from '../../databases/index.js';

export const createUser = async (req, res) => {
  const { body } = req;
  const { name, email, password, userTier } = body; 
  const { dynamoDB } = databases;
  console.log('Creating user...');
  const tableName = dynamoDB.getTable('users');

  if (!tableName) {
    res.status(500).json({ error: 'Table name not found' });
  }

  try {
    await dynamoDB.putItem({
      TableName: 'users',
      Item: {
        name,
        email,
        password,
        userTier
      }
    });
    res.status(200).json({ message: 'User created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}