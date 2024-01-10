import { authService } from '../../auth/index.js';

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
    return res.status(200).json({
      message: 'Login successful',
      token: response.AuthenticationResult.IdToken
    })
  } catch (err) {
    return res.status(400).json({
      message: err.message
    })
  }
}