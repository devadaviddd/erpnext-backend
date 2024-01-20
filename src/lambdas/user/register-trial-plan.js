import { databases } from '../../databases/index.js';


function expireInOneWeek () {
  const today = new Date();
  // const oneWeek = 7 * 24 * 60 * 60 * 1000;
  const tooWeek = 7 * 24 * 60 * 60 * 1000 * 2;
  const nextWeek = new Date(today.getTime() + tooWeek);
  return nextWeek.toDateString();
}

export const registerTrialPlan = async (req, res) => {
  const userEmail = req.userEmail;
  console.log('userEmail', userEmail);
  const { dynamoDB } = databases;

  const tableName = dynamoDB.getTable('users');
  if (!tableName) {
    res.status(500).json({ error: 'Table name not found' });
  }

  try {
    await dynamoDB.putItem({
      TableName: 'users',
      Item: {
        userTier: 'trial',
        email: userEmail,
        isExpired: false,
        dateExpired: expireInOneWeek()
      }
    });
    res.status(200).json({ message: 'Register trial plan successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}