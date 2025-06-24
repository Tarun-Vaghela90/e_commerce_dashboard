var jwt = require('jsonwebtoken');
const fetchuser = (req, res, next) => {
  // Retrieve the JWT token from the request headers
  const token = req.header('authtoken');
  var JWT_SECRET = "tarun";

  if (!token) {
    return res.status(401).json({ error: "Please authenticate using a valid token" });
  }

  try {
    // Verify and extract user data from the token
    const data = jwt.verify(token, JWT_SECRET);
    console.log(data)
    req.user = data;
    console.log('Decoded user:', req.user);
console.log('Fetching products for user:', req.user.id);

    next();
  } catch (error) {
    res.status(401).json({ error: "Please authenticate using a valid token" });
  }
};

module.exports = fetchuser;