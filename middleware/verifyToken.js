const jwt = require("jsonwebtoken");

module.exports = async function (req, res, next) {
  if (!req.session.authorization) return res.status(401).send("Access Denied");
  const token = req.session.authorization;

  try {
    const verified = jwt.verify(token, process.env.JWT_TOKEN_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    return res.status(400).send("Invalid Token");
  }
};
