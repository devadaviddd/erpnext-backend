import { authService } from '../../auth/index.js';

export const signup = async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);
  const USER_POOL_ID = process.env.USER_POOL_ID_LOCAL;
  console.log(USER_POOL_ID);

  const params = {
    UserPoolId: USER_POOL_ID,
    Username: email,
    UserAttributes: [{
      Name: 'email',
      Value: email
    },
    {
      Name: 'email_verified',
      Value: 'true'
    }],
    MessageAction: 'SUPPRESS'
  }

  try {
    const response = await authService.adminCreateUser(params).promise();

    if (response.User) {
      const paramsForSetPassword = {
        Password: password,
        UserPoolId: USER_POOL_ID,
        Username: email,
        Permanent: true
      }
      try {
        await authService.adminSetUserPassword(paramsForSetPassword).promise();
      } catch (err) {

        // remove user if password setting fails
        const paramsForDeleteUser = {
          UserPoolId: USER_POOL_ID,
          Username: email
        }
        await authService.adminDeleteUser(paramsForDeleteUser).promise();

        res.status(400).json({
          message: 'Password should contain more than 6 characters'
        })
      }   
    }

    console.log(response);
    res.status(200).json({
      message: 'User created successfully',
      response: response
    })
  } catch (err) {
    if (err && err.code === 'UsernameExistsException') {
      res.status(400).json({
        message: 'User already exists'
      })
    } else {
      res.status(400).json({
        message: err.message
      })
    }
  }
}