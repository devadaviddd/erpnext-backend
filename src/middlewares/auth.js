export const authMiddleware = async (req, res, next) => {
  const { requestContext } = req;
  console.log('requestContext', requestContext);
  const { authorizer } = requestContext;

  if (!authorizer) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!authorizer.claims) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  // set claims to req
  req.userEmail = authorizer.claims.email;
  next();
}