var jwt = require('jsonwebtoken');
const fetchuser = (req, res, next) => {
  // Retrieve the JWT token from the request headers
  const token = req.header('auth-token');
  var JWT_SECRET = "tarun";

  if (!token) {
    return res.status(401).json({ error: "Please authenticate using a valid token" });
  }

  try {
    // Verify and extract user data from the token
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data.user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Please authenticate using a valid token" });
  }
};

module.exports = fetchuser;