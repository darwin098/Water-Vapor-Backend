const jwt = require('jsonwebtoken');
const secretKey = require('./secretKey');

function verifyRequestToken(req, res, next) {
  console.log(`verifying request token`);
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer')) {
    return res
      .status(403)
      .send({ auth: 'False', message: 'Request Token Not authorized!' });
  }
  const token = authHeader.replace('Bearer ', '');
  return jwt.verify(
    token,
    'requestToken2299',
    { algorithms: ['HS256'] },
    (err, decoded) => {
      if (err) {
        console.log(err.message)
        if (err.message === `jwt expired`) {
          return res
            .status(403)
            .send({ auth: 'false', message: 'Request Token Expired!' });
        }
        return res
          .status(403)
          .send({ auth: 'false', message: 'Request Token Not authorized!' });
      }
      req.decode = decoded;
      req.userid = decoded.userID;
      console.log(decoded);
      req.role = decoded.role;
      return next();
    }
  );
}

function verifyAccessToken(req, res, next) {
  console.log(`verifying access token`);
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer')) {
    return res
      .status(403)
      .send({ auth: 'False', message: 'Access Token Not authorized!' });
  }
  const token = authHeader.replace('Bearer ', '');
  return jwt.verify(
    token,
    secretKey,
    { algorithms: ['HS256'] },
    (err, decoded) => {
      if (err) {
        console.log(err.message)
        if (err.message === `jwt expired`) {
          return res
            .status(403)
            .send({ auth: 'false', message: 'Access Token Expired!' });
        }
        return res
          .status(403)
          .send({ auth: 'false', message: 'Access Token Not authorized!' });
      }
      req.decode = decoded;
      req.userid = decoded.userID;
      console.log(decoded);
      req.role = decoded.role;
      return next();
    }
  );
}

function verifyRequestTokenFromSocket(reqToken) {
  return jwt.verify(
    reqToken,
    'requestToken2299',
    { algorithms: ['HS256'] },
    (err, decoded) => {
      if (err) {
        if (err.message === `jwt expired`) {
          return 'Request Token Expired!';
        }
        return 'Request Token Not authorized!';
      }
      userid = decoded.userID;
      role = decoded.role;

      return { userid, role };
    }
  );
}

exports.verifyRequestToken = verifyRequestToken;
exports.verifyAccessToken = verifyAccessToken;
exports.verifyRequestTokenFromSocket = verifyRequestTokenFromSocket;
